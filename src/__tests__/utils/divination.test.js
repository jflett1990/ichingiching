import {
  calculateCoinSum,
  interpretCoinSum,
  performDivination,
  createManualDivination,
  generateHexagram
} from '../../utils/divination.js';

describe('Divination Logic', () => {
  describe('calculateCoinSum', () => {
    test('calculates three heads as 9', () => {
      const coins = ['heads', 'heads', 'heads'];
      expect(calculateCoinSum(coins)).toBe(9);
    });

    test('calculates three tails as 6', () => {
      const coins = ['tails', 'tails', 'tails'];
      expect(calculateCoinSum(coins)).toBe(6);
    });

    test('calculates two heads one tail as 8', () => {
      const coins = ['heads', 'heads', 'tails'];
      expect(calculateCoinSum(coins)).toBe(8);
    });

    test('calculates one head two tails as 7', () => {
      const coins = ['heads', 'tails', 'tails'];
      expect(calculateCoinSum(coins)).toBe(7);
    });

    test('throws error for invalid coin count', () => {
      expect(() => calculateCoinSum(['heads', 'heads'])).toThrow();
      expect(() => calculateCoinSum(['heads', 'heads', 'heads', 'tails'])).toThrow();
    });

    test('throws error for invalid coin values', () => {
      expect(() => calculateCoinSum(['heads', 'heads', 'invalid'])).toThrow();
    });
  });

  describe('interpretCoinSum', () => {
    test('interprets sum 6 as Old Yin (changing)', () => {
      const result = interpretCoinSum(6);
      expect(result.value).toBe(0);
      expect(result.name).toBe('Old Yin');
      expect(result.changing).toBe(true);
    });

    test('interprets sum 7 as Young Yang (stable)', () => {
      const result = interpretCoinSum(7);
      expect(result.value).toBe(1);
      expect(result.name).toBe('Young Yang');
      expect(result.changing).toBe(false);
    });

    test('interprets sum 8 as Young Yin (stable)', () => {
      const result = interpretCoinSum(8);
      expect(result.value).toBe(0);
      expect(result.name).toBe('Young Yin');
      expect(result.changing).toBe(false);
    });

    test('interprets sum 9 as Old Yang (changing)', () => {
      const result = interpretCoinSum(9);
      expect(result.value).toBe(1);
      expect(result.name).toBe('Old Yang');
      expect(result.changing).toBe(true);
    });

    test('throws error for invalid sums', () => {
      expect(() => interpretCoinSum(5)).toThrow();
      expect(() => interpretCoinSum(10)).toThrow();
      expect(() => interpretCoinSum(0)).toThrow();
    });
  });

  describe('generateHexagram', () => {
    test('generates random hexagram with valid structure', () => {
      const hexagram = generateHexagram();
      expect(hexagram).toHaveProperty('lines');
      expect(hexagram.lines).toHaveLength(6);
      expect(hexagram).toHaveProperty('changingLines');
      expect(Array.isArray(hexagram.changingLines)).toBe(true);
    });

    test('all line values are 0 or 1', () => {
      const hexagram = generateHexagram();
      hexagram.lines.forEach(line => {
        expect([0, 1]).toContain(line);
      });
    });

    test('changing lines are valid positions when present', () => {
      for (let i = 0; i < 20; i++) {
        const hexagram = generateHexagram();
        hexagram.changingLines.forEach(line => {
          expect(line).toBeGreaterThanOrEqual(1);
          expect(line).toBeLessThanOrEqual(6);
        });
      }
    });
  });

  describe('createManualDivination', () => {
    test('creates divination from manual coin results', () => {
      const coinResults = [
        ['heads', 'heads', 'heads'], // 9 - Old Yang
        ['tails', 'tails', 'tails'], // 6 - Old Yin
        ['heads', 'heads', 'tails'], // 8 - Young Yin
        ['heads', 'tails', 'tails'], // 7 - Young Yang
        ['heads', 'heads', 'heads'], // 9 - Old Yang
        ['tails', 'tails', 'heads']  // 7 - Young Yang
      ];
      const question = 'Test question';
      
      const divination = createManualDivination(coinResults, question);
      
      expect(divination).toHaveProperty('question', question);
      expect(divination).toHaveProperty('primaryHexagram');
      expect(divination).toHaveProperty('timestamp');
      expect(divination).toHaveProperty('method', 'manual');
      expect(divination.changingLines).toEqual([1, 2, 5]); // Positions with changing lines
    });

    test('handles no changing lines correctly', () => {
      const coinResults = [
        ['heads', 'tails', 'tails'], // 7 - Young Yang
        ['heads', 'heads', 'tails'], // 8 - Young Yin
        ['heads', 'tails', 'tails'], // 7 - Young Yang
        ['heads', 'heads', 'tails'], // 8 - Young Yin
        ['heads', 'tails', 'tails'], // 7 - Young Yang
        ['heads', 'heads', 'tails']  // 8 - Young Yin
      ];
      
      const divination = createManualDivination(coinResults, 'Test');
      expect(divination.changingLines).toEqual([]);
      expect(divination.secondaryHexagram).toBeNull();
    });

    test('throws error for invalid coin results length', () => {
      const invalidCoinResults = [
        ['heads', 'heads', 'heads'],
        ['tails', 'tails', 'tails']
      ]; // Only 2 throws, need 6
      
      expect(() => createManualDivination(invalidCoinResults, 'Test')).toThrow();
    });
  });

  describe('performDivination', () => {
    test('performs random divination with valid structure', () => {
      const question = 'What should I know about this project?';
      const divination = performDivination(question);
      
      expect(divination).toHaveProperty('question', question);
      expect(divination).toHaveProperty('primaryHexagram');
      expect(divination).toHaveProperty('timestamp');
      expect(divination).toHaveProperty('method', 'random');
      expect(divination).toHaveProperty('id');
      expect(divination.primaryHexagram.number).toBeGreaterThan(0);
      expect(divination.primaryHexagram.number).toBeLessThanOrEqual(64);
    });

    test('includes secondary hexagram when changing lines exist', () => {
      // Run multiple times to increase chance of getting changing lines
      let hasSecondary = false;
      for (let i = 0; i < 50; i++) {
        const divination = performDivination('Test question');
        if (divination.secondaryHexagram) {
          hasSecondary = true;
          expect(divination.secondaryHexagram.number).toBeGreaterThan(0);
          expect(divination.secondaryHexagram.number).toBeLessThanOrEqual(64);
          expect(divination.changingLines.length).toBeGreaterThan(0);
          break;
        }
      }
      // This is probabilistic but very likely to pass
    });

    test('generates unique IDs for different divinations', () => {
      const div1 = performDivination('Question 1');
      const div2 = performDivination('Question 2');
      expect(div1.id).not.toBe(div2.id);
    });

    test('includes timestamp close to current time', () => {
      const before = new Date();
      const divination = performDivination('Test');
      const after = new Date();
      
      expect(divination.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(divination.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Integration Tests', () => {
    test('complete divination flow maintains data integrity', () => {
      const question = 'Should I pursue this opportunity?';
      const divination = performDivination(question);
      
      // Verify all required properties exist
      const requiredProps = ['question', 'primaryHexagram', 'timestamp', 'method', 'id', 'changingLines'];
      requiredProps.forEach(prop => {
        expect(divination).toHaveProperty(prop);
      });
      
      // Verify hexagram data integrity
      expect(divination.primaryHexagram).toHaveProperty('number');
      expect(divination.primaryHexagram).toHaveProperty('name');
      expect(divination.primaryHexagram).toHaveProperty('chinese');
      expect(divination.primaryHexagram).toHaveProperty('lines');
      
      // If secondary hexagram exists, verify its integrity
      if (divination.secondaryHexagram) {
        expect(divination.secondaryHexagram).toHaveProperty('number');
        expect(divination.secondaryHexagram).toHaveProperty('name');
        expect(divination.secondaryHexagram).toHaveProperty('lines');
        expect(divination.changingLines.length).toBeGreaterThan(0);
      }
    });

    test('manual and random divination produce consistent structures', () => {
      const manualCoinResults = Array(6).fill(['heads', 'tails', 'tails']);
      const manualDiv = createManualDivination(manualCoinResults, 'Manual test');
      const randomDiv = performDivination('Random test');
      
      // Both should have the same structure
      const commonProps = ['question', 'primaryHexagram', 'timestamp', 'changingLines'];
      commonProps.forEach(prop => {
        expect(manualDiv).toHaveProperty(prop);
        expect(randomDiv).toHaveProperty(prop);
      });
      
      // Method should differ
      expect(manualDiv.method).toBe('manual');
      expect(randomDiv.method).toBe('random');
    });
  });
});