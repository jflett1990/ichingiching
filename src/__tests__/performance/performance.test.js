import { performance } from 'perf_hooks';
import { performDivination, calculateHexagramNumber } from '../../utils/divination';
import { getHexagramData, generateRandomHexagram } from '../../utils/hexagram';

describe('Performance Tests', () => {
  describe('Divination Performance', () => {
    test('performDivination completes within acceptable time', () => {
      const iterations = 100;
      const maxTimePerIteration = 50; // milliseconds
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        performDivination(`Test question ${i}`);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;
      
      expect(avgTime).toBeLessThan(maxTimePerIteration);
      console.log(`Average divination time: ${avgTime.toFixed(2)}ms`);
    });

    test('hexagram calculation is efficient for all combinations', () => {
      const startTime = performance.now();
      
      // Test all possible line combinations (2^6 = 64)
      for (let i = 0; i < 64; i++) {
        const lines = [];
        for (let j = 0; j < 6; j++) {
          lines.push((i >> j) & 1);
        }
        calculateHexagramNumber(lines);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(100); // Should complete in under 100ms
      console.log(`All hexagram calculations time: ${totalTime.toFixed(2)}ms`);
    });

    test('hexagram data retrieval is fast', () => {
      const iterations = 1000;
      const maxTime = 100; // milliseconds
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const hexagramNumber = (i % 64) + 1;
        getHexagramData(hexagramNumber);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(maxTime);
      console.log(`${iterations} hexagram data retrievals: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    test('divination does not cause memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 1000;
      
      // Perform many divinations
      for (let i = 0; i < iterations; i++) {
        performDivination(`Memory test question ${i}`);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const maxAcceptableIncrease = 10 * 1024 * 1024; // 10MB
      
      expect(memoryIncrease).toBeLessThan(maxAcceptableIncrease);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('random hexagram generation is memory efficient', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        generateRandomHexagram();
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const maxAcceptableIncrease = 5 * 1024 * 1024; // 5MB
      
      expect(memoryIncrease).toBeLessThan(maxAcceptableIncrease);
    });
  });

  describe('Concurrent Operations', () => {
    test('multiple simultaneous divinations perform well', async () => {
      const concurrentOperations = 50;
      const maxTotalTime = 1000; // milliseconds
      
      const startTime = performance.now();
      
      const promises = Array(concurrentOperations).fill().map((_, i) => 
        Promise.resolve(performDivination(`Concurrent question ${i}`))
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(maxTotalTime);
      console.log(`${concurrentOperations} concurrent divinations: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Large Dataset Handling', () => {
    test('handles large question text efficiently', () => {
      const largeQuestion = 'a'.repeat(10000); // 10KB question
      const iterations = 10;
      const maxTimePerIteration = 100; // milliseconds
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        performDivination(largeQuestion);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      expect(avgTime).toBeLessThan(maxTimePerIteration);
    });

    test('handles many hexagram lookups efficiently', () => {
      const lookups = 10000;
      const maxTime = 500; // milliseconds
      
      const startTime = performance.now();
      
      for (let i = 0; i < lookups; i++) {
        const hexagramNumber = (i % 64) + 1;
        const data = getHexagramData(hexagramNumber);
        
        // Verify we got valid data to ensure the lookup actually happened
        expect(data).toBeTruthy();
        expect(data.number).toBe(hexagramNumber);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(maxTime);
      console.log(`${lookups} hexagram lookups: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Benchmarks', () => {
    test('establishes performance baselines', () => {
      const benchmarks = {
        singleDivination: () => performDivination('Benchmark question'),
        hexagramCalculation: () => calculateHexagramNumber([1, 0, 1, 0, 1, 0]),
        hexagramDataRetrieval: () => getHexagramData(1),
        randomGeneration: () => generateRandomHexagram()
      };

      const results = {};
      
      Object.entries(benchmarks).forEach(([name, fn]) => {
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          fn();
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;
        results[name] = avgTime;
        
        console.log(`${name}: ${avgTime.toFixed(4)}ms average`);
      });

      // Verify all operations are under reasonable thresholds
      expect(results.singleDivination).toBeLessThan(5);
      expect(results.hexagramCalculation).toBeLessThan(0.1);
      expect(results.hexagramDataRetrieval).toBeLessThan(0.1);
      expect(results.randomGeneration).toBeLessThan(1);
    });
  });

  describe('Stress Tests', () => {
    test('handles rapid successive divinations', () => {
      const rapidDivinations = 1000;
      const maxTime = 2000; // milliseconds
      
      const startTime = performance.now();
      
      for (let i = 0; i < rapidDivinations; i++) {
        performDivination(`Rapid divination ${i}`);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(maxTime);
      console.log(`${rapidDivinations} rapid divinations: ${totalTime.toFixed(2)}ms`);
    });

    test('maintains performance under various question lengths', () => {
      const questionLengths = [1, 10, 100, 1000, 5000];
      const maxTimePerLength = 50; // milliseconds
      
      questionLengths.forEach(length => {
        const question = 'a'.repeat(length);
        const iterations = 50;
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          performDivination(question);
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;
        
        expect(avgTime).toBeLessThan(maxTimePerLength);
        console.log(`Question length ${length}: ${avgTime.toFixed(2)}ms average`);
      });
    });
  });
});