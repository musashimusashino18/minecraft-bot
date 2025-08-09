class InputValidator {
  static validateCoordinates(args) {
    if (args.length < 3) {
      throw new Error("座標が不足しています (x, y, z)");
    }

    const coords = args.slice(0, 3).map((arg) => {
      const num = parseInt(arg, 10);
      if (isNaN(num)) {
        throw new Error(`無効な座標: ${arg}`);
      }
      if (Math.abs(num) > 30000000) {
        throw new Error("座標の範囲を超えています");
      }
      return num;
    });

    return coords;
  }

  static validateItemName(itemName) {
    if (!itemName || typeof itemName !== "string") {
      throw new Error("アイテム名が無効です");
    }

    // 危険な文字を除去
    return itemName.replace(/[<>&"']/g, "");
  }

  static validateCount(countStr, min = 1, max = 64) {
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count < min || count > max) {
      throw new Error(`数量は${min}から${max}の間で指定してください`);
    }
    return count;
  }
}

module.exports = InputValidator;
