[English](#english) | [日本語](#日本語)

---

## English

# Minecraft Bot

A versatile Minecraft bot built with Node.js and the mineflayer library.

This bot can connect to a Minecraft server, listen to commands from chat, and perform various automated tasks.

---

## Features | 機能

- **Chat Command Handling**: Responds to in-game chat commands.
- **Basic Navigation**: Can move around the world.

- **Information Commands**: Provides information about the bot and the world.
- **Inventory Management**: Can list its own inventory.
- **Extensible**: Easily add new commands and features.

---

## Supported Versions | 対応バージョン

This bot is designed to work with Minecraft version **1.21**.

---

## Setup | セットアップ

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/musashimusashino18/minecraft-bot.git
    cd minecraft-bot
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root of the project by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Then, edit the `.env` file with your bot's details.

---

## Configuration | 設定

Edit the `.env` file to configure the bot.

- `BOT_HOST`: The server address (e.g., `localhost`, `mc.example.com`).
- `BOT_PORT`: The server port (default is `25565`).
- `BOT_USERNAME`: The bot's username for the server.
- `BOT_PASSWORD`: The password for the account (only for online-mode servers). Leave blank if not needed.

---

## Usage | 使い方

### Running the Bot | ボットの起動

To start the bot, run the following command:

```bash
npm start
```

### Available Commands | 利用可能なコマンド

The bot listens for commands in the game chat. You can type `help` or `ヘルプ` in the game chat to see a list of all available commands and their aliases.

Examples:

- `pos` or `位置`: Displays the bot's current position.
- `inv` or `インベントリ`: Shows the bot's inventory.
- `mine <block_name> [count]`: Mines a specified block.

---

#### Available Commands | 利用可能なコマンド

The bot listens for commands in the game chat. You can type `help` or `ヘルプ` in the game chat to see a list of all available commands and their aliases with descriptions.

Here's an overview of the command categories:

- **General Commands (general.js) | 汎用コマンド**:
  - `hello` (こんにちは): Greets the user.
  - `goodmorning` (おはよう): Greets the user in the morning.
  - `goodnight` (おやすみ): Greets the user at night.
  - `thanks` (ありがとう): Responds to thanks.

- **Information Commands (info.js) | 情報コマンド**:
  - `pos` (位置): Displays the bot's current position.
  - `health` (体力): Displays the bot's current health and hunger.
  - `time` (時間): Displays the current in-game time.
  - `players` (プレイヤー): Lists nearby players.
  - `mobs` (モブ): Lists nearby mobs.
  - `blocks` (ブロック): Lists nearby blocks.

- **Inventory Commands (inventory.js) | インベントリコマンド**:
  - `inv` (インベントリ): Displays the bot's inventory content.
  - `drop <item_name> [quantity]` (捨てる): Drops a specified item.
  - `collect [item_name]` (収集): Collects nearby dropped items.

- **Movement Commands (move.js) | 移動コマンド**:
  - `forward [seconds]` (前): Moves forward for a specified duration.
  - `back [seconds]` (後ろ): Moves backward for a specified duration.
  - `left [seconds]` (左): Moves left for a specified duration.
  - `right [seconds]` (右): Moves right for a specified duration.
  - `jump` (ジャンプ): Makes the bot jump.
  - `goto <x> <y> <z>` (移動): Moves to specified coordinates.
  - `come` (おいで): Moves to the player who issued the command.
  - `follow <player_name>` (ついてきて): Follows a specified player.

- **Stop Command (stop.js) | 停止コマンド**:
  - `stop` (停止): Stops all current bot actions.

- **World Interaction Commands (world.js) | ワールド操作コマンド**:
  - `mine <block_name> [count]` (採掘): Mines a specified block.
  - `chest <open|store>` (チェスト): Interacts with nearby chests (open or store items).
  - `build <tower|wall|floor> [size]` (建築): Builds a structure (currently only 'tower' is supported).

---

## Development | 開発

This project includes tools for linting, formatting, and testing.

- **Linting**: Check the code for style errors.

  ```bash
  npm run lint
  ```

- **Formatting**: Automatically format the code.

  ```bash
  npm run format
  ```

- **Testing**: Run the test suite.
  ```bash
  npm run test
  ```

---

## 日本語

# Minecraft Bot (マインクラフト・ボット)

Node.jsとmineflayerライブラリで構築された、多機能なMinecraftボットです。

Minecraftサーバーに接続し、チャット経由でコマンドを受け取り、様々なタスクを自動で実行することができます。

---

- **チャットコマンド**: ゲーム内のチャットコマンドに応答します。
- **基本的な移動**: ワールド内を移動できます。
- **情報取得**: ボットやワールドに関する情報を提供します。
- **インベントリ管理**: 自身のインベントリを一覧表示できます。
- **拡張性**: 新しいコマンドや機能を簡単に追加できます。

---

このボットはMinecraftバージョン **1.21** で動作するように設計されています。

---

1.  **リポジリをクローン:**

    ```bash
    git clone https://github.com/musashimusashino18/minecraft-bot.git
    cd minecraft-bot
    ```

2.  **依存関係をインストール:**

    ```bash
    npm install
    ```

3.  **環境変数の設定:**
    プロジェクトのルートに、サンプルファイルをコピーして`.env`ファイルを作成します。
    ```bash
    cp .env.example .env
    ```
    その後、`.env`ファイルを編集してボットの詳細情報を設定します。

---

`.env`ファイルを編集してボットを設定します。

- `BOT_HOST`: サーバーのアドレス (例: `localhost`, `mc.example.com`)
- `BOT_PORT`: サーバーのポート番号 (デフォルト: `25565`)
- `BOT_USERNAME`: ボットのユーザー名
- `BOT_PASSWORD`: アカウントのパスワード (オンラインモードのサーバーでのみ必要)。不要な場合は空欄にしてください。

---

### Running the Bot | ボットの起動

ボットを起動するには、次のコマンドを実行します。

```bash
npm start
```

#### 利用可能なコマンド

ボットはゲーム内チャットのコマンドを待ち受けます。ゲーム内チャットで `help` または `ヘルプ` と入力すると、利用可能なすべてのコマンドとそのエイリアスの一覧が表示されます。

例:

- `pos` または `位置`: ボットの現在位置を表示します。
- `inv` または `インベントリ`: ボットのインベントリを表示します。
- `mine <ブロック名> [数量]`: 指定したブロックを採掘します。

---

#### Available Commands | 利用可能なコマンド

ボットはゲーム内チャットのコマンドを待ち受けます。ゲーム内チャットで `help` または `ヘルプ` と入力すると、利用可能なすべてのコマンドとそのエイリアスの一覧が表示されます。

Here's an overview of the command categories:

- **General Commands (general.js) | 汎用コマンド**:
  - `hello` (こんにちは): Greets the user.
  - `goodmorning` (おはよう): Greets the user in the morning.
  - `goodnight` (おやすみ): Greets the user at night.
  - `thanks` (ありがとう): Responds to thanks.

- **Information Commands (info.js) | 情報コマンド**:
  - `pos` (位置): Displays the bot's current position.
  - `health` (体力): Displays the bot's current health and hunger.
  - `time` (時間): Displays the current in-game time.
  - `players` (プレイヤー): Lists nearby players.
  - `mobs` (モブ): Lists nearby mobs.
  - `blocks` (ブロック): Lists nearby blocks.

- **Inventory Commands (inventory.js) | インベントリコマンド**:
  - `inv` (インベントリ): Displays the bot's inventory content.
  - `drop <item_name> [quantity]` (捨てる): Drops a specified item.
  - `collect [item_name]` (収集): Collects nearby dropped items.

- **Movement Commands (move.js) | 移動コマンド**:
  - `forward [seconds]` (前): Moves forward for a specified duration.
  - `back [seconds]` (後ろ): Moves backward for a specified duration.
  - `left [seconds]` (左): Moves left for a specified duration.
  - `right [seconds]` (右): Moves right for a specified duration.
  - `jump` (ジャンプ): Makes the bot jump.
  - `goto <x> <y> <z>` (移動): Moves to specified coordinates.
  - `come` (おいで): Moves to the player who issued the command.
  - `follow <player_name>` (ついてきて): Follows a specified player.

- **Stop Command (stop.js) | 停止コマンド**:
  - `stop` (停止): Stops all current bot actions.

- **World Interaction Commands (world.js) | ワールド操作コマンド**:
  - `mine <block_name> [count]` (採掘): Mines a specified block.
  - `chest <open|store>` (チェスト): Interacts with nearby chests (open or store items).
  - `build <tower|wall|floor> [size]` (建築): Builds a structure (currently only 'tower' is supported).

---

このプロジェクトには、リンティング、フォーマット、テストのためのツールが含まれています。

- **リンティング**: コードのスタイルエラーをチェックします。

  ```bash
  npm run lint
  ```

- **フォーマット**: コードを自動で整形します。

  ```bash
  npm run format
  ```

- **テスト**: テストを実行します。
  ```bash
  npm run test
  ```