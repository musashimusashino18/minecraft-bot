const config = require("./config");

function dlog(...args) {
  if (config.get("features.debug")) console.log(...args);
}
function dwarn(...args) {
  if (config.get("features.debug")) console.warn(...args);
}
function derror(...args) {
  if (config.get("features.debug")) console.error(...args);
}
function botChatIfVerbose(bot, msg) {
  try {
    if (config.get("features.verboseChat")) bot.chat(msg);
  } catch (_) {
    /* no-op */
  }
}

// --- ブロックに対して最適なツール種類を返す ('pickaxe'|'axe'|'shovel'|'shears'|'hoe'|null)
function getBestToolTypeForBlock(block) {
  const name = block && block.name ? block.name : "";

  const pickaxeKeywords = [
    "stone",
    "cobblestone",
    "andesite",
    "diorite",
    "granite",
    "deepslate",
    "ore",
    "_ore",
    "stone_bricks",
    "netherrack",
    "basalt",
    "tuff",
    "blackstone",
    "ancient_debris",
  ];
  if (pickaxeKeywords.some((k) => name.includes(k))) return "pickaxe";

  const axeKeywords = [
    "log",
    "wood",
    "planks",
    "bookshelf",
    "carved_pumpkin",
    "pumpkin",
    "melon",
    "stripped_",
  ];
  if (axeKeywords.some((k) => name.includes(k))) return "axe";

  const shovelKeywords = [
    "dirt",
    "grass_block",
    "sand",
    "gravel",
    "clay",
    "mycelium",
    "podzol",
    "snow",
    "soul_sand",
    "soul_soil",
  ];
  if (shovelKeywords.some((k) => name.includes(k))) return "shovel";

  const shearsKeywords = ["leaves", "wool", "cobweb", "vine", "tripwire"];
  if (shearsKeywords.some((k) => name.includes(k))) return "shears";

  const hoeKeywords = ["farmland", "roots", "nether_sprouts"];
  if (hoeKeywords.some((k) => name.includes(k))) return "hoe";

  return null;
}

// --- 同種ツールの候補を列挙し、未エンチャント品を優先する
function findToolCandidates(bot, toolType) {
  if (!toolType) return [];
  const items = bot.inventory
    .items()
    .filter((i) => (i.name || "").toLowerCase().includes(toolType));
  if (items.length === 0) return [];

  const tiers = ["netherite", "diamond", "iron", "stone", "gold", "wood"];

  const hasEnchants = (i) => {
    try {
      // item.nbt が存在しているかをざっくり判定
      return !!(i.nbt && Object.keys(i.nbt).length > 0);
    } catch (_) {
      return false;
    }
  };

  const sortByTier = (arr) =>
    arr.sort((a, b) => {
      const an = (a.name || "").toLowerCase();
      const bn = (b.name || "").toLowerCase();
      const ai = tiers.findIndex((t) => an.includes(t));
      const bi = tiers.findIndex((t) => bn.includes(t));
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

  const noEnchant = items.filter((i) => !hasEnchants(i));
  const withEnchant = items.filter((i) => hasEnchants(i));

  return sortByTier(noEnchant).concat(sortByTier(withEnchant));
}

function wrapEnchantsGetterOnPrototype(proto) {
  try {
    if (!proto) return false;
    const desc = Object.getOwnPropertyDescriptor(proto, "enchants");

    // 既に安全ラップされていれば何もしない
    if (desc && desc.get && desc.get._isSafeWrapper) {
      dlog("wrapEnchants: already wrapped");
      return true;
    }

    const origGetter = desc && desc.get;
    Object.defineProperty(proto, "enchants", {
      get: function () {
        try {
          if (typeof origGetter === "function") {
            return origGetter.call(this);
          }
          return [];
        } catch (e) {
          // 詳細はデバッグ時にだけ出す
          dwarn(
            "wrapped enchants getter threw, fallback to []:",
            e && e.message ? e.message : e,
          );
          return [];
        }
      },
      configurable: true,
    });

    // マークを付けて二重ラップを防止
    const newDesc = Object.getOwnPropertyDescriptor(proto, "enchants");
    if (newDesc && newDesc.get) newDesc.get._isSafeWrapper = true;
    dlog("wrapEnchants: wrapped prototype successfully");
    return true;
  } catch (err) {
    dwarn(
      "wrapEnchantsOnPrototype error:",
      err && err.message ? err.message : err,
    );
    return false;
  }
}

function sanitizeHeldItemPrototype(bot) {
  try {
    const held = bot.heldItem;
    if (!held) {
      dlog("sanitizeHeldItemPrototype: no heldItem");
      return false;
    }
    const proto = Object.getPrototypeOf(held);
    if (!proto) {
      dlog("sanitizeHeldItemPrototype: no prototype");
      return false;
    }
    return wrapEnchantsGetterOnPrototype(proto);
  } catch (err) {
    dwarn(
      "sanitizeHeldItemPrototype error:",
      err && err.message ? err.message : err,
    );
    return false;
  }
}

// =======================
// safeDig（静かな出力版）
// - 装備試行や失敗はデバッグ時のみ console に表示
// - ボットのチャットは必要最小限に（VERBOSE_CHAT が true のときに詳細チャット）
// =======================
async function safeDig(bot, block) {
  try {
    const toolType = getBestToolTypeForBlock(block);
    const candidates = findToolCandidates(bot, toolType);

    for (const cand of candidates) {
      try {
        await bot.equip(cand, "hand");
        dlog("試行装備:", cand.displayName || cand.name);
        botChatIfVerbose(bot, `試行装備: ${cand.displayName || cand.name}`);

        // 装備直後に heldItem の prototype を安全化（これで enchants の例外を防ぐ）
        sanitizeHeldItemPrototype(bot);

        try {
          await bot.dig(block);
          dlog("掘削成功（ツール使用）");
          botChatIfVerbose(bot, "掘削成功（ツール使用）");
          return;
        } catch (err) {
          const msg = err && err.message ? err.message : "";
          if (/enchants|Don't know how to get the enchants/i.test(msg)) {
            dwarn(
              "enchants エラーで候補を破棄:",
              cand.displayName || cand.name,
              "->",
              msg,
            );
            try {
              await bot.unequip("hand");
            } catch (_) {
              /* no-op */
            }
            continue;
          } else {
            throw err;
          }
        }
      } catch (equipErr) {
        dwarn(
          "装備試行エラー（スキップ）:",
          equipErr && equipErr.message ? equipErr.message : equipErr,
        );
      }
    }

    // 候補が無効 or 全部失敗 -> 素手で掘る（フォールバック）
    try {
      await bot.unequip("hand");
    } catch (_) {
      /* no-op */
    }
    dlog("候補が使えないため素手で掘ります");
    botChatIfVerbose(bot, "候補が使えないため素手で掘ります");
    await bot.dig(block);
    return;
  } catch (finalErr) {
    try {
      bot.chat("掘削エラーが発生しました");
    } catch (_) {
      /* no-op */
    }
    derror(
      "safeDig 最終エラー:",
      finalErr && finalErr.message ? finalErr.message : finalErr,
    );
  }
}

// 建築材料を探す
function findBuildingMaterial(bot) {
  const materials = [
    "cobblestone",
    "stone",
    "dirt",
    "oak_planks",
    "stone_bricks",
    "oak_log",
  ];

  for (const material of materials) {
    const item = bot.inventory
      .items()
      .find(
        (item) =>
          item.name === material ||
          (item.displayName &&
            item.displayName.toLowerCase().includes(material)),
      );
    if (item && item.count > 0) {
      return item;
    }
  }

  // 日本語名でも検索
  const japaneseNames = {
    石: "stone",
    丸石: "cobblestone",
    土: "dirt",
    木材: "oak_planks",
    木: "oak_log",
  };

  for (const [japanese, english] of Object.entries(japaneseNames)) {
    const item = bot.inventory
      .items()
      .find(
        (item) =>
          item.name === english ||
          (item.displayName &&
            (item.displayName.includes(japanese) ||
              item.displayName.toLowerCase().includes(english))),
      );
    if (item && item.count > 0) {
      return item;
    }
  }

  return null;
}

module.exports = {
  dlog,
  dwarn,
  derror,
  botChatIfVerbose,
  getBestToolTypeForBlock,
  findToolCandidates,
  safeDig,
  findBuildingMaterial,
  wrapEnchantsGetterOnPrototype,
  sanitizeHeldItemPrototype,
};
