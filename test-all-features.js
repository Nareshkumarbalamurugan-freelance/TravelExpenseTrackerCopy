#!/usr/bin/env node

/**
 * Automated Test Script for Travel Expense Tracker
 * Run with: node test-all-features.js
 * Or: npm run test:all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class TestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.currentSuite = '';
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logBold(message, color = 'white') {
    console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    const startTime = Date.now();
    try {
      this.log(`  ├─ Running: ${testName}`, 'cyan');
      const result = await testFunction();
      const duration = Date.now() - startTime;
      this.log(`  ├─ ✅ PASS: ${testName} (${duration}ms)`, 'green');
      this.testResults.push({
        suite: this.currentSuite,
        name: testName,
        status: 'PASS',
        duration,
        result
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`  ├─ ❌ FAIL: ${testName} (${duration}ms)`, 'red');
      this.log(`  │  Error: ${error.message}`, 'red');
      this.testResults.push({
        suite: this.currentSuite,
        name: testName,
        status: 'FAIL',
        duration,
        error: error.message
      });
      return null;
    }
  }

  startSuite(suiteName) {
    this.currentSuite = suiteName;
    this.logBold(`\n🧪 ${suiteName}`, 'blue');
    this.log('─'.repeat(50), 'blue');
  }

  // File System Tests
  async runFileSystemTests() {
    this.startSuite('File System & Project Structure');

    await this.runTest('Check package.json exists', async () => {
      if (!fs.existsSync('package.json')) throw new Error('package.json not found');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return { name: pkg.name, version: pkg.version };
    });

    await this.runTest('Check src directory structure', async () => {
      const requiredDirs = ['src', 'src/components', 'src/pages', 'src/lib', 'src/context'];
      const missing = requiredDirs.filter(dir => !fs.existsSync(dir));
      if (missing.length > 0) throw new Error(`Missing directories: ${missing.join(', ')}`);
      return { directories: requiredDirs };
    });

    await this.runTest('Check critical files exist', async () => {
      const criticalFiles = [
        'src/main.tsx',
        'src/App.tsx',
        'src/pages/NewClaim.tsx',
        'src/pages/NewEmployeeDashboard.tsx',
        'src/pages/EnhancedLogin.tsx',
        'src/lib/travelPolicy.ts',
        'src/lib/claimsService.ts',
        'src/lib/firebase.ts'
      ];
      const missing = criticalFiles.filter(file => !fs.existsSync(file));
      if (missing.length > 0) throw new Error(`Missing files: ${missing.join(', ')}`);
      return { files: criticalFiles };
    });

    await this.runTest('Check Firebase configuration', async () => {
      if (!fs.existsSync('src/lib/firebase.ts')) throw new Error('Firebase config not found');
      const content = fs.readFileSync('src/lib/firebase.ts', 'utf8');
      if (!content.includes('initializeApp')) throw new Error('Firebase not properly initialized');
      return { configured: true };
    });
  }

  // Code Quality Tests
  async runCodeQualityTests() {
    this.startSuite('Code Quality & Standards');

    await this.runTest('TypeScript configuration check', async () => {
      if (!fs.existsSync('tsconfig.json')) throw new Error('tsconfig.json not found');
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      return { strict: tsconfig.compilerOptions?.strict };
    });

    await this.runTest('ESLint configuration check', async () => {
      const eslintFiles = ['eslint.config.js', '.eslintrc.js', '.eslintrc.json'];
      const hasEslint = eslintFiles.some(file => fs.existsSync(file));
      if (!hasEslint) throw new Error('ESLint configuration not found');
      return { configured: true };
    });

    await this.runTest('Check for TODO/FIXME comments', async () => {
      const checkFile = (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const todos = (content.match(/TODO|FIXME|XXX/gi) || []).length;
        return todos;
      };

      let totalTodos = 0;
      const walkDir = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            walkDir(fullPath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            totalTodos += checkFile(fullPath);
          }
        });
      };

      walkDir('src');
      return { todoCount: totalTodos };
    });
  }

  // Policy & Business Logic Tests
  async runPolicyTests() {
    this.startSuite('Travel Policy & Business Logic');

    await this.runTest('Travel policy file structure', async () => {
      if (!fs.existsSync('src/lib/travelPolicy.ts')) throw new Error('Travel policy file not found');
      const content = fs.readFileSync('src/lib/travelPolicy.ts', 'utf8');
      
      const requiredFunctions = [
        'getPolicyInfo',
        'calculateFuelAllowance', 
        'getVehicleEntitlement',
        'GRADE_POLICY'
      ];
      
      const missing = requiredFunctions.filter(fn => !content.includes(fn));
      if (missing.length > 0) throw new Error(`Missing functions: ${missing.join(', ')}`);
      
      return { functions: requiredFunctions };
    });

    await this.runTest('Grade policy validation', async () => {
      const content = fs.readFileSync('src/lib/travelPolicy.ts', 'utf8');
      const grades = ['L1', 'L2', 'L3', 'L4', 'L5'];
      
      grades.forEach(grade => {
        if (!content.includes(grade)) {
          throw new Error(`Grade ${grade} not found in policy`);
        }
      });
      
      return { grades };
    });

    await this.runTest('Fuel allowance logic check', async () => {
      const content = fs.readFileSync('src/lib/travelPolicy.ts', 'utf8');
      
      // Check for fuel calculation logic
      if (!content.includes('fuelAllowance') && !content.includes('fuel')) {
        throw new Error('Fuel allowance logic not found');
      }
      
      return { hasFuelLogic: true };
    });
  }

  // Component Tests
  async runComponentTests() {
    this.startSuite('React Components');

    await this.runTest('NewClaim component structure', async () => {
      if (!fs.existsSync('src/pages/NewClaim.tsx')) throw new Error('NewClaim component not found');
      const content = fs.readFileSync('src/pages/NewClaim.tsx', 'utf8');
      
      const requiredElements = [
        'useState',
        'useEffect', 
        'form',
        'submit',
        'claimType',
        'amount'
      ];
      
      const missing = requiredElements.filter(element => !content.includes(element));
      if (missing.length > 0) throw new Error(`Missing elements: ${missing.join(', ')}`);
      
      return { elements: requiredElements };
    });

    await this.runTest('Employee Dashboard component', async () => {
      if (!fs.existsSync('src/pages/NewEmployeeDashboard.tsx')) throw new Error('Employee Dashboard not found');
      const content = fs.readFileSync('src/pages/NewEmployeeDashboard.tsx', 'utf8');
      
      if (!content.includes('claims') && !content.includes('Claims')) {
        throw new Error('Claims functionality not found in dashboard');
      }
      
      return { hasClaims: true };
    });

    await this.runTest('Enhanced Login component', async () => {
      if (!fs.existsSync('src/pages/EnhancedLogin.tsx')) throw new Error('Enhanced Login not found');
      const content = fs.readFileSync('src/pages/EnhancedLogin.tsx', 'utf8');
      
      const mobileFeatures = ['responsive', 'mobile', 'Employee ID', 'email'];
      const foundFeatures = mobileFeatures.filter(feature => 
        content.toLowerCase().includes(feature.toLowerCase())
      );
      
      return { mobileFeatures: foundFeatures };
    });
  }

  // Service Layer Tests
  async runServiceTests() {
    this.startSuite('Service Layer & APIs');

    await this.runTest('Claims service functions', async () => {
      if (!fs.existsSync('src/lib/claimsService.ts')) throw new Error('Claims service not found');
      const content = fs.readFileSync('src/lib/claimsService.ts', 'utf8');
      
      const requiredFunctions = [
        'createClaim',
        'getClaims',
        'updateClaimStatus'
      ];
      
      const missing = requiredFunctions.filter(fn => !content.includes(fn));
      if (missing.length > 0) throw new Error(`Missing functions: ${missing.join(', ')}`);
      
      return { functions: requiredFunctions };
    });

    await this.runTest('Employee service functions', async () => {
      const employeeFiles = [
        'src/lib/employeeService.ts',
        'src/lib/unifiedEmployeeService.ts'
      ];
      
      const existingFile = employeeFiles.find(file => fs.existsSync(file));
      if (!existingFile) throw new Error('Employee service not found');
      
      const content = fs.readFileSync(existingFile, 'utf8');
      if (!content.includes('getEmployee')) {
        throw new Error('getEmployee function not found');
      }
      
      return { service: existingFile };
    });

    await this.runTest('Admin service functions', async () => {
      if (!fs.existsSync('src/lib/adminService.ts')) throw new Error('Admin service not found');
      const content = fs.readFileSync('src/lib/adminService.ts', 'utf8');
      
      const adminFunctions = ['getAdminStats', 'getAllUsers'];
      const found = adminFunctions.filter(fn => content.includes(fn));
      
      return { functions: found };
    });
  }

  // Security & Authentication Tests
  async runSecurityTests() {
    this.startSuite('Security & Authentication');

    await this.runTest('Firebase Auth configuration', async () => {
      if (!fs.existsSync('src/lib/auth.ts') && !fs.existsSync('src/context/AuthContext.tsx')) {
        throw new Error('Authentication setup not found');
      }
      return { configured: true };
    });

    await this.runTest('Environment variables check', async () => {
      const envFiles = ['.env', '.env.local', '.env.production'];
      const hasEnvFile = envFiles.some(file => fs.existsSync(file));
      
      // Check for environment variable usage
      const files = ['src/lib/firebase.ts', 'vite.config.ts'];
      let hasEnvUsage = false;
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('import.meta.env') || content.includes('process.env')) {
            hasEnvUsage = true;
          }
        }
      });
      
      return { hasEnvFile, hasEnvUsage };
    });

    await this.runTest('API key security check', async () => {
      const checkForHardcodedKeys = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            checkForHardcodedKeys(fullPath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Check for potential hardcoded API keys (basic patterns)
            if (content.match(/api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/i)) {
              throw new Error(`Potential hardcoded API key found in ${fullPath}`);
            }
          }
        });
      };
      
      checkForHardcodedKeys('src');
      return { secure: true };
    });
  }

  // Mobile & Responsive Tests
  async runMobileTests() {
    this.startSuite('Mobile & Responsive Design');

    await this.runTest('Tailwind CSS configuration', async () => {
      if (!fs.existsSync('tailwind.config.ts') && !fs.existsSync('tailwind.config.js')) {
        throw new Error('Tailwind configuration not found');
      }
      return { configured: true };
    });

    await this.runTest('Responsive design patterns', async () => {
      const componentFiles = fs.readdirSync('src/pages').filter(file => file.endsWith('.tsx'));
      let responsiveCount = 0;
      
      componentFiles.forEach(file => {
        const content = fs.readFileSync(path.join('src/pages', file), 'utf8');
        // Check for responsive classes
        if (content.includes('sm:') || content.includes('md:') || content.includes('lg:')) {
          responsiveCount++;
        }
      });
      
      const responsivePercentage = (responsiveCount / componentFiles.length) * 100;
      
      return { 
        responsiveFiles: responsiveCount,
        totalFiles: componentFiles.length,
        percentage: responsivePercentage.toFixed(1)
      };
    });

    await this.runTest('Mobile-first viewport meta tag', async () => {
      if (!fs.existsSync('index.html')) throw new Error('index.html not found');
      const content = fs.readFileSync('index.html', 'utf8');
      
      if (!content.includes('viewport')) {
        throw new Error('Viewport meta tag not found');
      }
      
      const hasViewport = content.includes('width=device-width') && content.includes('initial-scale=1');
      if (!hasViewport) {
        throw new Error('Proper viewport configuration not found');
      }
      
      return { configured: true };
    });
  }

  // Build & Deployment Tests
  async runBuildTests() {
    this.startSuite('Build & Deployment');

    await this.runTest('Vite configuration check', async () => {
      if (!fs.existsSync('vite.config.ts')) throw new Error('Vite config not found');
      const content = fs.readFileSync('vite.config.ts', 'utf8');
      
      if (!content.includes('defineConfig')) {
        throw new Error('Invalid Vite configuration');
      }
      
      return { configured: true };
    });

    await this.runTest('Package.json scripts check', async () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredScripts = ['dev', 'build', 'preview'];
      
      const missingScripts = requiredScripts.filter(script => !pkg.scripts?.[script]);
      if (missingScripts.length > 0) {
        throw new Error(`Missing scripts: ${missingScripts.join(', ')}`);
      }
      
      return { scripts: Object.keys(pkg.scripts) };
    });

    await this.runTest('Public assets check', async () => {
      if (!fs.existsSync('public')) throw new Error('Public directory not found');
      
      const requiredAssets = ['index.html'];
      const optionalAssets = ['robots.txt', 'favicon.ico', '_redirects'];
      
      const existingAssets = fs.readdirSync('public');
      const hasRequired = requiredAssets.every(asset => 
        existingAssets.includes(asset) || fs.existsSync(asset)
      );
      
      if (!hasRequired) {
        throw new Error('Required public assets missing');
      }
      
      return { assets: existingAssets };
    });
  }

  // Generate test report
  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
    const totalDuration = Date.now() - this.startTime;

    this.logBold('\n📊 TEST REPORT', 'magenta');
    this.log('═'.repeat(60), 'magenta');
    
    this.log(`Total Tests: ${totalTests}`, 'white');
    this.log(`Passed: ${passedTests}`, 'green');
    this.log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'white');
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 
      passedTests === totalTests ? 'green' : 'yellow');
    this.log(`Total Duration: ${totalDuration}ms`, 'white');

    // Group results by suite
    const suites = [...new Set(this.testResults.map(t => t.suite))];
    
    this.logBold('\n📋 Results by Suite:', 'blue');
    suites.forEach(suite => {
      const suiteTests = this.testResults.filter(t => t.suite === suite);
      const suitePassed = suiteTests.filter(t => t.status === 'PASS').length;
      const suiteTotal = suiteTests.length;
      
      this.log(`  ${suite}: ${suitePassed}/${suiteTotal}`, 
        suitePassed === suiteTotal ? 'green' : 'yellow');
    });

    // Show failed tests
    const failedTests_ = this.testResults.filter(t => t.status === 'FAIL');
    if (failedTests_.length > 0) {
      this.logBold('\n❌ Failed Tests:', 'red');
      failedTests_.forEach(test => {
        this.log(`  • ${test.suite} > ${test.name}`, 'red');
        this.log(`    Error: ${test.error}`, 'red');
      });
    }

    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1),
        duration: totalDuration
      },
      results: this.testResults
    };

    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    this.log('\n💾 Test report saved to test-report.json', 'cyan');

    return passedTests === totalTests;
  }

  async run() {
    this.logBold('🚀 Starting Comprehensive Test Suite', 'cyan');
    this.logBold('Travel Expense Tracker - A to Z Testing', 'cyan');
    this.log('═'.repeat(60), 'cyan');

    try {
      await this.runFileSystemTests();
      await this.runCodeQualityTests();
      await this.runPolicyTests();
      await this.runComponentTests();
      await this.runServiceTests();
      await this.runSecurityTests();
      await this.runMobileTests();
      await this.runBuildTests();
      
      const allPassed = this.generateReport();
      
      if (allPassed) {
        this.logBold('\n🎉 ALL TESTS PASSED! 🎉', 'green');
        process.exit(0);
      } else {
        this.logBold('\n💥 SOME TESTS FAILED', 'red');
        process.exit(1);
      }
      
    } catch (error) {
      this.log(`\n💥 Fatal Error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the tests
const testRunner = new TestRunner();
testRunner.run();
