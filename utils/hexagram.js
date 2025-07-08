/**
 * I Ching Hexagram Calculation Logic
 * 
 * This module handles the conversion of line patterns to hexagram numbers
 * and provides utilities for working with hexagram data.
 */

import hexagramsData from '../data/hexagrams.json' with { type: 'json' };
import trigramsData from '../data/trigrams.json' with { type: 'json' };

/**
 * Converts a line pattern to upper and lower trigrams
 * @param {Array<number>} lines - Array of 6 lines (0 for broken, 1 for solid)
 * @returns {Object} Object with upper and lower trigram names
 */
export function linesToTrigrams(lines) {
  if (lines.length !== 6) {
    throw new Error('Lines array must contain exactly 6 elements');
  }

  // I Ching reads from bottom to top, so:
  // lines[0] = bottom line (line 1)
  // lines[5] = top line (line 6)
  
  // Lower trigram = lines 1-3 (indices 0-2)
  const lowerTrigram = lines.slice(0, 3);
  // Upper trigram = lines 4-6 (indices 3-5)
  const upperTrigram = lines.slice(3, 6);

  return {
    upper: getTrigramName(upperTrigram),
    lower: getTrigramName(lowerTrigram)
  };
}

/**
 * Converts a trigram line pattern to its traditional name
 * @param {Array<number>} trigram - Array of 3 lines (0 for broken, 1 for solid)
 * @returns {string} Trigram name
 */
export function getTrigramName(trigram) {
  if (trigram.length !== 3) {
    throw new Error('Trigram must contain exactly 3 lines');
  }

  const pattern = trigram.join('');
  
  switch(pattern) {
    case '111': return 'heaven';  // ☰
    case '000': return 'earth';   // ☷
    case '100': return 'thunder'; // ☳
    case '011': return 'wind';    // ☴
    case '010': return 'water';   // ☵
    case '101': return 'fire';    // ☲
    case '001': return 'mountain'; // ☶
    case '110': return 'lake';    // ☱
    default:
      throw new Error(`Invalid trigram pattern: ${pattern}`);
  }
}

/**
 * Calculates hexagram number from line pattern
 * @param {Array<number>} lines - Array of 6 lines (0 for broken, 1 for solid)
 * @returns {number} Hexagram number (1-64)
 */
export function calculateHexagramNumber(lines) {
  const trigrams = linesToTrigrams(lines);
  const upperValue = trigramsData[trigrams.upper];
  const lowerValue = trigramsData[trigrams.lower];
  
  if (upperValue === undefined || lowerValue === undefined) {
    throw new Error(`Invalid trigram combination: ${trigrams.upper}, ${trigrams.lower}`);
  }

  // Traditional I Ching lookup table formula
  // This maps the trigram combinations to hexagram numbers
  const hexagramNumber = getHexagramFromTrigrams(trigrams.upper, trigrams.lower);
  
  return hexagramNumber;
}

/**
 * Maps trigram combinations to hexagram numbers using traditional lookup
 * @param {string} upper - Upper trigram name
 * @param {string} lower - Lower trigram name
 * @returns {number} Hexagram number
 */
export function getHexagramFromTrigrams(upper, lower) {
  // Traditional I Ching lookup table
  const trigramMap = {
    heaven: { heaven: 1, earth: 12, thunder: 34, wind: 44, water: 5, fire: 14, mountain: 26, lake: 10 },
    earth: { heaven: 11, earth: 2, thunder: 16, wind: 46, water: 7, fire: 35, mountain: 15, lake: 19 },
    thunder: { heaven: 25, earth: 24, thunder: 51, wind: 42, water: 40, fire: 55, mountain: 62, lake: 54 },
    wind: { heaven: 9, earth: 20, thunder: 32, wind: 57, water: 48, fire: 50, mountain: 18, lake: 28 },
    water: { heaven: 6, earth: 8, thunder: 3, wind: 59, water: 29, fire: 63, mountain: 39, lake: 60 },
    fire: { heaven: 13, earth: 36, thunder: 21, wind: 37, water: 64, fire: 30, mountain: 56, lake: 38 },
    mountain: { heaven: 33, earth: 23, thunder: 27, wind: 53, water: 4, fire: 22, mountain: 52, lake: 31 },
    lake: { heaven: 43, earth: 45, thunder: 17, wind: 61, water: 47, fire: 49, mountain: 41, lake: 58 }
  };

  if (!trigramMap[upper] || trigramMap[upper][lower] === undefined) {
    throw new Error(`Invalid trigram combination: ${upper} over ${lower}`);
  }

  return trigramMap[upper][lower];
}

/**
 * Retrieves hexagram data by number
 * @param {number} hexagramNumber - Hexagram number (1-64)
 * @returns {Object} Hexagram data
 */
export function getHexagramData(hexagramNumber) {
  const hexagram = hexagramsData[hexagramNumber.toString()];
  
  if (!hexagram) {
    throw new Error(`Invalid hexagram number: ${hexagramNumber}`);
  }

  return {
    number: hexagramNumber,
    ...hexagram
  };
}

/**
 * Validates a line pattern
 * @param {Array<number>} lines - Array of lines to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateLines(lines) {
  if (!Array.isArray(lines)) {
    throw new Error('Lines must be an array');
  }

  if (lines.length !== 6) {
    throw new Error('Lines array must contain exactly 6 elements');
  }

  lines.forEach((line, index) => {
    if (line !== 0 && line !== 1) {
      throw new Error(`Invalid line value at position ${index}: ${line}. Must be 0 or 1.`);
    }
  });

  return true;
}

/**
 * Converts line pattern to visual representation
 * @param {Array<number>} lines - Array of 6 lines (0 for broken, 1 for solid)
 * @returns {string} Visual representation of hexagram
 */
export function linesToVisual(lines) {
  validateLines(lines);
  
  // Convert to symbols (from top to bottom for display)
  const symbols = lines.slice().reverse().map(line => {
    return line === 1 ? '⚊' : '⚋';
  });

  return symbols.join('\n');
}

/**
 * Gets all hexagrams that contain specific trigrams
 * @param {string} trigram - Trigram name to search for
 * @returns {Array<Object>} Array of hexagrams containing the trigram
 */
export function getHexagramsWithTrigram(trigram) {
  const results = [];
  
  for (let i = 1; i <= 64; i++) {
    const hexagram = getHexagramData(i);
    if (hexagram.trigrams.includes(trigram)) {
      results.push(hexagram);
    }
  }
  
  return results;
}

/**
 * Finds hexagrams by name (partial match)
 * @param {string} searchTerm - Term to search for in hexagram names
 * @returns {Array<Object>} Array of matching hexagrams
 */
export function findHexagramsByName(searchTerm) {
  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  for (let i = 1; i <= 64; i++) {
    const hexagram = getHexagramData(i);
    if (hexagram.name.toLowerCase().includes(lowerSearchTerm)) {
      results.push(hexagram);
    }
  }
  
  return results;
}

/**
 * Gets complementary hexagram (all lines flipped)
 * @param {number} hexagramNumber - Original hexagram number
 * @returns {Object} Complementary hexagram data
 */
export function getComplementaryHexagram(hexagramNumber) {
  const originalHexagram = getHexagramData(hexagramNumber);
  const flippedLines = originalHexagram.lines.map(line => line === 1 ? 0 : 1);
  const complementaryNumber = calculateHexagramNumber(flippedLines);
  
  return getHexagramData(complementaryNumber);
}

/**
 * Gets all available trigram names
 * @returns {Array<string>} Array of trigram names
 */
export function getAllTrigrams() {
  return Object.keys(trigramsData);
}

/**
 * Gets all hexagram numbers
 * @returns {Array<number>} Array of hexagram numbers (1-64)
 */
export function getAllHexagramNumbers() {
  return Array.from({ length: 64 }, (_, i) => i + 1);
}