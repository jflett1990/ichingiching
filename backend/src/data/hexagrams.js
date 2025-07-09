// I Ching Hexagram Data Service
// Contains the essential information for all 64 hexagrams

const hexagrams = {
  1: { name: "The Creative", chinese: "乾", trigrams: ["heaven", "heaven"], lines: [1, 1, 1, 1, 1, 1], unicode: "䷀" },
  2: { name: "The Receptive", chinese: "坤", trigrams: ["earth", "earth"], lines: [0, 0, 0, 0, 0, 0], unicode: "䷁" },
  3: { name: "Difficulty at Beginning", chinese: "屯", trigrams: ["water", "thunder"], lines: [1, 0, 0, 0, 1, 0], unicode: "䷂" },
  4: { name: "Youthful Folly", chinese: "蒙", trigrams: ["mountain", "water"], lines: [1, 0, 0, 0, 0, 1], unicode: "䷃" },
  5: { name: "Waiting", chinese: "需", trigrams: ["water", "heaven"], lines: [1, 1, 1, 0, 1, 0], unicode: "䷄" },
  6: { name: "Conflict", chinese: "訟", trigrams: ["heaven", "water"], lines: [0, 1, 0, 1, 1, 1], unicode: "䷅" },
  7: { name: "The Army", chinese: "師", trigrams: ["earth", "water"], lines: [0, 1, 0, 0, 0, 0], unicode: "䷆" },
  8: { name: "Holding Together", chinese: "比", trigrams: ["water", "earth"], lines: [0, 0, 0, 0, 1, 0], unicode: "䷇" },
  9: { name: "Small Taming", chinese: "小畜", trigrams: ["wind", "heaven"], lines: [1, 1, 1, 0, 1, 1], unicode: "䷈" },
  10: { name: "Treading", chinese: "履", trigrams: ["heaven", "lake"], lines: [0, 1, 1, 1, 1, 1], unicode: "䷉" },
  11: { name: "Peace", chinese: "泰", trigrams: ["earth", "heaven"], lines: [1, 1, 1, 0, 0, 0], unicode: "䷊" },
  12: { name: "Standstill", chinese: "否", trigrams: ["heaven", "earth"], lines: [0, 0, 0, 1, 1, 1], unicode: "䷋" },
  13: { name: "Fellowship", chinese: "同人", trigrams: ["heaven", "fire"], lines: [1, 0, 1, 1, 1, 1], unicode: "䷌" },
  14: { name: "Great Possession", chinese: "大有", trigrams: ["fire", "heaven"], lines: [1, 1, 1, 1, 0, 1], unicode: "䷍" },
  15: { name: "Modesty", chinese: "謙", trigrams: ["earth", "mountain"], lines: [0, 0, 1, 0, 0, 0], unicode: "䷎" },
  16: { name: "Enthusiasm", chinese: "豫", trigrams: ["thunder", "earth"], lines: [0, 0, 0, 1, 0, 0], unicode: "䷏" },
  17: { name: "Following", chinese: "隨", trigrams: ["lake", "thunder"], lines: [1, 0, 0, 0, 1, 1], unicode: "䷐" },
  18: { name: "Work on Decay", chinese: "蠱", trigrams: ["mountain", "wind"], lines: [0, 1, 1, 0, 0, 1], unicode: "䷑" },
  19: { name: "Approach", chinese: "臨", trigrams: ["earth", "lake"], lines: [0, 1, 1, 0, 0, 0], unicode: "䷒" },
  20: { name: "Contemplation", chinese: "觀", trigrams: ["wind", "earth"], lines: [0, 0, 0, 0, 1, 1], unicode: "䷓" },
  21: { name: "Biting Through", chinese: "噬嗑", trigrams: ["fire", "thunder"], lines: [1, 0, 0, 1, 0, 1], unicode: "䷔" },
  22: { name: "Grace", chinese: "賁", trigrams: ["mountain", "fire"], lines: [1, 0, 1, 0, 0, 1], unicode: "䷕" },
  23: { name: "Splitting Apart", chinese: "剝", trigrams: ["mountain", "earth"], lines: [0, 0, 0, 0, 0, 1], unicode: "䷖" },
  24: { name: "Return", chinese: "復", trigrams: ["earth", "thunder"], lines: [1, 0, 0, 0, 0, 0], unicode: "䷗" },
  25: { name: "Innocence", chinese: "無妄", trigrams: ["heaven", "thunder"], lines: [1, 0, 0, 1, 1, 1], unicode: "䷘" },
  26: { name: "Great Taming", chinese: "大畜", trigrams: ["mountain", "heaven"], lines: [1, 1, 1, 0, 0, 1], unicode: "䷙" },
  27: { name: "Nourishment", chinese: "頤", trigrams: ["mountain", "thunder"], lines: [1, 0, 0, 0, 0, 1], unicode: "䷚" },
  28: { name: "Great Excess", chinese: "大過", trigrams: ["lake", "wind"], lines: [0, 1, 1, 1, 1, 0], unicode: "䷛" },
  29: { name: "The Abysmal", chinese: "坎", trigrams: ["water", "water"], lines: [0, 1, 0, 0, 1, 0], unicode: "䷜" },
  30: { name: "The Clinging", chinese: "離", trigrams: ["fire", "fire"], lines: [1, 0, 1, 1, 0, 1], unicode: "䷝" },
  31: { name: "Influence", chinese: "咸", trigrams: ["lake", "mountain"], lines: [0, 0, 1, 0, 1, 1], unicode: "䷞" },
  32: { name: "Duration", chinese: "恆", trigrams: ["thunder", "wind"], lines: [0, 1, 1, 1, 0, 0], unicode: "䷟" },
  33: { name: "Retreat", chinese: "遯", trigrams: ["heaven", "mountain"], lines: [0, 0, 1, 1, 1, 1], unicode: "䷠" },
  34: { name: "Great Power", chinese: "大壯", trigrams: ["thunder", "heaven"], lines: [1, 1, 1, 1, 0, 0], unicode: "䷡" },
  35: { name: "Progress", chinese: "晉", trigrams: ["fire", "earth"], lines: [0, 0, 0, 1, 0, 1], unicode: "䷢" },
  36: { name: "Darkening of Light", chinese: "明夷", trigrams: ["earth", "fire"], lines: [1, 0, 1, 0, 0, 0], unicode: "䷣" },
  37: { name: "The Family", chinese: "家人", trigrams: ["wind", "fire"], lines: [1, 0, 1, 0, 1, 1], unicode: "䷤" },
  38: { name: "Opposition", chinese: "睽", trigrams: ["fire", "lake"], lines: [0, 1, 1, 1, 0, 1], unicode: "䷥" },
  39: { name: "Obstruction", chinese: "蹇", trigrams: ["water", "mountain"], lines: [0, 0, 1, 0, 1, 0], unicode: "䷦" },
  40: { name: "Deliverance", chinese: "解", trigrams: ["thunder", "water"], lines: [0, 1, 0, 1, 0, 0], unicode: "䷧" },
  41: { name: "Decrease", chinese: "損", trigrams: ["mountain", "lake"], lines: [0, 1, 1, 0, 0, 1], unicode: "䷨" },
  42: { name: "Increase", chinese: "益", trigrams: ["wind", "thunder"], lines: [1, 0, 0, 0, 1, 1], unicode: "䷩" },
  43: { name: "Breakthrough", chinese: "夬", trigrams: ["lake", "heaven"], lines: [1, 1, 1, 1, 1, 0], unicode: "䷪" },
  44: { name: "Coming to Meet", chinese: "姤", trigrams: ["heaven", "wind"], lines: [0, 1, 1, 1, 1, 1], unicode: "䷫" },
  45: { name: "Gathering Together", chinese: "萃", trigrams: ["lake", "earth"], lines: [0, 0, 0, 0, 1, 1], unicode: "䷬" },
  46: { name: "Pushing Upward", chinese: "升", trigrams: ["earth", "wind"], lines: [0, 1, 1, 0, 0, 0], unicode: "䷭" },
  47: { name: "Oppression", chinese: "困", trigrams: ["lake", "water"], lines: [0, 1, 0, 0, 1, 1], unicode: "䷮" },
  48: { name: "The Well", chinese: "井", trigrams: ["water", "wind"], lines: [0, 1, 1, 0, 1, 0], unicode: "䷯" },
  49: { name: "Revolution", chinese: "革", trigrams: ["lake", "fire"], lines: [1, 0, 1, 0, 1, 1], unicode: "䷰" },
  50: { name: "The Cauldron", chinese: "鼎", trigrams: ["fire", "wind"], lines: [0, 1, 1, 1, 0, 1], unicode: "䷱" },
  51: { name: "The Arousing", chinese: "震", trigrams: ["thunder", "thunder"], lines: [1, 0, 0, 1, 0, 0], unicode: "䷲" },
  52: { name: "Keeping Still", chinese: "艮", trigrams: ["mountain", "mountain"], lines: [0, 0, 1, 0, 0, 1], unicode: "䷳" },
  53: { name: "Development", chinese: "漸", trigrams: ["wind", "mountain"], lines: [0, 0, 1, 0, 1, 1], unicode: "䷴" },
  54: { name: "Marrying Maiden", chinese: "歸妹", trigrams: ["thunder", "lake"], lines: [0, 1, 1, 1, 0, 0], unicode: "䷵" },
  55: { name: "Abundance", chinese: "豐", trigrams: ["thunder", "fire"], lines: [1, 0, 1, 1, 0, 0], unicode: "䷶" },
  56: { name: "The Wanderer", chinese: "旅", trigrams: ["fire", "mountain"], lines: [0, 0, 1, 1, 0, 1], unicode: "䷷" },
  57: { name: "The Gentle", chinese: "巽", trigrams: ["wind", "wind"], lines: [0, 1, 1, 0, 1, 1], unicode: "䷸" },
  58: { name: "The Joyous", chinese: "兌", trigrams: ["lake", "lake"], lines: [0, 1, 1, 0, 1, 1], unicode: "䷹" },
  59: { name: "Dispersion", chinese: "渙", trigrams: ["wind", "water"], lines: [0, 1, 0, 0, 1, 1], unicode: "䷺" },
  60: { name: "Limitation", chinese: "節", trigrams: ["water", "lake"], lines: [0, 1, 1, 0, 1, 0], unicode: "䷻" },
  61: { name: "Inner Truth", chinese: "中孚", trigrams: ["wind", "lake"], lines: [0, 1, 1, 0, 0, 1], unicode: "䷼" },
  62: { name: "Small Excess", chinese: "小過", trigrams: ["thunder", "mountain"], lines: [0, 0, 1, 1, 0, 0], unicode: "䷽" },
  63: { name: "After Completion", chinese: "既濟", trigrams: ["water", "fire"], lines: [1, 0, 1, 0, 1, 0], unicode: "䷾" },
  64: { name: "Before Completion", chinese: "未濟", trigrams: ["fire", "water"], lines: [0, 1, 0, 1, 0, 1], unicode: "䷿" }
};

const trigrams = {
  heaven: 7, earth: 8, thunder: 4, wind: 5, water: 6, fire: 3, mountain: 1, lake: 2
};

class HexagramData {
  static getHexagram(number) {
    if (number < 1 || number > 64) {
      throw new Error('Invalid hexagram number. Must be between 1 and 64.');
    }
    return hexagrams[number];
  }

  static getAllHexagrams() {
    return hexagrams;
  }

  static getTrigrams() {
    return trigrams;
  }

  static calculateHexagramNumber(lines) {
    if (!Array.isArray(lines) || lines.length !== 6) {
      throw new Error('Lines must be an array of 6 elements (0 or 1)');
    }

    // Get trigrams (bottom 3 lines = lower trigram, top 3 lines = upper trigram)
    const lowerLines = lines.slice(0, 3);
    const upperLines = lines.slice(3, 6);

    const lowerTrigram = this.getTrigramName(lowerLines);
    const upperTrigram = this.getTrigramName(upperLines);

    // Calculate hexagram number using traditional formula
    const lowerValue = trigrams[lowerTrigram];
    const upperValue = trigrams[upperTrigram];

    // Find hexagram by matching trigrams
    for (let i = 1; i <= 64; i++) {
      const hex = hexagrams[i];
      if (hex.trigrams[0] === lowerTrigram && hex.trigrams[1] === upperTrigram) {
        return i;
      }
    }

    throw new Error('Could not calculate hexagram number from lines');
  }

  static getTrigramName(lines) {
    const trigramMap = {
      '111': 'heaven',
      '000': 'earth', 
      '100': 'thunder',
      '011': 'wind',
      '010': 'water',
      '101': 'fire',
      '001': 'mountain',
      '110': 'lake'
    };

    const key = lines.join('');
    return trigramMap[key];
  }

  static searchHexagrams(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (let i = 1; i <= 64; i++) {
      const hex = hexagrams[i];
      if (
        hex.name.toLowerCase().includes(lowerQuery) ||
        hex.chinese.includes(query) ||
        i.toString() === query
      ) {
        results.push({ number: i, ...hex });
      }
    }

    return results;
  }
}

module.exports = HexagramData;