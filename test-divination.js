/**
 * Test file for I Ching divination logic
 * This file tests the core functionality to ensure everything works correctly
 */

import { 
  performDivination, 
  createManualDivination, 
  calculateCoinSum,
  interpretCoinSum,
  generateHexagram
} from './utils/divination.js';

import { 
  calculateHexagramNumber,
  getHexagramData,
  linesToTrigrams,
  linesToVisual
} from './utils/hexagram.js';

// Test 1: Basic coin sum calculation
console.log('=== Test 1: Coin Sum Calculation ===');
const testCoins1 = ['heads', 'heads', 'heads']; // Should be 9
const testCoins2 = ['tails', 'tails', 'tails']; // Should be 6
const testCoins3 = ['heads', 'tails', 'heads']; // Should be 8

console.log(`Three heads: ${calculateCoinSum(testCoins1)} (expected: 9)`);
console.log(`Three tails: ${calculateCoinSum(testCoins2)} (expected: 6)`);
console.log(`Mixed coins: ${calculateCoinSum(testCoins3)} (expected: 8)`);

// Test 2: Line interpretation
console.log('\n=== Test 2: Line Interpretation ===');
console.log('Sum 6 (Old Yin):', interpretCoinSum(6));
console.log('Sum 7 (Young Yang):', interpretCoinSum(7));
console.log('Sum 8 (Young Yin):', interpretCoinSum(8));
console.log('Sum 9 (Old Yang):', interpretCoinSum(9));

// Test 3: Hexagram calculation
console.log('\n=== Test 3: Hexagram Calculation ===');
const testLines = [1, 1, 1, 1, 1, 1]; // All solid lines = Hexagram 1 (The Creative)
const hexagramNumber = calculateHexagramNumber(testLines);
console.log(`Lines [1,1,1,1,1,1] = Hexagram ${hexagramNumber} (expected: 1)`);

const hexagramData = getHexagramData(hexagramNumber);
console.log(`Hexagram 1 data:`, hexagramData);

// Test 4: Visual representation
console.log('\n=== Test 4: Visual Representation ===');
console.log('Visual representation of Hexagram 1:');
console.log(linesToVisual(testLines));

// Test 5: Trigram conversion
console.log('\n=== Test 5: Trigram Conversion ===');
const trigrams = linesToTrigrams(testLines);
console.log('Trigrams for [1,1,1,1,1,1]:', trigrams);

// Test 6: Complete manual divination
console.log('\n=== Test 6: Manual Divination ===');
const manualCoinResults = [
  ['heads', 'heads', 'heads'], // 9 - Old Yang (changing)
  ['tails', 'tails', 'heads'], // 7 - Young Yang
  ['heads', 'tails', 'heads'], // 8 - Young Yin
  ['tails', 'tails', 'tails'], // 6 - Old Yin (changing)
  ['heads', 'heads', 'tails'], // 8 - Young Yin
  ['heads', 'tails', 'tails']  // 7 - Young Yang
];

const manualDivination = createManualDivination(manualCoinResults, 'Test question');
console.log('Manual divination result:', manualDivination);

// Test 7: Random divination
console.log('\n=== Test 7: Random Divination ===');
const randomDivination = performDivination('What should I know about this project?');
console.log('Random divination result:', randomDivination);

// Test 8: Hexagram data validation
console.log('\n=== Test 8: Hexagram Data Validation ===');
console.log('Testing a few hexagrams:');
for (let i = 1; i <= 5; i++) {
  const hexagram = getHexagramData(i);
  console.log(`Hexagram ${i}: ${hexagram.name} (${hexagram.chinese}) - ${hexagram.unicode}`);
}

console.log('\n=== All Tests Complete ===');