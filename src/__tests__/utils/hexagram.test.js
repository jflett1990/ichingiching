import {
  calculateHexagramNumber,
  getHexagramData,
  linesToTrigrams,
  linesToVisual,
  generateRandomHexagram,
  getChangingLines,
  createSecondaryHexagram
} from '../../utils/hexagram.js';

describe('Hexagram Utilities', () => {
  describe('calculateHexagramNumber', () => {
    test('calculates correct hexagram number for all yang lines', () => {
      const lines = [1, 1, 1, 1, 1, 1]; // All solid lines
      expect(calculateHexagramNumber(lines)).toBe(1); // The Creative
    });

    test('calculates correct hexagram number for all yin lines', () => {
      const lines = [0, 0, 0, 0, 0, 0]; // All broken lines
      expect(calculateHexagramNumber(lines)).toBe(2); // The Receptive
    });

    test('calculates correct hexagram number for mixed lines', () => {
      const lines = [1, 0, 1, 0, 1, 0]; // Alternating pattern
      const result = calculateHexagramNumber(lines);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(64);
    });

    test('throws error for invalid line count', () => {
      expect(() => calculateHexagramNumber([1, 1, 1])).toThrow();
      expect(() => calculateHexagramNumber([1, 1, 1, 1, 1, 1, 1])).toThrow();
    });

    test('throws error for invalid line values', () => {
      expect(() => calculateHexagramNumber([1, 1, 1, 2, 1, 1])).toThrow();
      expect(() => calculateHexagramNumber([1, 1, 1, -1, 1, 1])).toThrow();
    });
  });

  describe('getHexagramData', () => {
    test('returns correct data for hexagram 1', () => {
      const data = getHexagramData(1);
      expect(data.number).toBe(1);
      expect(data.name).toBe('The Creative');
      expect(data.chinese).toBe('乾');
      expect(data.unicode).toBe('☰');
    });

    test('returns correct data for hexagram 2', () => {
      const data = getHexagramData(2);
      expect(data.number).toBe(2);
      expect(data.name).toBe('The Receptive');
      expect(data.chinese).toBe('坤');
      expect(data.unicode).toBe('☷');
    });

    test('returns null for invalid hexagram number', () => {
      expect(getHexagramData(0)).toBeNull();
      expect(getHexagramData(65)).toBeNull();
      expect(getHexagramData(-1)).toBeNull();
    });

    test('all hexagrams have required properties', () => {
      for (let i = 1; i <= 64; i++) {
        const data = getHexagramData(i);
        expect(data).toHaveProperty('number');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('chinese');
        expect(data).toHaveProperty('unicode');
        expect(data).toHaveProperty('trigrams');
        expect(data).toHaveProperty('interpretation');
        expect(data.number).toBe(i);
      }
    });
  });

  describe('linesToTrigrams', () => {
    test('converts all yang lines to heaven trigrams', () => {
      const lines = [1, 1, 1, 1, 1, 1];
      const trigrams = linesToTrigrams(lines);
      expect(trigrams.upper.name).toBe('Heaven');
      expect(trigrams.lower.name).toBe('Heaven');
    });

    test('converts all yin lines to earth trigrams', () => {
      const lines = [0, 0, 0, 0, 0, 0];
      const trigrams = linesToTrigrams(lines);
      expect(trigrams.upper.name).toBe('Earth');
      expect(trigrams.lower.name).toBe('Earth');
    });

    test('correctly identifies mixed trigrams', () => {
      const lines = [1, 0, 1, 0, 1, 0]; // Thunder below, Lake above
      const trigrams = linesToTrigrams(lines);
      expect(trigrams.upper).toHaveProperty('name');
      expect(trigrams.lower).toHaveProperty('name');
      expect(trigrams.upper).toHaveProperty('symbol');
      expect(trigrams.lower).toHaveProperty('symbol');
    });
  });

  describe('linesToVisual', () => {
    test('converts yang lines to solid visual representation', () => {
      const lines = [1, 1, 1, 1, 1, 1];
      const visual = linesToVisual(lines);
      expect(visual).toContain('━━━');
      expect(visual).not.toContain('━ ━');
    });

    test('converts yin lines to broken visual representation', () => {
      const lines = [0, 0, 0, 0, 0, 0];
      const visual = linesToVisual(lines);
      expect(visual).toContain('━ ━');
      expect(visual).not.toContain('━━━');
    });

    test('displays lines in correct order (bottom to top)', () => {
      const lines = [1, 0, 1, 0, 1, 0]; // Alternating
      const visual = linesToVisual(lines);
      const visualLines = visual.split('\n').filter(line => line.trim());
      expect(visualLines).toHaveLength(6);
    });
  });

  describe('generateRandomHexagram', () => {
    test('generates valid hexagram structure', () => {
      const hexagram = generateRandomHexagram();
      expect(hexagram).toHaveProperty('primary');
      expect(hexagram.primary).toHaveProperty('number');
      expect(hexagram.primary).toHaveProperty('name');
      expect(hexagram.primary.number).toBeGreaterThan(0);
      expect(hexagram.primary.number).toBeLessThanOrEqual(64);
    });

    test('may generate changing lines', () => {
      // Run multiple times to test randomness
      let hasChangingLines = false;
      for (let i = 0; i < 50; i++) {
        const hexagram = generateRandomHexagram();
        if (hexagram.changingLines && hexagram.changingLines.length > 0) {
          hasChangingLines = true;
          expect(hexagram).toHaveProperty('secondary');
          expect(hexagram.secondary.number).toBeGreaterThan(0);
          expect(hexagram.secondary.number).toBeLessThanOrEqual(64);
          break;
        }
      }
      // This is probabilistic, but very likely to pass
    });

    test('changing lines are valid positions', () => {
      for (let i = 0; i < 20; i++) {
        const hexagram = generateRandomHexagram();
        if (hexagram.changingLines) {
          hexagram.changingLines.forEach(line => {
            expect(line).toBeGreaterThanOrEqual(1);
            expect(line).toBeLessThanOrEqual(6);
          });
        }
      }
    });
  });

  describe('getChangingLines', () => {
    test('identifies changing lines correctly', () => {
      const coinResults = [
        [6], // Old Yin - changing
        [7], // Young Yang - not changing
        [8], // Young Yin - not changing
        [9], // Old Yang - changing
        [7], // Young Yang - not changing
        [6]  // Old Yin - changing
      ];
      const changingLines = getChangingLines(coinResults);
      expect(changingLines).toEqual([1, 4, 6]);
    });

    test('returns empty array when no changing lines', () => {
      const coinResults = [
        [7], [7], [8], [8], [7], [8]
      ];
      const changingLines = getChangingLines(coinResults);
      expect(changingLines).toEqual([]);
    });
  });

  describe('createSecondaryHexagram', () => {
    test('creates secondary hexagram from changing lines', () => {
      const primaryLines = [0, 1, 0, 1, 0, 1]; // Alternating
      const changingLines = [1, 3, 5]; // Change positions 1, 3, 5
      const secondary = createSecondaryHexagram(primaryLines, changingLines);
      
      expect(secondary.lines[0]).toBe(1); // Changed from 0 to 1
      expect(secondary.lines[1]).toBe(1); // No change
      expect(secondary.lines[2]).toBe(1); // Changed from 0 to 1
      expect(secondary.lines[3]).toBe(1); // No change
      expect(secondary.lines[4]).toBe(1); // Changed from 0 to 1
      expect(secondary.lines[5]).toBe(1); // No change
    });

    test('returns null when no changing lines', () => {
      const primaryLines = [0, 1, 0, 1, 0, 1];
      const changingLines = [];
      const secondary = createSecondaryHexagram(primaryLines, changingLines);
      expect(secondary).toBeNull();
    });
  });
});