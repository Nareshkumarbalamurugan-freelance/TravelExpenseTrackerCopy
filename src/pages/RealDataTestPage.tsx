import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Import real services
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

const RealDataTestPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  // Real test data that will be submitted to Firebase
  const [testClaim, setTestClaim] = useState({
    type: 'travel',
    amount: 500,
    description: 'Real test travel claim for Chennai office visit',
    category: 'Business Travel'
  });

  const updateTestResult = (testName: string, status: 'success' | 'error', data?: any, error?: string, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.findIndex(t => t.name === testName);
      const newResult = { name: testName, status, data, error, duration };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResult;
        return updated;
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runRealTest = async (testName: string, testFunction: () => Promise<any>) => {
    setCurrentTest(testName);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'success', result, undefined, duration);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'error', undefined, error.message, duration);
      throw error;
    }
  };

  const runAllRealTests = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login first to run tests with real data",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Get real user data
      await runRealTest('Get Current User Data', async () => {
        return {
          uid: user.uid,
          email: user.email,
          position: user.position,
          authenticated: true
        };
      });

      // Test 2: Get real trip data
      await runRealTest('Get Active Trip Session', async () => {
        const result = await getActiveSession(user.uid);
        return result;
      });

      // Test 3: Get completed trips
      await runRealTest('Get Completed Trips (Last 10)', async () => {
        const result = await getCompletedTrips(user.uid, 10);
        return {
          count: result.trips?.length || 0,
          trips: result.trips?.slice(0, 3) || [], // Show first 3 for display
          error: result.error
        };
      });

      // Test 4: Get real claims data
      await runRealTest('Get User Claims', async () => {
        const claims = await getClaims(user.uid);
        return {
          count: claims.length,
          claims: claims.slice(0, 3), // Show first 3
          recentClaim: claims[0] || null
        };
      });

      // Test 5: Test travel policy with real grade
      await runRealTest('Get Travel Policy for Current User', async () => {
        const grade = user.position || 'L2'; // Use actual user grade or default
        const policyInfo = getPolicyInfo(grade);
        const vehicleEntitlement = getVehicleEntitlement(grade);
        const fuelAllowance = calculateFuelAllowance(grade, 100); // 100km test
        
        return {
          grade,
          policy: policyInfo,
          vehicleEntitlement,
          fuelAllowanceFor100km: fuelAllowance
        };
      });

      // Test 6: Calculate real expense
      await runRealTest('Calculate Expense for 50km', async () => {
        const distance = 50;
        const position = user.position || 'Employee';
        const amount = await calculateExpenseAmount(distance, position);
        return {
          distance,
          position,
          calculatedAmount: amount
        };
      });

      // Test 7: Create a REAL claim (if user confirms)
      const shouldCreateRealClaim = window.confirm(
        "Do you want to create a REAL test claim in Firebase? This will be actual data in your database."
      );
      
      if (shouldCreateRealClaim) {
        await runRealTest('Create Real Test Claim', async () => {
          const claimData = {
            employeeId: user.uid,
            employeeName: user.email?.split('@')[0] || 'Test User',
            employeeEmail: user.email || 'test@example.com',
            type: testClaim.type as any,
            amount: testClaim.amount,
            description: `[TEST] ${testClaim.description} - ${new Date().toISOString()}`,
            date: new Date(),
            status: 'pending_l1' as any,
            approvalChain: { L1: 'manager1', L2: 'hr1' }
          };
          
          const result = await createClaim(claimData);
          return {
            success: result.success,
            error: result.error,
            data: result.data
          };
        });
      }

      // Test 8: Admin tests (if user is admin)
      if (user.position?.toLowerCase().includes('admin')) {
        await runRealTest('Get Real Admin Stats', async () => {
          const stats = await getAdminStats();
          return stats;
        });

        await runRealTest('Get All Users (Admin)', async () => {
          const users = await getAllUsersWithStats();
          return {
            count: users.length,
            users: users.slice(0, 5) // Show first 5
          };
        });

        await runRealTest('Get All Employees', async () => {
          const employees = await getAllEmployees();
          return {
            count: employees.length,
            employees: employees.slice(0, 5) // Show first 5
          };
        });

        await runRealTest('Get Position Rates', async () => {
          const rates = await getAllPositionRates();
          return rates;
        });
      }

      // Test 9: Test claim status update (if user has claims)
      const userClaims = await getClaims(user.uid);
      if (userClaims.length > 0) {
        const shouldUpdateClaim = window.confirm(
          "Do you want to test updating the status of your most recent claim? This will modify real data."
        );
        
        if (shouldUpdateClaim) {
          await runRealTest('Update Claim Status (Test)', async () => {
            const latestClaim = userClaims[0];
            const success = await updateClaimStatus(
              latestClaim.id,
              latestClaim.status, // Keep same status, just test the function
              user.uid,
              '[TEST] Status update test'
            );
            return {
              claimId: latestClaim.id,
              success,
              originalStatus: latestClaim.status
            };
          });
        }
      }

      toast({
        title: "Tests Completed",
        description: "All real data tests have been executed successfully",
      });

    } catch (error: any) {
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const clearTestData = async () => {
    const shouldClear = window.confirm(
      "Are you sure you want to clear test data? This might delete real test claims from Firebase."
    );
    
    if (!shouldClear) return;

    try {
      const claims = await getClaims(user?.uid || '');
      const testClaims = claims.filter(claim => 
        claim.description.includes('[TEST]') || 
        claim.description.toLowerCase().includes('test')
      );
      
      toast({
        title: "Found Test Claims",
        description: `Found ${testClaims.length} test claims. You can manually delete them from the admin panel.`,
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const passedTests = testResults.filter(t => t.status === 'success').length;
  const failedTests = testResults.filter(t => t.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Real Data Testing - Live Firebase Tests</h1>
        <p className="text-gray-600">Testing with actual Firebase data and real API calls</p>
        {user && (
          <div className="mt-2 text-sm text-blue-600">
            Logged in as: {user.email} ({user.position || 'Unknown Position'})
          </div>
        )}
      </div>

      {!user && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg text-gray-600 mb-4">
              Please login first to test with real data
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      )}

      {user && (
        <>
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Real Data Test Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="space-x-2">
                  <Button 
                    onClick={runAllRealTests} 
                    disabled={isRunning}
                    className="px-6 py-2"
                  >
                    {isRunning ? 'Running Real Tests...' : 'Run All Real Data Tests'}
                  </Button>
                  
                  <Button 
                    onClick={clearTestData} 
                    variant="outline"
                    disabled={isRunning}
                  >
                    Find Test Data
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Success Rate: <span className={`font-bold ${passedTests === totalTests && totalTests > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {totalTests > 0 ? `${passedTests}/${totalTests}` : '0/0'}
                    </span>
                  </div>
                </div>
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="text-sm text-blue-600">
                    Current Test: {currentTest}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/3" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Claim Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={testClaim.type} onValueChange={(value) => setTestClaim({...testClaim, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Claim Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="accommodation">Hotel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <span className="text-sm text-gray-500">{result.duration}ms</span>
                      )}
                      <Badge 
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                        className={result.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded mb-3">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      <strong>Real Data Response:</strong>
                      <pre className="mt-2 whitespace-pre-wrap overflow-x-auto text-xs">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {testResults.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No tests run yet. Click "Run All Real Data Tests" to start testing with live Firebase data.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default RealDataTestPage;
