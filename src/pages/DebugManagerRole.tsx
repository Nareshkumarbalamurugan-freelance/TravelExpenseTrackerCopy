import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../lib/roleService';
import { getEmployeeByIdOrEmail } from '../lib/unifiedEmployeeService';
import { getPendingClaimsForManager } from '../lib/claimsService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DebugManagerRole: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
    
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/mobile-login');
      return;
    }
    
    debugManagerRole();
  }, [user, authLoading, navigate]);

  const debugManagerRole = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    const debugInfo: any = {
      user: {
        email: user.email,
        uid: user.uid
      }
    };

    try {
      // 1. Get current employee
      console.log('🔍 Debug: Finding current employee for:', user.email);
      const currentEmployee = await getEmployeeByIdOrEmail(user.email);
      debugInfo.currentEmployee = currentEmployee;
      
      if (currentEmployee) {
        // 2. Get all employees to check approval chains
        const allEmployeesSnapshot = await getDocs(collection(db, 'employees'));
        const allEmployees = allEmployeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        debugInfo.allEmployees = allEmployees;
        
        // 3. Check which employees have this manager in their approval chain
        const managedEmployees = [];
        let detectedLevel = null;
        
        allEmployees.forEach((emp: any) => {
          const approvalChain = emp.approvalChain || {};
          if (approvalChain.L1 === currentEmployee.employeeId) {
            managedEmployees.push({ employee: emp.name || emp.id, level: 'L1' });
            detectedLevel = 'L1';
          }
          if (approvalChain.L2 === currentEmployee.employeeId) {
            managedEmployees.push({ employee: emp.name || emp.id, level: 'L2' });
            if (!detectedLevel) detectedLevel = 'L2';
          }
          if (approvalChain.L3 === currentEmployee.employeeId) {
            managedEmployees.push({ employee: emp.name || emp.id, level: 'L3' });
            if (!detectedLevel) detectedLevel = 'L3';
          }
        });
        
        debugInfo.managedEmployees = managedEmployees;
        debugInfo.detectedLevel = detectedLevel;
        
        // 4. Get role from role service
        const userRole = await getUserRole(user.email);
        debugInfo.roleServiceResult = userRole;
        
        // 5. Test pending claims query
        if (userRole?.type === 'manager' && userRole.level) {
          console.log('🔍 Debug: Testing pending claims for manager:', currentEmployee.employeeId, 'at level:', userRole.level);
          const pendingClaims = await getPendingClaimsForManager(currentEmployee.employeeId, userRole.level);
          debugInfo.pendingClaims = pendingClaims;
        }
        
        // 6. Test with each level
        const testLevels = ['L1', 'L2', 'L3'] as const;
        debugInfo.testQueries = {};
        
        for (const level of testLevels) {
          try {
            const claims = await getPendingClaimsForManager(currentEmployee.employeeId, level);
            debugInfo.testQueries[level] = {
              count: claims.length,
              claims: claims.map(c => ({
                id: c.id,
                employeeId: c.employeeId,
                status: c.status,
                approvalChain: c.approvalChain
              }))
            };
          } catch (error: any) {
            debugInfo.testQueries[level] = { error: error.message };
          }
        }
      }
      
    } catch (error: any) {
      debugInfo.error = error.message;
      console.error('💥 Debug error:', error);
    } finally {
      setDebug(debugInfo);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please log in to access manager debug information</p>
          <button 
            onClick={() => navigate('/mobile-login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manager debug info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">👔 Manager Role Debug Information</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-2">User Information</h2>
          <pre className="text-sm text-blue-700">
            {JSON.stringify(debug.user, null, 2)}
          </pre>
        </div>

        {/* Current Employee */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold text-green-800 mb-2">Current Employee</h2>
          <pre className="text-sm text-green-700">
            {JSON.stringify(debug.currentEmployee, null, 2)}
          </pre>
        </div>

        {/* Managed Employees */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h2 className="font-semibold text-purple-800 mb-2">
            Managed Employees ({debug.managedEmployees?.length || 0})
          </h2>
          <pre className="text-sm text-purple-700">
            {JSON.stringify(debug.managedEmployees, null, 2)}
          </pre>
        </div>

        {/* Detected Manager Level */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">Detected Manager Level</h2>
          <p className="text-sm text-yellow-700">
            {debug.detectedLevel ? `Manager at level: ${debug.detectedLevel}` : 'Not detected as manager'}
          </p>
        </div>

        {/* Role Service Result */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h2 className="font-semibold text-indigo-800 mb-2">Role Service Result</h2>
          <pre className="text-sm text-indigo-700">
            {JSON.stringify(debug.roleServiceResult, null, 2)}
          </pre>
        </div>

        {/* Pending Claims */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold text-orange-800 mb-2">
            Pending Claims ({debug.pendingClaims?.length || 0})
          </h2>
          <pre className="text-sm text-orange-700">
            {JSON.stringify(debug.pendingClaims, null, 2)}
          </pre>
        </div>

        {/* Test Queries */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="font-semibold text-red-800 mb-2">Test Queries for Each Level</h2>
          <pre className="text-sm text-red-700 max-h-60 overflow-y-auto">
            {JSON.stringify(debug.testQueries, null, 2)}
          </pre>
        </div>

        {/* Error */}
        {debug.error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <h2 className="font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{debug.error}</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-100 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🔧 Debug Steps:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Check if manager employee record exists</li>
          <li>2. Check which employees have this manager in approval chains</li>
          <li>3. Check if role service detects manager correctly</li>
          <li>4. Test pending claims query for detected level</li>
          <li>5. Test queries for all levels (L1, L2, L3)</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugManagerRole;
