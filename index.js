require("dotenv").config();
const BotFactory = require("./src/BotFactory");
const logger = require("./src/logger");
const path = require("path");
const fs = require("fs");

// プロセス終了ハンドリング用の変数
let bot = null;
let isShuttingDown = false;

async function main() {
  try {
    // ログディレクトリの作成
    await ensureLogDirectory();

    logger.info("=".repeat(50));
    logger.info(" Minecraft Bot 起動中...");
    logger.info("=".repeat(50));

    // 設定の表示
    await displayConfiguration();

    // ボットの作成
    bot = await createBot();

    // 正常起動の通知
    logger.info("=".repeat(50));
    logger.info("✅ Minecraft Bot が正常に起動しました！");
    logger.info(` ボット名: ${bot.username}`);
    logger.info(` サーバー: ${bot.host}:${bot.port}`);
    logger.info("=".repeat(50));

    // 定期的なヘルスチェック
    setupHealthMonitoring(bot);
  } catch (error) {
    logger.error("❌ ボットの起動に失敗しました:", error);

    // 詳細なエラー情報
    if (error.code) {
      logger.error(`エラーコード: ${error.code}`);
    }

    if (error.message.includes("ECONNREFUSED")) {
      logger.error(
        " ヒント: Minecraftサーバーが起動していることを確認してください。",
      );
    } else if (error.message.includes("getaddrinfo")) {
      logger.error(
        " ヒント: サーバーのホスト名またはIPアドレスを確認してください。",
      );
    } else if (error.message.includes("authentication")) {
      logger.error(" ヒント: ユーザー名またはパスワードを確認してください。");
    }

    process.exit(1);
  }
}

async function ensureLogDirectory() {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    logger.info(` ログディレクトリを作成しました: ${logDir}`);
  }
}

async function displayConfiguration() {
  const config = {
    host: process.env.BOT_HOST || "localhost",
    port: process.env.BOT_PORT || 25565,
    username: process.env.BOT_USERNAME || "MinecraftBot",
    hasPassword: !!(
      process.env.BOT_PASSWORD && process.env.BOT_PASSWORD.length > 0
    ),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || "development",
  };

  logger.info("⚙️  設定情報:");
  logger.info(`   ホスト: ${config.host}`);
  logger.info(`   ポート: ${config.port}`);
  logger.info(`   ユーザー名: ${config.username}`);
  logger.info(`   パスワード: ${config.hasPassword ? "設定済み" : "未設定"}`);
  logger.info(`   Node.js: ${config.nodeVersion}`);
  logger.info(`   プラットフォーム: ${config.platform}`);
  logger.info(`   環境: ${config.environment}`);
}

async function createBot() {
  const config = {
    connection: {
      bot: {
        host: process.env.BOT_HOST || "localhost",
        port: parseInt(process.env.BOT_PORT || "25565", 10),
        username: process.env.BOT_USERNAME || "MinecraftBot",
        password: process.env.BOT_PASSWORD || undefined,
      },
    },
    plugins: [
      // 必要に応じてプラグインを追加
      // 'autoFarm',
      // 'pathfinding',
      // 'inventory'
    ],
  };

  logger.info(" ボットを作成中...");
  return await BotFactory.create(config);
}

function setupHealthMonitoring(bot) {
  // 5分ごとのヘルスチェック
  const healthCheckInterval = setInterval(
    () => {
      if (isShuttingDown) {
        clearInterval(healthCheckInterval);
        return;
      }

      try {
        const health = BotFactory.getHealthStatus(bot);
        logger.debug("Health check:", health);

        // 問題が検出された場合の警告
        if (health.status === "error") {
          logger.warn("⚠️ ヘルスチェックで問題を検出:", health.message);
        }

        // エラー統計の確認
        if (health.errorStats && health.errorStats.totalErrors > 100) {
          logger.warn(
            `⚠️ エラーが多発しています (${health.errorStats.totalErrors}件)`,
          );
        }
      } catch (error) {
        logger.error("ヘルスチェック中にエラー:", error);
      }
    },
    5 * 60 * 1000,
  );

  // メモリ使用量の監視
  const memoryCheckInterval = setInterval(
    () => {
      if (isShuttingDown) {
        clearInterval(memoryCheckInterval);
        return;
      }

      const usage = process.memoryUsage();
      const mb = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

      logger.debug(
        `Memory usage: RSS=${mb(usage.rss)}MB, Heap=${mb(usage.heapUsed)}/${mb(usage.heapTotal)}MB, External=${mb(usage.external)}MB`,
      );

      // メモリリークの警告
      if (usage.heapUsed > 500 * 1024 * 1024) {
        // 500MB以上
        logger.warn("⚠️ メモリ使用量が多くなっています:", {
          heapUsed: mb(usage.heapUsed) + "MB",
          heapTotal: mb(usage.heapTotal) + "MB",
        });
      }
    },
    10 * 60 * 1000,
  );
}

// グレースフルシャットダウン
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn("すでにシャットダウン処理中です...");
    return;
  }

  isShuttingDown = true;
  logger.info(
    ` ${signal} シグナルを受信しました。グレースフルシャットダウンを開始します...`,
  );

  try {
    if (bot) {
      await BotFactory.shutdown(bot);
    }

    logger.info("✅ シャットダウンが完了しました。");
    process.exit(0);
  } catch (error) {
    logger.error("❌ シャットダウン中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// 未処理エラーのハンドリング
process.on("uncaughtException", (error) => {
  logger.error(" 未処理の例外が発生しました:", error);

  // 緊急シャットダウン
  if (bot) {
    try {
      bot.end();
    } catch (err) {
      logger.error("緊急シャットダウン中にエラー:", err);
    }
  }

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(" 未処理のPromise拒否が発生しました:", {
    reason: reason?.message || reason,
    promise: promise?.toString(),
  });

  // 非致命的な場合は継続
  if (
    reason?.message?.includes("timeout") ||
    reason?.message?.includes("ECONNRESET")
  ) {
    logger.info("⚠️ ネットワーク関連のエラーのため、処理を継続します");
    return;
  }

  // その他の場合は終了
  process.exit(1);
});

// プロセス終了シグナルのハンドリング
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Windowsのプロセス終了
if (process.platform === "win32") {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", () => {
    process.emit("SIGINT");
  });
}

// バージョン情報の表示
function showVersion() {
  const packageJson = require("./package.json");
  console.log(`${packageJson.name} v${packageJson.version}`);
  console.log(`Node.js ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  process.exit(0);
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  showVersion();
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Minecraft Bot

使用法:
  node index.js [オプション]

オプション:
  -h, --help     このヘルプメッセージを表示
  -v, --version  バージョン情報を表示

環境変数:
  BOT_HOST       サーバーのホスト (デフォルト: localhost)
  BOT_PORT       サーバーのポート (デフォルト: 25565)
  BOT_USERNAME   ボットのユーザー名 (デフォルト: MinecraftBot)
  BOT_PASSWORD   アカウントのパスワード (オプション)
  LOG_LEVEL      ログレベル (デフォルト: info)
  DEBUG          デバッグモード (true/false)

例:
  BOT_HOST=mc.example.com BOT_PORT=25566 node index.js
  `);
  process.exit(0);
}

// メイン処理の実行
if (require.main === module) {
  main().catch((error) => {
    logger.error("メイン処理で予期しないエラーが発生しました:", error);
    process.exit(1);
  });
}

module.exports = { main, gracefulShutdown };
