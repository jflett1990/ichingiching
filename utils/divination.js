/**
 * I Ching Divination Logic - Traditional 3-Coin Method
 * 
 * This module implements the traditional I Ching divination method using three coins.
 * Each line of the hexagram is determined by tossing three coins simultaneously.
 * 
 * Traditional values:
 * - Heads = 3 points
 * - Tails = 2 points
 * 
 * Line types based on sum:
 * - 6 points (3 tails): Old Yin - broken line, changing (⚋→⚊)
 * - 7 points (2 tails, 1 head): Young Yang - solid line, stable (⚊)
 * - 8 points (1 tail, 2 heads): Young Yin - broken line, stable (⚋)
 * - 9 points (3 heads): Old Yang - solid line, changing (⚊→⚋)
 */

import { calculateHexagramNumber } from './hexagram.js';

/**
 * Simulates a single coin toss
 * @returns {string} 'heads' or 'tails'
 */
export function tossCoin() {
  return Math.random() < 0.5 ? 'heads' : 'tails';
}

/**
 * Simulates tossing three coins simultaneously
 * @returns {Array<string>} Array of 3 coin results ['heads', 'tails', 'heads']
 */
export function tossThreeCoins() {
  return [tossCoin(), tossCoin(), tossCoin()];
}

/**
 * Calculates the point value of three coins
 * @param {Array<string>} threeCoins - Array of 3 coin results
 * @returns {number} Sum of coin values (6-9)
 */
export function calculateCoinSum(threeCoins) {
  return threeCoins.reduce((total, coin) => {
    return total + (coin === 'heads' ? 3 : 2);
  }, 0);
}

/**
 * Determines line type and changing status from coin sum
 * @param {number} sum - Sum of three coins (6-9)
 * @returns {Object} Line information with type and changing status
 */
export function interpretCoinSum(sum) {
  switch(sum) {
    case 6: // Old Yin - broken, changing
      return {
        lineType: 0, // broken
        isChanging: true,
        name: 'Old Yin',
        symbol: '⚋→⚊'
      };
    case 7: // Young Yang - solid, stable
      return {
        lineType: 1, // solid
        isChanging: false,
        name: 'Young Yang',
        symbol: '⚊'
      };
    case 8: // Young Yin - broken, stable
      return {
        lineType: 0, // broken
        isChanging: false,
        name: 'Young Yin',
        symbol: '⚋'
      };
    case 9: // Old Yang - solid, changing
      return {
        lineType: 1, // solid
        isChanging: true,
        name: 'Old Yang',
        symbol: '⚊→⚋'
      };
    default:
      throw new Error(`Invalid coin sum: ${sum}. Must be between 6 and 9.`);
  }
}

/**
 * Generates a complete hexagram from 6 three-coin tosses
 * @param {Array<Array<string>>} allThreeCoinsResults - Array of 6 three-coin results
 * @returns {Object} Complete hexagram data with primary, secondary, and changing lines
 */
export function generateHexagram(allThreeCoinsResults) {
  if (allThreeCoinsResults.length !== 6) {
    throw new Error('Must provide exactly 6 three-coin results');
  }

  const lines = [];
  const changingLines = [];
  const lineDetails = [];

  // Process each of the 6 three-coin tosses
  allThreeCoinsResults.forEach((threeCoins, index) => {
    const sum = calculateCoinSum(threeCoins);
    const lineInfo = interpretCoinSum(sum);
    
    lines.push(lineInfo.lineType);
    lineDetails.push({
      position: index + 1,
      coins: threeCoins,
      sum: sum,
      ...lineInfo
    });
    
    if (lineInfo.isChanging) {
      changingLines.push(index + 1); // Line numbers 1-6
    }
  });

  const primaryHexagram = calculateHexagramNumber(lines);
  const secondaryHexagram = changingLines.length > 0 ? 
    generateChangedHexagram(lines, changingLines) : null;

  return {
    primary: primaryHexagram,
    lines: lines,
    lineDetails: lineDetails,
    changing: changingLines,
    secondary: secondaryHexagram,
    coinResults: allThreeCoinsResults // Store for history
  };
}

/**
 * Generates the transformed hexagram from changing lines
 * @param {Array<number>} originalLines - Original line pattern (0s and 1s)
 * @param {Array<number>} changingLineNumbers - Line numbers that are changing (1-6)
 * @returns {number} Hexagram number of the transformed hexagram
 */
export function generateChangedHexagram(originalLines, changingLineNumbers) {
  const changedLines = [...originalLines];
  
  changingLineNumbers.forEach(lineNum => {
    const index = lineNum - 1;
    changedLines[index] = changedLines[index] === 1 ? 0 : 1; // Flip line
  });
  
  return calculateHexagramNumber(changedLines);
}

/**
 * Performs a complete I Ching divination reading
 * @param {string} question - The question being asked
 * @returns {Object} Complete divination result
 */
export function performDivination(question = '') {
  // Generate 6 three-coin tosses
  const allThreeCoinsResults = [];
  for (let i = 0; i < 6; i++) {
    allThreeCoinsResults.push(tossThreeCoins());
  }

  const hexagramData = generateHexagram(allThreeCoinsResults);

  return {
    question: question,
    timestamp: new Date().toISOString(),
    ...hexagramData
  };
}

/**
 * Validates coin toss results for proper format
 * @param {Array<Array<string>>} coinResults - Array of 6 three-coin results
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateCoinResults(coinResults) {
  if (!Array.isArray(coinResults) || coinResults.length !== 6) {
    throw new Error('Coin results must be an array of exactly 6 three-coin tosses');
  }

  coinResults.forEach((threeCoins, index) => {
    if (!Array.isArray(threeCoins) || threeCoins.length !== 3) {
      throw new Error(`Coin toss ${index + 1} must contain exactly 3 coins`);
    }
    
    threeCoins.forEach((coin, coinIndex) => {
      if (coin !== 'heads' && coin !== 'tails') {
        throw new Error(`Invalid coin result at toss ${index + 1}, coin ${coinIndex + 1}: ${coin}`);
      }
    });
  });

  return true;
}

/**
 * Creates a manual divination from pre-determined coin results
 * @param {Array<Array<string>>} coinResults - Array of 6 three-coin results
 * @param {string} question - The question being asked
 * @returns {Object} Complete divination result
 */
export function createManualDivination(coinResults, question = '') {
  validateCoinResults(coinResults);
  
  const hexagramData = generateHexagram(coinResults);
  
  return {
    question: question,
    timestamp: new Date().toISOString(),
    ...hexagramData
  };
}