import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  deleteUser,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Trash2, Shield, AlertTriangle } from 'lucide-react';

const UserCleanup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [confirmStep, setConfirmStep] = useState(0);

  // Admin user to preserve
  const ADMIN_EMAIL = 'admin.test@nveltec.com';

  const cleanupFirestoreCollection = async (collectionName: string, preserveField: string = 'email') => {
    const results = { deleted: 0, preserved: 0, errors: [] };
    
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        if (data[preserveField] && data[preserveField].toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          console.log(`✅ Preserving admin in ${collectionName}: ${data[preserveField]}`);
          results.preserved++;
        } else {
          try {
            await deleteDoc(doc(db, collectionName, docSnap.id));
            console.log(`🗑️ Deleted from ${collectionName}: ${data[preserveField] || docSnap.id}`);
            results.deleted++;
          } catch (error: any) {
            console.error(`❌ Error deleting from ${collectionName}:`, error);
            results.errors.push(`${data[preserveField] || docSnap.id}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ Error accessing ${collectionName}:`, error);
      results.errors.push(`Collection access error: ${error.message}`);
    }
    
    return results;
  };

  const cleanupAuthUsers = async () => {
    const results = { deleted: 0, skipped: 0, errors: [] };
    
    // Known test users to clean up
    const testUsers = [
      { email: 'test@test.com', password: 'password123' },
      { email: 'test@test.com', password: 'password' },
      { email: 'emp1@nveltec.com', password: 'Test123!' },
      { email: 'emp2@nveltec.com', password: 'Test123!' },
      { email: 'mgr1@nveltec.com', password: 'Test123!' },
      { email: 'mgr2@nveltec.com', password: 'Test123!' },
      { email: 'hr1@nveltec.com', password: 'Test123!' },
      { email: 'finance1@nveltec.com', password: 'Test123!' },
      { email: 'emp.c1@nveltec.com', password: 'Test123!' },
      { email: 'emp.b1@nveltec.com', password: 'Test123!' },
      { email: 'emp.a1@nveltec.com', password: 'Test123!' }
    ];
    
    for (const testUser of testUsers) {
      if (testUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log(`✅ Skipping admin user: ${testUser.email}`);
        results.skipped++;
        continue;
      }
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
        await deleteUser(userCredential.user);
        console.log(`🗑️ Deleted Auth user: ${testUser.email}`);
        results.deleted++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          console.log(`ℹ️ User not found: ${testUser.email}`);
        } else {
          console.error(`❌ Error deleting ${testUser.email}:`, error);
          results.errors.push(`${testUser.email}: ${error.message}`);
        }
      }
    }
    
    // Sign out after cleanup
    try {
      await signOut(auth);
    } catch (error) {
      console.log('ℹ️ No user was signed in');
    }
    
    return results;
  };

  const performCleanup = async () => {
    setIsLoading(true);
    setError('');
    setResults(null);
    
    try {
      console.log('🚀 Starting comprehensive user cleanup...');
      
      const cleanupResults = {
        users: await cleanupFirestoreCollection('users', 'email'),
        employees: await cleanupFirestoreCollection('employees', 'email'),
        claims: await cleanupFirestoreCollection('claims', 'employeeEmail'),
        auth: await cleanupAuthUsers()
      };
      
      setResults(cleanupResults);
      console.log('✅ Cleanup completed!', cleanupResults);
      
    } catch (error: any) {
      console.error('❌ Cleanup failed:', error);
      setError(`Cleanup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setConfirmStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5" />
            Firebase User Cleanup
          </CardTitle>
          <CardDescription>
            Remove all users from Firebase Auth and Firestore except the admin user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Admin Info */}
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>Admin user to preserve:</strong> {ADMIN_EMAIL}
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>WARNING:</strong> This action will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All Firebase Authentication users (except admin)</li>
                <li>All documents in 'users' collection (except admin)</li>
                <li>All documents in 'employees' collection (except admin)</li>
                <li>All documents in 'claims' collection (except admin claims)</li>
              </ul>
              <strong>This action cannot be undone!</strong>
            </AlertDescription>
          </Alert>

          {/* Confirmation Steps */}
          {confirmStep === 0 && (
            <Button
              onClick={() => setConfirmStep(1)}
              variant="destructive"
              className="w-full"
            >
              Start Cleanup Process
            </Button>
          )}

          {confirmStep === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete all users except the admin?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setConfirmStep(2)}
                  variant="destructive"
                  size="sm"
                >
                  Yes, Continue
                </Button>
                <Button
                  onClick={() => setConfirmStep(0)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {confirmStep === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-red-600 font-medium">
                FINAL CONFIRMATION: This will permanently delete all user data except {ADMIN_EMAIL}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={performCleanup}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cleaning...' : 'DELETE ALL USERS'}
                </Button>
                <Button
                  onClick={() => setConfirmStep(0)}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-3">
              <h3 className="font-medium text-green-700">Cleanup Results:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Users Collection:</strong></p>
                  <p>Deleted: {results.users.deleted}</p>
                  <p>Preserved: {results.users.preserved}</p>
                  
                  <p><strong>Employees Collection:</strong></p>
                  <p>Deleted: {results.employees.deleted}</p>
                  <p>Preserved: {results.employees.preserved}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Claims Collection:</strong></p>
                  <p>Deleted: {results.claims.deleted}</p>
                  <p>Preserved: {results.claims.preserved}</p>
                  
                  <p><strong>Firebase Auth:</strong></p>
                  <p>Deleted: {results.auth.deleted}</p>
                  <p>Skipped: {results.auth.skipped}</p>
                </div>
              </div>
              
              {/* Show errors if any */}
              {(results.users.errors.length > 0 || 
                results.employees.errors.length > 0 || 
                results.claims.errors.length > 0 || 
                results.auth.errors.length > 0) && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-700">Errors:</h4>
                  <div className="text-xs space-y-1 mt-2">
                    {[...results.users.errors, ...results.employees.errors, ...results.claims.errors, ...results.auth.errors].map((error, index) => (
                      <p key={index} className="text-red-600">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCleanup;
