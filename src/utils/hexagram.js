/**
 * Hexagram Utilities
 * Functions for hexagram calculation and manipulation
 */

import hexagramsData from '../data/hexagrams.json';
import trigramsData from '../data/trigrams.json';

/**
 * Calculate hexagram number from trigram combination
 */
export function calculateHexagramNumber(lines) {
  // Get upper and lower trigrams from the 6 lines
  const upperTrigram = lines.slice(3, 6); // Lines 4, 5, 6
  const lowerTrigram = lines.slice(0, 3); // Lines 1, 2, 3
  
  // Find matching trigrams
  const upperTrigramName = findTrigramName(upperTrigram);
  const lowerTrigramName = findTrigramName(lowerTrigram);
  
  if (!upperTrigramName || !lowerTrigramName) {
    throw new Error('Invalid trigram combination');
  }
  
  // Calculate hexagram number using King Wen sequence
  const upperValue = trigramsData[upperTrigramName].value;
  const lowerValue = trigramsData[lowerTrigramName].value;
  
  // King Wen sequence lookup table
  const kingWenTable = {
    '1,1': 1,   // Heaven over Heaven
    '1,2': 11,  // Heaven over Earth
    '1,3': 34,  // Heaven over Thunder
    '1,4': 14,  // Heaven over Wind
    '1,5': 43,  // Heaven over Water
    '1,6': 9,   // Heaven over Fire
    '1,7': 5,   // Heaven over Mountain
    '1,8': 26,  // Heaven over Lake
    '2,1': 12,  // Earth over Heaven
    '2,2': 2,   // Earth over Earth
    '2,3': 16,  // Earth over Thunder
    '2,4': 20,  // Earth over Wind
    '2,5': 8,   // Earth over Water
    '2,6': 35,  // Earth over Fire
    '2,7': 23,  // Earth over Mountain
    '2,8': 45,  // Earth over Lake
    '3,1': 25,  // Thunder over Heaven
    '3,2': 24,  // Thunder over Earth
    '3,3': 51,  // Thunder over Thunder
    '3,4': 42,  // Thunder over Wind
    '3,5': 40,  // Thunder over Water
    '3,6': 55,  // Thunder over Fire
    '3,7': 62,  // Thunder over Mountain
    '3,8': 54,  // Thunder over Lake
    '4,1': 44,  // Wind over Heaven
    '4,2': 46,  // Wind over Earth
    '4,3': 32,  // Wind over Thunder
    '4,4': 57,  // Wind over Wind
    '4,5': 59,  // Wind over Water
    '4,6': 37,  // Wind over Fire
    '4,7': 53,  // Wind over Mountain
    '4,8': 61,  // Wind over Lake
    '5,1': 6,   // Water over Heaven
    '5,2': 7,   // Water over Earth
    '5,3': 29,  // Water over Thunder
    '5,4': 48,  // Water over Wind
    '5,5': 29,  // Water over Water
    '5,6': 63,  // Water over Fire
    '5,7': 39,  // Water over Mountain
    '5,8': 60,  // Water over Lake
    '6,1': 13,  // Fire over Heaven
    '6,2': 36,  // Fire over Earth
    '6,3': 21,  // Fire over Thunder
    '6,4': 50,  // Fire over Wind
    '6,5': 64,  // Fire over Water
    '6,6': 30,  // Fire over Fire
    '6,7': 56,  // Fire over Mountain
    '6,8': 49,  // Fire over Lake
    '7,1': 33,  // Mountain over Heaven
    '7,2': 15,  // Mountain over Earth
    '7,3': 27,  // Mountain over Thunder
    '7,4': 18,  // Mountain over Wind
    '7,5': 4,   // Mountain over Water
    '7,6': 22,  // Mountain over Fire
    '7,7': 52,  // Mountain over Mountain
    '7,8': 41,  // Mountain over Lake
    '8,1': 10,  // Lake over Heaven
    '8,2': 19,  // Lake over Earth
    '8,3': 17,  // Lake over Thunder
    '8,4': 28,  // Lake over Wind
    '8,5': 47,  // Lake over Water
    '8,6': 38,  // Lake over Fire
    '8,7': 31,  // Lake over Mountain
    '8,8': 58   // Lake over Lake
  };
  
  const key = `${upperValue},${lowerValue}`;
  const hexagramNumber = kingWenTable[key];
  
  if (!hexagramNumber) {
    throw new Error(`Invalid trigram combination: ${upperTrigramName} over ${lowerTrigramName}`);
  }
  
  return hexagramNumber;
}

/**
 * Find trigram name from line pattern
 */
function findTrigramName(lines) {
  for (const [name, trigram] of Object.entries(trigramsData)) {
    if (JSON.stringify(trigram.lines) === JSON.stringify(lines)) {
      return name;
    }
  }
  return null;
}

/**
 * Get hexagram data by number
 */
export function getHexagramData(number) {
  const hexagram = hexagramsData[number.toString()];
  if (!hexagram) {
    throw new Error(`Hexagram ${number} not found`);
  }
  return { ...hexagram };
}

/**
 * Get trigram data by name
 */
export function getTrigramData(name) {
  const trigram = trigramsData[name];
  if (!trigram) {
    throw new Error(`Trigram ${name} not found`);
  }
  return { ...trigram };
}

/**
 * Generate hexagram from coin toss results
 */
export function generateHexagramFromCoins(coinTosses) {
  if (coinTosses.length !== 6) {
    throw new Error('Must have exactly 6 coin tosses');
  }
  
  const lines = [];
  const changingLines = [];
  
  coinTosses.forEach((threeCoins, index) => {
    if (threeCoins.length !== 3) {
      throw new Error('Each toss must have exactly 3 coins');
    }
    
    // Calculate sum: heads = 3, tails = 2
    const sum = threeCoins.reduce((total, coin) => {
      return total + (coin === 'heads' ? 3 : 2);
    }, 0);
    
    // Determine line type and changing status
    let lineType, isChanging;
    switch (sum) {
      case 6: // Old Yin (3 tails) - broken, changing
        lineType = 0;
        isChanging = true;
        break;
      case 7: // Young Yang (2 tails, 1 head) - solid, stable
        lineType = 1;
        isChanging = false;
        break;
      case 8: // Young Yin (1 tail, 2 heads) - broken, stable
        lineType = 0;
        isChanging = false;
        break;
      case 9: // Old Yang (3 heads) - solid, changing
        lineType = 1;
        isChanging = true;
        break;
      default:
        throw new Error(`Invalid coin sum: ${sum}`);
    }
    
    lines.push(lineType);
    if (isChanging) {
      changingLines.push(index + 1); // Line numbers 1-6
    }
  });
  
  const primaryNumber = calculateHexagramNumber(lines);
  const primaryHexagram = getHexagramData(primaryNumber);
  
  let secondaryHexagram = null;
  if (changingLines.length > 0) {
    const changedLines = generateChangedLines(lines, changingLines);
    const secondaryNumber = calculateHexagramNumber(changedLines);
    secondaryHexagram = getHexagramData(secondaryNumber);
  }
  
  return {
    primary: primaryHexagram,
    secondary: secondaryHexagram,
    changingLines: changingLines,
    coinResults: coinTosses
  };
}

/**
 * Generate changed lines for secondary hexagram
 */
function generateChangedLines(originalLines, changingLineNumbers) {
  const changedLines = [...originalLines];
  
  changingLineNumbers.forEach(lineNum => {
    const index = lineNum - 1;
    changedLines[index] = changedLines[index] === 1 ? 0 : 1;
  });
  
  return changedLines;
}

/**
 * Format hexagram for display
 */
export function formatHexagram(hexagram) {
  return {
    ...hexagram,
    linesDisplay: hexagram.lines.map(line => line ? '⚊' : '⚋').join(' '),
    trigramsDisplay: hexagram.trigrams.map(trigram => 
      trigramsData[trigram]?.chinese || trigram
    ).join(' / ')
  };
}

/**
 * Get hexagram trigram information
 */
export function getHexagramTrigrams(hexagram) {
  const upperTrigram = getTrigramData(hexagram.trigrams[0]);
  const lowerTrigram = getTrigramData(hexagram.trigrams[1]);
  
  return {
    upper: upperTrigram,
    lower: lowerTrigram,
    combination: `${upperTrigram.name} over ${lowerTrigram.name}`,
    elements: {
      upper: upperTrigram.element,
      lower: lowerTrigram.element
    },
    directions: {
      upper: upperTrigram.direction,
      lower: lowerTrigram.direction
    }
  };
}

/**
 * Validate hexagram structure
 */
export function validateHexagram(hexagram) {
  const requiredFields = ['name', 'chinese', 'number', 'trigrams', 'lines', 'unicode'];
  
  for (const field of requiredFields) {
    if (!hexagram.hasOwnProperty(field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (hexagram.lines.length !== 6) {
    throw new Error('Hexagram must have exactly 6 lines');
  }
  
  if (hexagram.trigrams.length !== 2) {
    throw new Error('Hexagram must have exactly 2 trigrams');
  }
  
  // Validate trigram names
  for (const trigram of hexagram.trigrams) {
    if (!trigramsData[trigram]) {
      throw new Error(`Invalid trigram: ${trigram}`);
    }
  }
  
  // Validate line values
  for (const line of hexagram.lines) {
    if (line !== 0 && line !== 1) {
      throw new Error(`Invalid line value: ${line}. Must be 0 or 1`);
    }
  }
  
  return true;
}

/**
 * Get all hexagrams
 */
export function getAllHexagrams() {
  return Object.values(hexagramsData).map(hexagram => ({
    ...hexagram,
    ...formatHexagram(hexagram)
  }));
}

/**
 * Search hexagrams by name or number
 */
export function searchHexagrams(query) {
  const normalizedQuery = query.toLowerCase();
  
  return getAllHexagrams().filter(hexagram => 
    hexagram.name.toLowerCase().includes(normalizedQuery) ||
    hexagram.chinese.includes(normalizedQuery) ||
    hexagram.number.toString() === normalizedQuery
  );
}

/**
 * Generate random hexagram (for testing)
 */
export function generateRandomHexagram() {
  const randomCoinTosses = [];
  
  for (let i = 0; i < 6; i++) {
    const threeCoins = [];
    for (let j = 0; j < 3; j++) {
      threeCoins.push(Math.random() < 0.5 ? 'heads' : 'tails');
    }
    randomCoinTosses.push(threeCoins);
  }
  
  return generateHexagramFromCoins(randomCoinTosses);
}

export default {
  calculateHexagramNumber,
  getHexagramData,
  getTrigramData,
  generateHexagramFromCoins,
  formatHexagram,
  getHexagramTrigrams,
  validateHexagram,
  getAllHexagrams,
  searchHexagrams,
  generateRandomHexagram
};