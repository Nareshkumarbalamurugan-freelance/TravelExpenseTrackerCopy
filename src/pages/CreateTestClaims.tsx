import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createClaim } from '@/lib/claimsService';

const CreateTestClaims = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [createdClaims, setCreatedClaims] = useState<any[]>([]);

  const testClaims = [
    {
      type: 'travel',
      amount: 1500,
      description: 'Travel to Chennai office for quarterly review meeting',
      category: 'Business Travel'
    },
    {
      type: 'accommodation',
      amount: 3200,
      description: 'Hotel stay for 2 nights during client visit in Mumbai',
      category: 'Accommodation'
    },
    {
      type: 'food',
      amount: 850,
      description: 'Food expenses during business trip - 3 days',
      category: 'Food & Meals'
    },
    {
      type: 'fuel',
      amount: 1200,
      description: 'Fuel expenses for client visits - 200 km travelled',
      category: 'Fuel Allowance'
    },
    {
      type: 'other',
      amount: 2500,
      description: 'Conference registration and training materials',
      category: 'Training & Development'
    }
  ];

  const createTestClaimsForUser = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login first to create test claims",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    const results: any[] = [];

    try {
      for (const claimData of testClaims) {
        const fullClaimData = {
          employeeId: user.uid,
          employeeName: user.email?.split('@')[0] || 'Test User',
          employeeEmail: user.email || '',
          type: claimData.type as any,
          amount: claimData.amount,
          description: `[TEST] ${claimData.description} - ${new Date().toLocaleString()}`,
          date: new Date(),
          status: 'pending_l1' as any,
          approvalChain: {
            L1: 'manager_test',
            L2: 'hr_test'
          }
        };

        const result = await createClaim(fullClaimData);
        results.push({
          ...claimData,
          success: result.success,
          error: result.error,
          data: result.data
        });

        // Small delay between claims
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCreatedClaims(results);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      toast({
        title: "Test Claims Created",
        description: `${successCount} claims created successfully, ${failCount} failed`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const successfulClaims = createdClaims.filter(c => c.success);
  const failedClaims = createdClaims.filter(c => !c.success);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Test Claims</h1>
        <p className="text-gray-600">Generate sample claims for testing approval workflow</p>
        {user && (
          <div className="mt-2 text-sm text-blue-600">
            Creating claims for: {user.email} ({user.position || 'Unknown'})
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Test Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={createTestClaimsForUser} 
              disabled={isCreating || !user}
              size="lg"
              className="w-full"
            >
              {isCreating ? 'Creating Test Claims...' : 'Create 5 Test Claims'}
            </Button>
            
            {!user && (
              <div className="text-center text-gray-600">
                Please login first to create test claims
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claims to be created */}
      <Card>
        <CardHeader>
          <CardTitle>Test Claims Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testClaims.map((claim, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <strong className="capitalize">{claim.type} Claim</strong>
                  <span className="text-lg font-bold text-green-600">₹{claim.amount}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>{claim.description}</div>
                  <div className="text-xs mt-1 text-blue-600">{claim.category}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {createdClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Creation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {successfulClaims.length}
                  </div>
                  <div className="text-sm text-green-600">Claims Created</div>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {failedClaims.length}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                {createdClaims.map((claim, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded border ${claim.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{claim.type} - ₹{claim.amount}</span>
                      <span className={`text-sm ${claim.success ? 'text-green-600' : 'text-red-600'}`}>
                        {claim.success ? '✅ Created' : '❌ Failed'}
                      </span>
                    </div>
                    {claim.error && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {claim.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {successfulClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>✅ Test Claims Created Successfully!</strong></p>
              <p><strong>Now you can:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Go to Employee Dashboard to see your claims</li>
                <li>Go to Claims page to view claim details</li>
                <li>Login as manager to approve/reject claims</li>
                <li>Test the approval workflow</li>
                <li>Use /test-real to run full data tests</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateTestClaims;
