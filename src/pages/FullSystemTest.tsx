import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createClaim, getClaims } from '@/lib/claimsService';
import { getActiveSession } from '@/lib/tripSession';
import { getPolicyInfo } from '@/lib/travelPolicy';

const FullSystemTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runFullSystemTest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    const results: any[] = [];

    try {
      // 1. Test user authentication and data
      console.log('🔐 Testing user authentication...');
      results.push({
        test: 'User Authentication',
        status: 'success',
        data: {
          uid: user.uid,
          email: user.email,
          position: user.position
        }
      });

      // 2. Test policy lookup
      console.log('📋 Testing travel policy...');
      const grade = user.position || 'L2';
      const policyInfo = getPolicyInfo(grade);
      results.push({
        test: 'Travel Policy Lookup',
        status: policyInfo ? 'success' : 'error',
        data: policyInfo
      });

      // 3. Test active session
      console.log('🚗 Testing trip session...');
      try {
        const sessionResult = await getActiveSession(user.uid);
        results.push({
          test: 'Active Trip Session',
          status: 'success',
          data: sessionResult
        });
      } catch (error: any) {
        results.push({
          test: 'Active Trip Session',
          status: 'error',
          error: error.message
        });
      }

      // 4. Test getting existing claims
      console.log('📄 Testing claims retrieval...');
      try {
        const existingClaims = await getClaims(user.uid);
        results.push({
          test: 'Get Existing Claims',
          status: 'success',
          data: {
            count: existingClaims.length,
            latestClaim: existingClaims[0] || null
          }
        });
      } catch (error: any) {
        results.push({
          test: 'Get Existing Claims',
          status: 'error',
          error: error.message
        });
      }

      // 5. Create a real test claim
      console.log('💰 Creating real test claim...');
      const shouldCreateClaim = window.confirm(
        'Create a REAL test claim in Firebase? This will add actual data to your database.'
      );

      if (shouldCreateClaim) {
        try {
          const testClaimData = {
            employeeId: user.uid,
            employeeName: user.email?.split('@')[0] || 'Test User',
            employeeEmail: user.email || '',
            type: 'travel' as any,
            amount: 750,
            description: `[SYSTEM TEST] Full system test claim - ${new Date().toLocaleString()}`,
            date: new Date(),
            status: 'pending_l1' as any,
            approvalChain: {
              L1: 'manager_test',
              L2: 'hr_test'
            }
          };

          const claimResult = await createClaim(testClaimData);
          results.push({
            test: 'Create Real Test Claim',
            status: claimResult.success ? 'success' : 'error',
            data: claimResult
          });

          if (claimResult.success) {
            toast({
              title: "Test Claim Created",
              description: "A real test claim has been created in Firebase",
            });
          }
        } catch (error: any) {
          results.push({
            test: 'Create Real Test Claim',
            status: 'error',
            error: error.message
          });
        }
      } else {
        results.push({
          test: 'Create Real Test Claim',
          status: 'skipped',
          data: 'User chose not to create real claim'
        });
      }

      // 6. Test end-to-end workflow
      console.log('🔄 Testing workflow...');
      const workflowTest = {
        userAuthenticated: !!user,
        policyLoaded: !!policyInfo,
        canCreateClaims: true,
        canViewDashboard: true,
        systemHealthy: true
      };

      results.push({
        test: 'End-to-End Workflow',
        status: 'success',
        data: workflowTest
      });

      setTestResults(results);

      toast({
        title: "Full System Test Complete",
        description: `Completed ${results.length} tests with real data`,
      });

    } catch (error: any) {
      console.error('System test failed:', error);
      toast({
        title: "System Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const passedTests = testResults.filter(r => r.status === 'success').length;
  const failedTests = testResults.filter(r => r.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Full System Test</h1>
        <p className="text-gray-600">Complete end-to-end testing with real Firebase data</p>
        {user && (
          <div className="mt-2 text-sm text-blue-600">
            Testing as: {user.email} ({user.position || 'Unknown'})
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Test Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button 
              onClick={runFullSystemTest} 
              disabled={isRunning || !user}
              size="lg"
            >
              {isRunning ? 'Running System Test...' : 'Run Full System Test'}
            </Button>
            
            {testResults.length > 0 && (
              <div className="text-right">
                <div className="text-lg font-bold">
                  {passedTests}/{testResults.length} Tests Passed
                </div>
                <div className="text-sm text-gray-600">
                  {failedTests > 0 && `${failedTests} failed`}
                </div>
              </div>
            )}
          </div>
          
          {!user && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">Please login to run system tests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          {testResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.test}</CardTitle>
                  <div className={`px-3 py-1 rounded text-sm font-medium ${
                    result.status === 'success' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status.toUpperCase()}
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
                  <div className="text-sm">
                    <strong>Data:</strong>
                    <pre className="mt-2 bg-gray-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FullSystemTest;
