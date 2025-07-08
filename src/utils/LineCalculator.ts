/**
 * LineCalculator - Handles I Ching line calculations based on traditional 3-coin method
 * 
 * Traditional I Ching Coin Method:
 * - Heads = 3 points, Tails = 2 points
 * - 6 points (3 tails): Old Yin - broken line, changing ⚋→⚊
 * - 7 points (2 tails, 1 head): Young Yang - solid line ⚊
 * - 8 points (1 tail, 2 heads): Young Yin - broken line ⚋
 * - 9 points (3 heads): Old Yang - solid line, changing ⚊→⚋
 */

export interface CoinResult {
  coin1: 'heads' | 'tails';
  coin2: 'heads' | 'tails';
  coin3: 'heads' | 'tails';
}

export interface LineResult {
  sum: number;
  type: 'solid' | 'broken';
  isChanging: boolean;
  description: string;
  symbol: string;
  changingSymbol?: string;
}

export interface HexagramLine {
  position: number; // 1-6, bottom to top
  original: LineResult;
  changed?: LineResult;
}

export interface HexagramResult {
  lines: HexagramLine[];
  changingLines: number[];
  primaryNumber: number;
  secondaryNumber?: number;
  coinHistory: CoinResult[];
}

export class LineCalculator {
  /**
   * Calculate the sum of three coins
   */
  static calculateSum(coinResult: CoinResult): number {
    const { coin1, coin2, coin3 } = coinResult;
    let sum = 0;
    
    sum += coin1 === 'heads' ? 3 : 2;
    sum += coin2 === 'heads' ? 3 : 2;
    sum += coin3 === 'heads' ? 3 : 2;
    
    return sum;
  }

  /**
   * Determine line type based on sum
   */
  static determineLineType(sum: number): LineResult {
    switch (sum) {
      case 6: // 3 tails - Old Yin
        return {
          sum,
          type: 'broken',
          isChanging: true,
          description: 'Old Yin (changing)',
          symbol: '⚋',
          changingSymbol: '⚊'
        };
      
      case 7: // 2 tails, 1 head - Young Yang
        return {
          sum,
          type: 'solid',
          isChanging: false,
          description: 'Young Yang (stable)',
          symbol: '⚊'
        };
      
      case 8: // 1 tail, 2 heads - Young Yin
        return {
          sum,
          type: 'broken',
          isChanging: false,
          description: 'Young Yin (stable)',
          symbol: '⚋'
        };
      
      case 9: // 3 heads - Old Yang
        return {
          sum,
          type: 'solid',
          isChanging: true,
          description: 'Old Yang (changing)',
          symbol: '⚊',
          changingSymbol: '⚋'
        };
      
      default:
        throw new Error(`Invalid sum: ${sum}. Sum must be between 6 and 9.`);
    }
  }

  /**
   * Calculate a single line from coin results
   */
  static calculateLine(coinResult: CoinResult, position: number): HexagramLine {
    const sum = this.calculateSum(coinResult);
    const original = this.determineLineType(sum);
    
    const line: HexagramLine = {
      position,
      original
    };

    // If the line is changing, calculate the changed line
    if (original.isChanging) {
      const changedType = original.type === 'solid' ? 'broken' : 'solid';
      line.changed = {
        sum: original.sum,
        type: changedType,
        isChanging: false,
        description: `Changed to ${changedType === 'solid' ? 'Yang' : 'Yin'}`,
        symbol: changedType === 'solid' ? '⚊' : '⚋'
      };
    }

    return line;
  }

  /**
   * Calculate hexagram number from line array
   * Uses traditional trigram values to determine hexagram number
   */
  static calculateHexagramNumber(lines: LineResult[]): number {
    // Convert lines to binary (1 for solid, 0 for broken)
    const binaryLines = lines.map(line => line.type === 'solid' ? 1 : 0);
    
    // Split into upper and lower trigrams
    const lowerTrigram = binaryLines.slice(0, 3); // Lines 1-3
    const upperTrigram = binaryLines.slice(3, 6); // Lines 4-6
    
    // Traditional trigram values
    const trigramValues: { [key: string]: number } = {
      '111': 1, // Heaven/Qian
      '000': 8, // Earth/Kun
      '100': 4, // Thunder/Zhen
      '010': 5, // Wind/Xun
      '001': 6, // Water/Kan
      '101': 3, // Fire/Li
      '011': 7, // Mountain/Gen
      '110': 2  // Lake/Dui
    };

    const lowerKey = lowerTrigram.join('');
    const upperKey = upperTrigram.join('');
    
    const lowerValue = trigramValues[lowerKey];
    const upperValue = trigramValues[upperKey];
    
    // Calculate hexagram number using traditional formula
    // This is a simplified calculation - in practice, you'd use a lookup table
    return ((upperValue - 1) * 8) + lowerValue;
  }

  /**
   * Process all six coin tosses to generate complete hexagram
   */
  static generateHexagram(coinResults: CoinResult[]): HexagramResult {
    if (coinResults.length !== 6) {
      throw new Error('Hexagram requires exactly 6 coin tosses');
    }

    const lines: HexagramLine[] = [];
    const changingLines: number[] = [];

    // Process each coin toss (building from bottom to top)
    coinResults.forEach((coinResult, index) => {
      const position = index + 1;
      const line = this.calculateLine(coinResult, position);
      
      lines.push(line);
      
      if (line.original.isChanging) {
        changingLines.push(position);
      }
    });

    // Calculate primary hexagram number
    const primaryNumber = this.calculateHexagramNumber(lines.map(l => l.original));
    
    // Calculate secondary hexagram number if there are changing lines
    let secondaryNumber: number | undefined;
    if (changingLines.length > 0) {
      const changedLines = lines.map(line => 
        line.changed || line.original
      );
      secondaryNumber = this.calculateHexagramNumber(changedLines);
    }

    return {
      lines,
      changingLines,
      primaryNumber,
      secondaryNumber,
      coinHistory: coinResults
    };
  }

  /**
   * Get visual representation of hexagram
   */
  static getHexagramVisual(hexagramResult: HexagramResult): string {
    return hexagramResult.lines
      .slice()
      .reverse() // Display top to bottom
      .map(line => {
        const symbol = line.original.symbol;
        const indicator = line.original.isChanging ? ' ○' : '';
        return `${symbol}${indicator}`;
      })
      .join('\n');
  }

  /**
   * Get summary of hexagram result
   */
  static getHexagramSummary(hexagramResult: HexagramResult): string {
    const { primaryNumber, secondaryNumber, changingLines } = hexagramResult;
    
    let summary = `Primary Hexagram: #${primaryNumber}`;
    
    if (secondaryNumber) {
      summary += `\nSecondary Hexagram: #${secondaryNumber}`;
    }
    
    if (changingLines.length > 0) {
      summary += `\nChanging Lines: ${changingLines.join(', ')}`;
    }
    
    return summary;
  }

  /**
   * Validate coin result
   */
  static validateCoinResult(coinResult: CoinResult): boolean {
    const validValues = ['heads', 'tails'];
    return (
      validValues.includes(coinResult.coin1) &&
      validValues.includes(coinResult.coin2) &&
      validValues.includes(coinResult.coin3)
    );
  }
}

export default LineCalculator;