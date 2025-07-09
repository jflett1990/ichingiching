#!/usr/bin/env node

/**
 * Custom Test Runner for I Ching App
 * Provides enhanced test execution with detailed reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null,
      coverage: null
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  runTestSuite(name, pattern, options = {}) {
    this.log(`Running ${name} tests...`, 'info');
    
    try {
      const command = `npx jest ${pattern} ${options.flags || ''} --json --outputFile=test-results-${name}.json`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      // Read the JSON results
      const resultsPath = `test-results-${name}.json`;
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        this.results[name] = results;
        
        // Clean up temporary file
        fs.unlinkSync(resultsPath);
        
        this.log(`${name} tests completed: ${results.numPassedTests}/${results.numTotalTests} passed`, 'success');
        return results;
      }
    } catch (error) {
      this.log(`${name} tests failed: ${error.message}`, 'error');
      this.results[name] = { error: error.message, success: false };
      return null;
    }
  }

  runCoverage() {
    this.log('Generating coverage report...', 'info');
    
    try {
      execSync('npx jest --coverage --coverageReporters=json --coverageReporters=text', {
        stdio: 'inherit'
      });
      
      // Read coverage results
      const coveragePath = 'coverage/coverage-final.json';
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        this.results.coverage = this.calculateCoverageSummary(coverage);
        this.log('Coverage report generated successfully', 'success');
      }
    } catch (error) {
      this.log(`Coverage generation failed: ${error.message}`, 'error');
    }
  }

  calculateCoverageSummary(coverage) {
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;

    Object.values(coverage).forEach(file => {
      if (file.s) {
        totalStatements += Object.keys(file.s).length;
        coveredStatements += Object.values(file.s).filter(count => count > 0).length;
      }
      if (file.b) {
        Object.values(file.b).forEach(branch => {
          totalBranches += branch.length;
          coveredBranches += branch.filter(count => count > 0).length;
        });
      }
      if (file.f) {
        totalFunctions += Object.keys(file.f).length;
        coveredFunctions += Object.values(file.f).filter(count => count > 0).length;
      }
      if (file.l) {
        totalLines += Object.keys(file.l).length;
        coveredLines += Object.values(file.l).filter(count => count > 0).length;
      }
    });

    return {
      statements: {
        covered: coveredStatements,
        total: totalStatements,
        percentage: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : 0
      },
      branches: {
        covered: coveredBranches,
        total: totalBranches,
        percentage: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0
      },
      functions: {
        covered: coveredFunctions,
        total: totalFunctions,
        percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0
      },
      lines: {
        covered: coveredLines,
        total: totalLines,
        percentage: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0
      }
    };
  }

  generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60), 'info');
    this.log('TEST EXECUTION SUMMARY', 'info');
    this.log('='.repeat(60), 'info');
    
    this.log(`Total execution time: ${duration}s`, 'info');
    
    // Test suite results
    Object.entries(this.results).forEach(([suite, results]) => {
      if (results && !results.error) {
        if (suite === 'coverage') {
          this.log(`\nCoverage Summary:`, 'info');
          this.log(`  Statements: ${results.statements.percentage}% (${results.statements.covered}/${results.statements.total})`, 'info');
          this.log(`  Branches: ${results.branches.percentage}% (${results.branches.covered}/${results.branches.total})`, 'info');
          this.log(`  Functions: ${results.functions.percentage}% (${results.functions.covered}/${results.functions.total})`, 'info');
          this.log(`  Lines: ${results.lines.percentage}% (${results.lines.covered}/${results.lines.total})`, 'info');
        } else {
          const passed = results.numPassedTests || 0;
          const total = results.numTotalTests || 0;
          const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
          
          this.log(`\n${suite.toUpperCase()} Tests: ${passed}/${total} passed (${percentage}%)`, 
            passed === total ? 'success' : 'warning');
        }
      } else if (results && results.error) {
        this.log(`\n${suite.toUpperCase()} Tests: FAILED - ${results.error}`, 'error');
      }
    });

    // Quality gates
    this.log('\n' + '-'.repeat(40), 'info');
    this.log('QUALITY GATES', 'info');
    this.log('-'.repeat(40), 'info');
    
    this.checkQualityGates();
    
    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      results: this.results,
      summary: this.generateSummary()
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    this.log('\nDetailed report saved to test-report.json', 'info');
  }

  checkQualityGates() {
    const gates = [
      {
        name: 'Unit Test Coverage',
        check: () => this.results.coverage && 
               parseFloat(this.results.coverage.statements.percentage) >= 80,
        threshold: '80%'
      },
      {
        name: 'All Unit Tests Pass',
        check: () => this.results.unit && 
               this.results.unit.numPassedTests === this.results.unit.numTotalTests,
        threshold: '100%'
      },
      {
        name: 'Integration Tests Pass',
        check: () => this.results.integration && 
               this.results.integration.numPassedTests === this.results.integration.numTotalTests,
        threshold: '100%'
      },
      {
        name: 'Performance Benchmarks',
        check: () => this.results.performance && 
               this.results.performance.numPassedTests > 0,
        threshold: 'Pass'
      }
    ];

    gates.forEach(gate => {
      const passed = gate.check();
      this.log(`  ${gate.name}: ${passed ? 'PASS' : 'FAIL'} (${gate.threshold})`, 
        passed ? 'success' : 'error');
    });
  }

  generateSummary() {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.results).forEach(([suite, results]) => {
      if (results && results.numTotalTests) {
        totalTests += results.numTotalTests;
        totalPassed += results.numPassedTests || 0;
        totalFailed += results.numFailedTests || 0;
      }
    });

    return {
      totalTests,
      totalPassed,
      totalFailed,
      successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0
    };
  }

  async runAll() {
    this.log('Starting comprehensive test suite...', 'info');
    
    // Run test suites in order
    this.runTestSuite('unit', 'src/__tests__/utils src/__tests__/services --testPathIgnorePatterns=integration --testPathIgnorePatterns=e2e --testPathIgnorePatterns=performance');
    
    this.runTestSuite('integration', 'src/__tests__/integration');
    
    this.runTestSuite('e2e', 'src/__tests__/e2e');
    
    this.runTestSuite('performance', 'src/__tests__/performance');
    
    // Generate coverage last
    this.runCoverage();
    
    // Generate final report
    this.generateReport();
    
    // Exit with appropriate code
    const allPassed = Object.values(this.results).every(result => 
      !result || !result.error && 
      (result.numTotalTests === undefined || result.numPassedTests === result.numTotalTests)
    );
    
    process.exit(allPassed ? 0 : 1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const runner = new TestRunner();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
I Ching App Test Runner

Usage: node scripts/test-runner.js [options]

Options:
  --help, -h        Show this help message
  --unit           Run only unit tests
  --integration    Run only integration tests
  --e2e            Run only e2e tests
  --performance    Run only performance tests
  --coverage       Run only coverage analysis

Examples:
  node scripts/test-runner.js                # Run all tests
  node scripts/test-runner.js --unit         # Run only unit tests
  node scripts/test-runner.js --coverage     # Generate coverage report
  `);
  process.exit(0);
}

// Run specific test types based on arguments
if (args.includes('--unit')) {
  runner.runTestSuite('unit', 'src/__tests__/utils src/__tests__/services --testPathIgnorePatterns=integration --testPathIgnorePatterns=e2e --testPathIgnorePatterns=performance');
  runner.generateReport();
} else if (args.includes('--integration')) {
  runner.runTestSuite('integration', 'src/__tests__/integration');
  runner.generateReport();
} else if (args.includes('--e2e')) {
  runner.runTestSuite('e2e', 'src/__tests__/e2e');
  runner.generateReport();
} else if (args.includes('--performance')) {
  runner.runTestSuite('performance', 'src/__tests__/performance');
  runner.generateReport();
} else if (args.includes('--coverage')) {
  runner.runCoverage();
  runner.generateReport();
} else {
  // Run all tests
  runner.runAll();
}