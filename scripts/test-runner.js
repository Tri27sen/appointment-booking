#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Resolve local jest binary
const jestPath = path.resolve(__dirname, '../node_modules/.bin/jest');

class TestRunner {
  constructor() {
    this.testSuites = [
      { name: 'Authentication', file: 'auth.test.js' },
      { name: 'Availability', file: 'availability.test.js' },
      { name: 'Appointments', file: 'appointments.test.js' },
      { name: 'Health Check', file: 'health.test.js' },
      { name: 'Integration', file: 'integration.test.js' },
      { name: 'Performance', file: 'performance.test.js' }
    ];
  }

  async runAllTests() {
    console.log('🚀 Starting E2E Test Suite...\n');
    const startTime = Date.now();

    try {
      await this.runJestTests();
      const duration = Date.now() - startTime;
      console.log(`\n✅ All tests completed successfully in ${duration}ms`);
    } catch (error) {
      console.error('\n❌ Tests failed:', error.message);
      process.exit(1);
    }
  }

  async runJestTests() {
    return new Promise((resolve, reject) => {
      const jest = spawn(jestPath, ['--runInBand', '--verbose'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      jest.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`Jest exited with code ${code}`));
      });
    });
  }

  async runSingleSuite(suiteName) {
    const suite = this.testSuites.find(s =>
      s.name.toLowerCase() === suiteName.toLowerCase()
    );

    if (!suite) {
      console.error(` Test suite '${suiteName}' not found`);
      console.log('Available suites:', this.testSuites.map(s => s.name).join(', '));
      return;
    }

    console.log(` Running ${suite.name} tests...\n`);

    return new Promise((resolve, reject) => {
      const jest = spawn(jestPath, [`tests/e2e/${suite.file}`, '--verbose'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      jest.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`${suite.name} tests failed`));
      });
    });
  }

  async runWithCoverage() {
    console.log(' Running tests with coverage...\n');

    return new Promise((resolve, reject) => {
      const jest = spawn(jestPath, ['--coverage', '--runInBand'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      jest.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error('Coverage tests failed'));
      });
    });
  }

  displayHelp() {
    console.log(`
E2E Test Runner for Appointment Booking System

Usage:
  npm run test:e2e                    - Run all E2E tests
  npm run test:e2e:suite <name>      - Run specific test suite
  npm run test:e2e:coverage          - Run tests with coverage
  npm run test:e2e:watch             - Run tests in watch mode

Available test suites:
${this.testSuites.map(s => `  - ${s.name}`).join('\n')}

Examples:
  npm run test:e2e:suite auth
  npm run test:e2e:suite integration
    `);
  }
}

// CLI handling
if (require.main === module) {
  const runner = new TestRunner();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    runner.runAllTests().catch(console.error);
  } else if (args[0] === '--help' || args[0] === '-h') {
    runner.displayHelp();
  } else if (args[0] === '--coverage') {
    runner.runWithCoverage().catch(console.error);
  } else if (args[0] === '--suite' && args[1]) {
    runner.runSingleSuite(args[1]).catch(console.error);
  } else {
    console.error('Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

module.exports = TestRunner;
