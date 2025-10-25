// Comprehensive test runner for MediMeal
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting MediMeal Playwright Test Suite...\n');
    
    const testFiles = [
      'auth.spec.js',
      'dashboard.spec.js', 
      'health-survey.spec.js',
      'admin.spec.js',
      'doctor.spec.js'
    ];

    for (const testFile of testFiles) {
      await this.runTestFile(testFile);
    }

    this.printSummary();
  }

  async runTestFile(testFile) {
    console.log(`📋 Running ${testFile}...`);
    
    try {
      const result = execSync(`npx playwright test tests/${testFile} --reporter=json`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log(`✅ ${testFile} - PASSED\n`);
      this.testResults.passed++;
      
    } catch (error) {
      console.log(`❌ ${testFile} - FAILED`);
      console.log(`Error: ${error.message}\n`);
      this.testResults.failed++;
    }
    
    this.testResults.total++;
  }

  async runSpecificTest(testFile, testName) {
    console.log(`🎯 Running specific test: ${testName} in ${testFile}...`);
    
    try {
      const result = execSync(`npx playwright test tests/${testFile} --grep "${testName}"`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log(`✅ Test "${testName}" - PASSED\n`);
      
    } catch (error) {
      console.log(`❌ Test "${testName}" - FAILED`);
      console.log(`Error: ${error.message}\n`);
    }
  }

  async runTestsByBrowser(browser) {
    console.log(`🌐 Running tests on ${browser}...`);
    
    try {
      const result = execSync(`npx playwright test --project=${browser}`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log(`✅ ${browser} tests - PASSED\n`);
      
    } catch (error) {
      console.log(`❌ ${browser} tests - FAILED`);
      console.log(`Error: ${error.message}\n`);
    }
  }

  async runTestsWithUI() {
    console.log('🎭 Running tests with Playwright UI...');
    
    try {
      execSync('npx playwright test --ui', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
    } catch (error) {
      console.log(`❌ UI tests failed: ${error.message}`);
    }
  }

  async runTestsInDebugMode() {
    console.log('🐛 Running tests in debug mode...');
    
    try {
      execSync('npx playwright test --debug', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
    } catch (error) {
      console.log(`❌ Debug tests failed: ${error.message}`);
    }
  }

  async generateTestReport() {
    console.log('📊 Generating test report...');
    
    try {
      execSync('npx playwright show-report', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
    } catch (error) {
      console.log(`❌ Report generation failed: ${error.message}`);
    }
  }

  printSummary() {
    console.log('📈 Test Summary:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏭️  Skipped: ${this.testResults.skipped}`);
    console.log(`📊 Total: ${this.testResults.total}`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${this.testResults.failed} test(s) failed.`);
    }
  }

  printHelp() {
    console.log(`
🧪 MediMeal Playwright Test Runner

Usage:
  node test-runner.js [command] [options]

Commands:
  all                    Run all tests
  auth                   Run authentication tests
  dashboard              Run dashboard tests
  health-survey          Run health survey tests
  admin                  Run admin tests
  doctor                 Run doctor tests
  browser <name>         Run tests on specific browser (chromium, firefox, webkit)
  ui                     Run tests with Playwright UI
  debug                  Run tests in debug mode
  report                 Generate and show test report
  help                   Show this help message

Examples:
  node test-runner.js all
  node test-runner.js auth
  node test-runner.js browser chromium
  node test-runner.js ui
  node test-runner.js debug
    `);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const runner = new TestRunner();

  switch (command) {
    case 'all':
      await runner.runAllTests();
      break;
    case 'auth':
      await runner.runTestFile('auth.spec.js');
      break;
    case 'dashboard':
      await runner.runTestFile('dashboard.spec.js');
      break;
    case 'health-survey':
      await runner.runTestFile('health-survey.spec.js');
      break;
    case 'admin':
      await runner.runTestFile('admin.spec.js');
      break;
    case 'doctor':
      await runner.runTestFile('doctor.spec.js');
      break;
    case 'browser':
      const browser = args[1];
      if (browser) {
        await runner.runTestsByBrowser(browser);
      } else {
        console.log('❌ Please specify a browser: chromium, firefox, or webkit');
      }
      break;
    case 'ui':
      await runner.runTestsWithUI();
      break;
    case 'debug':
      await runner.runTestsInDebugMode();
      break;
    case 'report':
      await runner.generateTestReport();
      break;
    case 'help':
    default:
      runner.printHelp();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestRunner;


