import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const TestUsersSetup = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');

  // Test users to create
  const testUsers = [
    // Employees - Different Grades
    {
      email: 'emp.c1@nveltec.com',
      password: 'Test123!',
      employeeId: 'EMP001',
      name: 'Rajesh Kumar',
      grade: 'C Class',
      position: 'C Class Employee',
      department: 'Sales',
      phone: '+91-9876543210',
      reportingManager: 'MGR001',
      role: 'employee'
    },
    {
      email: 'emp.b1@nveltec.com',
      password: 'Test123!',
      employeeId: 'EMP002',
      name: 'Priya Sharma',
      grade: 'B Class',
      position: 'B Class Employee',
      department: 'Marketing',
      phone: '+91-9876543211',
      reportingManager: 'MGR002',
      role: 'employee'
    },
    {
      email: 'emp.l4@nveltec.com',
      password: 'Test123!',
      employeeId: 'EMP005',
      name: 'Arjun Patel',
      grade: 'L4',
      position: 'L4 Manager',
      department: 'Sales',
      phone: '+91-9876543214',
      reportingManager: 'MGR005',
      role: 'employee'
    },
    {
      email: 'emp.l2@nveltec.com',
      password: 'Test123!',
      employeeId: 'EMP007',
      name: 'Vikram Choudhary',
      grade: 'L2',
      position: 'L2 Assistant General Manager',
      department: 'Operations',
      phone: '+91-9876543216',
      reportingManager: 'MGR007',
      role: 'employee'
    },
    // Managers
    {
      email: 'mgr1@nveltec.com',
      password: 'Test123!',
      employeeId: 'MGR001',
      name: 'Rohit Agarwal',
      grade: 'L2',
      position: 'Sales Manager',
      department: 'Sales',
      phone: '+91-9876543220',
      reportingManager: 'HR001',
      role: 'manager'
    },
    {
      email: 'mgr2@nveltec.com',
      password: 'Test123!',
      employeeId: 'MGR002',
      name: 'Sunita Gupta',
      grade: 'L2',
      position: 'Marketing Manager',
      department: 'Marketing',
      phone: '+91-9876543221',
      reportingManager: 'HR001',
      role: 'manager'
    },
    // HR
    {
      email: 'hr1@nveltec.com',
      password: 'Test123!',
      employeeId: 'HR001',
      name: 'Anita Krishnan',
      grade: 'L1',
      position: 'HR Manager',
      department: 'Human Resources',
      phone: '+91-9876543230',
      reportingManager: 'ADMIN001',
      role: 'hr'
    },
    // Admin
    {
      email: 'admin.test@nveltec.com',
      password: 'Admin123!',
      employeeId: 'ADMIN002',
      name: 'Test Administrator',
      grade: 'Director',
      position: 'System Administrator',
      department: 'IT',
      phone: '+91-9876543240',
      reportingManager: null,
      role: 'admin'
    }
  ];

  const createTestUser = async (userData: any) => {
    setCurrentUser(`Creating ${userData.name} (${userData.email})`);
    
    try {
      let user;
      let userCredential;
      
      try {
        // Try to create Firebase Auth user
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        user = userCredential.user;
        console.log(`✅ Created Auth user: ${userData.email}`);
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ User ${userData.email} already exists in Auth, trying to sign in...`);
          
          // Try to sign in to get the user object
          try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const signInResult = await signInWithEmailAndPassword(auth, userData.email, userData.password);
            user = signInResult.user;
            await auth.signOut(); // Sign out immediately after getting user info
            console.log(`✅ Found existing Auth user: ${userData.email}`);
          } catch (signInError) {
            console.log(`⚠️ Could not sign in to existing user ${userData.email}, creating Firestore doc with dummy UID`);
            // Create a deterministic UID based on email for consistency
            user = { uid: `user_${userData.email.replace(/[^a-zA-Z0-9]/g, '_')}` };
          }
        } else {
          throw authError;
        }
      }

      // Create/Update employee document in Firestore
      const userDocData = {
        uid: user.uid,
        email: userData.email,
        employeeId: userData.employeeId,
        name: userData.name,
        grade: userData.grade,
        position: userData.position,
        department: userData.department,
        phone: userData.phone,
        reportingManager: userData.reportingManager,
        role: userData.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Travel policy info
        travelEntitlement: userData.grade,
        approvalLevel: userData.role === 'manager' ? 'L1' : 
                      userData.role === 'hr' ? 'L2' :
                      userData.role === 'finance' ? 'L3' : null,
        
        // Additional fields
        joinDate: new Date('2024-01-15'),
        employeeType: 'permanent',
        location: 'Chennai',
        costCenter: userData.department
      };

      // Create in both collections for compatibility
      await setDoc(doc(db, 'users', user.uid), userDocData);
      await setDoc(doc(db, 'employees', userData.employeeId), userDocData);
      
      console.log(`✅ Created/Updated Firestore docs for: ${userData.email}`);

      return { 
        success: true, 
        uid: user.uid, 
        email: userData.email,
        name: userData.name,
        role: userData.role 
      };
      
    } catch (error: any) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
      return { 
        success: false, 
        error: error.message, 
        email: userData.email,
        name: userData.name 
      };
    }
  };

  const createSampleClaims = async () => {
    const sampleClaims = [
      {
        employeeId: 'EMP001',
        employeeName: 'Rajesh Kumar',
        employeeEmail: 'emp.c1@nveltec.com',
        type: 'travel',
        amount: 1200,
        description: 'Travel to Chennai office for client meeting',
        date: new Date('2025-08-10'),
        status: 'pending_l1',
        approvalChain: { L1: 'MGR001', L2: 'HR001' },
        submittedAt: new Date(),
        updatedAt: new Date(),
        approvals: []
      },
      {
        employeeId: 'EMP002',
        employeeName: 'Priya Sharma',
        employeeEmail: 'emp.b1@nveltec.com',
        type: 'accommodation',
        amount: 2500,
        description: 'Hotel accommodation for 2 days in Mumbai',
        date: new Date('2025-08-12'),
        status: 'pending_l1',
        approvalChain: { L1: 'MGR002', L2: 'HR001' },
        submittedAt: new Date(),
        updatedAt: new Date(),
        approvals: []
      }
    ];

    let claimsCreated = 0;
    let claimsFailed = 0;

    for (const claimData of sampleClaims) {
      try {
        await addDoc(collection(db, 'claims'), claimData);
        claimsCreated++;
        console.log(`✅ Created sample claim for ${claimData.employeeName}`);
      } catch (error: any) {
        claimsFailed++;
        console.error(`❌ Error creating sample claim for ${claimData.employeeName}:`, error.message);
        
        // If it's a permission error, skip claims creation entirely
        if (error.code === 'permission-denied' || error.message.includes('permission')) {
          console.log('⚠️ Skipping claims creation due to permissions. Create claims manually after authentication.');
          break;
        }
      }
    }

    console.log(`📋 Claims creation summary: ${claimsCreated} created, ${claimsFailed} failed`);
  };

  const createAllTestUsers = async () => {
    setIsCreating(true);
    setResults([]);
    setCurrentUser('Starting test user creation...');
    
    const creationResults: any[] = [];

    try {
      for (const userData of testUsers) {
        const result = await createTestUser(userData);
        creationResults.push(result);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Create sample claims
      setCurrentUser('Creating sample claims...');
      await createSampleClaims();

      setResults(creationResults);
      
      const successCount = creationResults.filter(r => r.success).length;
      const failCount = creationResults.filter(r => !r.success).length;

      toast({
        title: "Test Users Created",
        description: `${successCount} users created successfully, ${failCount} failed`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setCurrentUser('');
    }
  };

  const successfulUsers = results.filter(r => r.success);
  const failedUsers = results.filter(r => !r.success);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Users Setup</h1>
        <p className="text-gray-600">Create test users in Firebase for testing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Test Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={createAllTestUsers} 
              disabled={isCreating}
              size="lg"
              className="w-full"
            >
              {isCreating ? 'Creating Test Users...' : 'Create All Test Users'}
            </Button>
            
            {isCreating && (
              <div className="text-center text-blue-600">
                {currentUser}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users to be created */}
      <Card>
        <CardHeader>
          <CardTitle>Test Users to Create</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testUsers.map((user, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <strong>{user.name}</strong>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>📧 {user.email}</div>
                  <div>🔑 {user.password}</div>
                  <div>🎯 {user.grade} - {user.position}</div>
                  <div>🏢 {user.department}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Creation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Success Summary */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {successfulUsers.length}
                  </div>
                  <div className="text-sm text-green-600">Created Successfully</div>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {failedUsers.length}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Successful Users */}
              {successfulUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">✅ Successfully Created:</h3>
                  <div className="space-y-2">
                    {successfulUsers.map((user, index) => (
                      <div key={index} className="bg-green-50 p-2 rounded text-sm">
                        <strong>{user.name}</strong> ({user.email}) - {user.role}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Users */}
              {failedUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">❌ Failed to Create:</h3>
                  <div className="space-y-2">
                    {failedUsers.map((user, index) => (
                      <div key={index} className="bg-red-50 p-2 rounded text-sm">
                        <strong>{user.name}</strong> ({user.email}): {user.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Instructions */}
      {successfulUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1. Go to login page:</strong> /login</p>
              <p><strong>2. Use any of the created accounts:</strong></p>
              <div className="bg-gray-50 p-3 rounded">
                <div><strong>Employee:</strong> emp.c1@nveltec.com / Test123!</div>
                <div><strong>Manager:</strong> mgr1@nveltec.com / Test123!</div>
                <div><strong>HR:</strong> hr1@nveltec.com / Test123!</div>
                <div><strong>Admin:</strong> admin.test@nveltec.com / Admin123!</div>
              </div>
              <p><strong>3. Test features:</strong> Create claims, approvals, dashboards</p>
              <p><strong>4. Use test pages:</strong> /test-real or /test-full</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestUsersSetup;
