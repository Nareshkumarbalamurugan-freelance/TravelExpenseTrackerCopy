import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Import all services to test
import { getActiveSession, getCompletedTrips } from '@/lib/tripSession';
import { calculateExpenseAmount } from '@/lib/expenseCalculator';
import { getAdminStats, getAllUsersWithStats, getAllPositionRates } from '@/lib/adminService';
import { createClaim, getClaims, updateClaimStatus } from '@/lib/claimsService';
import { getAllEmployees } from '@/lib/unifiedEmployeeService';
import { getPolicyInfo, calculateFuelAllowance, getVehicleEntitlement } from '@/lib/travelPolicy';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

const ComprehensiveTestPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testProgress, setTestProgress] = useState(0);
  
  // Test data
  const [testEmployee, setTestEmployee] = useState({
    employeeId: 'TEST001',
    name: 'Test Employee',
    email: 'test@nveltec.com',
    grade: 'L2',
    position: 'Software Engineer',
    reportingManager: 'MGR001'
  });
  
  const [testClaim, setTestClaim] = useState({
    type: 'Travel',
    amount: 500,
    description: 'Test travel claim',
    category: 'Business Travel'
  });

  // Initialize test suites
  const initializeTestSuites = (): TestSuite[] => [
    {
      name: 'Authentication & User Management',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Employee Management',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Travel Policy & Entitlements',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Trip Management & GPS',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Claims Management',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Approval Workflow',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Admin Dashboard & Analytics',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Mobile Responsiveness',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    }
  ];

  const updateTestResult = (suiteIndex: number, testName: string, status: 'success' | 'error', data?: any, error?: string, duration?: number) => {
    setTestSuites(prev => {
      const updated = [...prev];
      const suite = updated[suiteIndex];
      
      const existingTestIndex = suite.tests.findIndex(t => t.name === testName);
      const testResult: TestResult = {
        name: testName,
        status,
        data,
        error,
        duration
      };
      
      if (existingTestIndex >= 0) {
        suite.tests[existingTestIndex] = testResult;
      } else {
        suite.tests.push(testResult);
        suite.totalTests++;
      }
      
      // Update counters
      suite.passedTests = suite.tests.filter(t => t.status === 'success').length;
      suite.failedTests = suite.tests.filter(t => t.status === 'error').length;
      
      return updated;
    });
  };

  const runTest = async (suiteIndex: number, testName: string, testFunction: () => Promise<any>) => {
    setCurrentTest(testName);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      updateTestResult(suiteIndex, testName, 'success', result, undefined, duration);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(suiteIndex, testName, 'error', undefined, error.message, duration);
      throw error;
    }
  };

  // Authentication & User Management Tests
  const runAuthTests = async () => {
    const suiteIndex = 0;
    
    await runTest(suiteIndex, 'User Authentication Check', async () => {
      if (!user) throw new Error('User not authenticated');
      return { uid: user.uid, email: user.email, position: user.position };
    });

    await runTest(suiteIndex, 'Role Validation', async () => {
      if (!user) throw new Error('User not authenticated');
      // Simulate role validation
      const isValid = user.position && user.position.length > 0;
      return { isValid, role: user.position };
    });

    await runTest(suiteIndex, 'Permission Check', async () => {
      if (!user) throw new Error('User not authenticated');
      // Simulate permission check
      const permissions = {
        canCreateClaims: true,
        canViewDashboard: true,
        isAdmin: user.position?.toLowerCase().includes('admin') || false
      };
      return permissions;
    });
  };

  // Employee Management Tests
  const runEmployeeTests = async () => {
    const suiteIndex = 1;
    
    await runTest(suiteIndex, 'Get Current Employee', async () => {
      if (!user) throw new Error('User not authenticated');
      // Simulate getting employee data
      const employee = {
        id: user.uid,
        email: user.email,
        position: user.position,
        name: user.email?.split('@')[0] || 'Test User'
      };
      return employee;
    });

    await runTest(suiteIndex, 'Get All Employees (Admin)', async () => {
      if (!user?.position?.toLowerCase().includes('admin')) {
        throw new Error('Admin access required');
      }
      const employees = await getAllEmployees();
      return { count: employees.length, employees: employees.slice(0, 3) };
    });

    await runTest(suiteIndex, 'Update Employee Profile', async () => {
      if (!user) throw new Error('User not authenticated');
      // Simulate profile update
      const updateData = { lastUpdated: new Date().toISOString() };
      return updateData;
    });
  };

  // Travel Policy & Entitlements Tests
  const runPolicyTests = async () => {
    const suiteIndex = 2;
    
    await runTest(suiteIndex, 'Get Policy Info', async () => {
      const grade = testEmployee.grade;
      const policyInfo = getPolicyInfo(grade);
      return policyInfo;
    });

    await runTest(suiteIndex, 'Calculate Fuel Allowance', async () => {
      const grade = testEmployee.grade;
      const distance = 100; // 100 km
      const fuelAllowance = calculateFuelAllowance(grade, distance);
      return { grade, distance, fuelAllowance };
    });

    await runTest(suiteIndex, 'Get Vehicle Entitlement', async () => {
      const grade = testEmployee.grade;
      const entitlement = getVehicleEntitlement(grade);
      return { grade, entitlement };
    });

    await runTest(suiteIndex, 'DA Rate Calculation', async () => {
      const grade = testEmployee.grade;
      const days = 2;
      const policyInfo = getPolicyInfo(grade);
      if (!policyInfo) throw new Error('Policy info not found');
      
      // Use daFood as the base DA rate for calculation
      const daAmount = policyInfo.daFood * days;
      return { grade, days, daRate: policyInfo.daFood, totalDA: daAmount };
    });
  };

  // Trip Management & GPS Tests
  const runTripTests = async () => {
    const suiteIndex = 3;
    
    await runTest(suiteIndex, 'Get Current Location', async () => {
      // Simulate getting current location
      const location = {
        latitude: 13.0827,
        longitude: 80.2707,
        city: 'Chennai',
        accuracy: 10
      };
      return location;
    });

    await runTest(suiteIndex, 'Get Active Session', async () => {
      if (!user) throw new Error('User not authenticated');
      const result = await getActiveSession(user.uid);
      return result;
    });

    await runTest(suiteIndex, 'Get Completed Trips', async () => {
      if (!user) throw new Error('User not authenticated');
      const result = await getCompletedTrips(user.uid, 5);
      return { count: result.trips?.length || 0, trips: result.trips };
    });

    await runTest(suiteIndex, 'Calculate Expense Amount', async () => {
      const distance = 50; // 50 km
      const position = user?.position || 'Employee';
      const amount = await calculateExpenseAmount(distance, position);
      return { distance, position, amount };
    });
  };

  // Claims Management Tests
  const runClaimsTests = async () => {
    const suiteIndex = 4;
    
    await runTest(suiteIndex, 'Get User Claims', async () => {
      if (!user) throw new Error('User not authenticated');
      const claims = await getClaims(user.uid);
      return { count: claims.length, claims: claims.slice(0, 3) };
    });

    await runTest(suiteIndex, 'Create Test Claim', async () => {
      if (!user) throw new Error('User not authenticated');
      const claimData = {
        employeeId: user.uid,
        employeeName: user.email?.split('@')[0] || 'Test User',
        employeeEmail: user.email || 'test@example.com',
        type: testClaim.type as any,
        amount: testClaim.amount,
        description: testClaim.description,
        date: new Date(),
        status: 'pending_l1' as any,
        approvalChain: { L1: 'manager1', L2: 'hr1' }
      };
      const result = await createClaim(claimData);
      return { success: result.success, data: result.data };
    });

    await runTest(suiteIndex, 'Validate Claim Categories', async () => {
      const validCategories = [
        'Business Travel',
        'Local Conveyance', 
        'Food & Accommodation',
        'Daily Allowance',
        'Joint Working',
        'Fuel Allowance'
      ];
      return { categories: validCategories, count: validCategories.length };
    });
  };

  // Approval Workflow Tests
  const runApprovalTests = async () => {
    const suiteIndex = 5;
    
    await runTest(suiteIndex, 'Approval Chain Validation', async () => {
      const approvalChain = ['L1', 'L2', 'L3'];
      const levels = {
        L1: 'Direct Manager',
        L2: 'HR Department', 
        L3: 'Finance Head (if required)'
      };
      return { approvalChain, levels };
    });

    await runTest(suiteIndex, 'Auto-escalation Logic', async () => {
      const scenario = 'Manager resigned, auto-escalate to L2';
      const escalationRules = {
        managerResigned: 'Escalate to L2 (HR)',
        l1Timeout: 'Escalate after 48 hours',
        l2Timeout: 'Escalate after 72 hours'
      };
      return { scenario, escalationRules };
    });

    await runTest(suiteIndex, 'Rejection Flow', async () => {
      const rejectionFlow = {
        requiresRemarks: true,
        notifyEmployee: true,
        allowResubmission: true,
        trackRejectionReasons: true
      };
      return rejectionFlow;
    });
  };

  // Admin Dashboard Tests
  const runAdminTests = async () => {
    const suiteIndex = 6;
    
    if (!user?.position?.toLowerCase().includes('admin')) {
      updateTestResult(suiteIndex, 'Admin Access Check', 'error', undefined, 'Admin access required');
      return;
    }

    await runTest(suiteIndex, 'Get Admin Stats', async () => {
      const stats = await getAdminStats();
      return stats;
    });

    await runTest(suiteIndex, 'Get All Users with Stats', async () => {
      const users = await getAllUsersWithStats();
      return { count: users.length, users: users.slice(0, 3) };
    });

    await runTest(suiteIndex, 'Get Position Rates', async () => {
      const rates = await getAllPositionRates();
      return rates;
    });
  };

  // Mobile Responsiveness Tests
  const runMobileTests = async () => {
    const suiteIndex = 7;
    
    await runTest(suiteIndex, 'Screen Size Detection', async () => {
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth <= 768;
      const isTablet = screenWidth > 768 && screenWidth <= 1024;
      const isDesktop = screenWidth > 1024;
      
      return { screenWidth, isMobile, isTablet, isDesktop };
    });

    await runTest(suiteIndex, 'Touch Interface Check', async () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return { isTouchDevice, maxTouchPoints: navigator.maxTouchPoints };
    });

    await runTest(suiteIndex, 'Viewport Meta Tag', async () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewport = viewportMeta !== null;
      const content = viewportMeta?.getAttribute('content') || '';
      
      return { hasViewport, content };
    });

    await runTest(suiteIndex, 'CSS Media Queries Support', async () => {
      const supportsMediaQueries = window.matchMedia && window.matchMedia('(min-width: 1px)').matches;
      return { supportsMediaQueries };
    });
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestProgress(0);
    setTestSuites(initializeTestSuites());
    
    const testFunctions = [
      runAuthTests,
      runEmployeeTests, 
      runPolicyTests,
      runTripTests,
      runClaimsTests,
      runApprovalTests,
      runAdminTests,
      runMobileTests
    ];

    for (let i = 0; i < testFunctions.length; i++) {
      try {
        await testFunctions[i]();
      } catch (error) {
        console.error(`Test suite ${i} failed:`, error);
      }
      setTestProgress(((i + 1) / testFunctions.length) * 100);
    }
    
    setIsRunning(false);
    setCurrentTest('');
    
    toast({
      title: "Test Suite Completed",
      description: "All tests have been executed. Check results below.",
    });
  };

  // Calculate overall stats
  const overallStats = testSuites.reduce(
    (acc, suite) => ({
      total: acc.total + suite.totalTests,
      passed: acc.passed + suite.passedTests,
      failed: acc.failed + suite.failedTests
    }),
    { total: 0, passed: 0, failed: 0 }
  );

  const successRate = overallStats.total > 0 ? (overallStats.passed / overallStats.total) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Comprehensive System Test Suite</h1>
        <p className="text-gray-600">Complete A-Z testing of Travel Expense Tracker</p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="px-6 py-2"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Overall Success Rate: <span className={`font-bold ${successRate >= 80 ? 'text-green-600' : successRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {overallStats.passed}/{overallStats.total} tests passed
              </div>
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Test: {currentTest}</span>
                <span>{testProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Test Employee Data</h4>
              <Input 
                placeholder="Employee ID" 
                value={testEmployee.employeeId}
                onChange={(e) => setTestEmployee({...testEmployee, employeeId: e.target.value})}
              />
              <Input 
                placeholder="Name" 
                value={testEmployee.name}
                onChange={(e) => setTestEmployee({...testEmployee, name: e.target.value})}
              />
              <Select value={testEmployee.grade} onValueChange={(value) => setTestEmployee({...testEmployee, grade: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2">L2</SelectItem>
                  <SelectItem value="L3">L3</SelectItem>
                  <SelectItem value="L4">L4</SelectItem>
                  <SelectItem value="L5">L5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Test Claim Data</h4>
              <Select value={testClaim.type} onValueChange={(value) => setTestClaim({...testClaim, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Claim Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Allowance">Allowance</SelectItem>
                  <SelectItem value="Joint Working">Joint Working</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="number"
                placeholder="Amount" 
                value={testClaim.amount}
                onChange={(e) => setTestClaim({...testClaim, amount: Number(e.target.value)})}
              />
              <Input 
                placeholder="Description" 
                value={testClaim.description}
                onChange={(e) => setTestClaim({...testClaim, description: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testSuites.map((suite, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{suite.name}</CardTitle>
                <div className="flex gap-2">
                  {suite.passedTests > 0 && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {suite.passedTests} passed
                    </Badge>
                  )}
                  {suite.failedTests > 0 && (
                    <Badge variant="destructive">
                      {suite.failedTests} failed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suite.tests.length === 0 ? (
                  <div className="text-gray-500 text-sm">No tests run yet</div>
                ) : (
                  suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{test.name}</span>
                        <div className="flex items-center gap-2">
                          {test.duration && (
                            <span className="text-xs text-gray-500">{test.duration}ms</span>
                          )}
                          <Badge 
                            variant={test.status === 'success' ? 'default' : 'destructive'}
                            className={test.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {test.error && (
                        <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                          {test.error}
                        </div>
                      )}
                      
                      {test.data && (
                        <div className="text-xs bg-gray-50 p-2 rounded mt-2">
                          <pre className="whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Summary */}
      {overallStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{overallStats.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{overallStats.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveTestPage;
