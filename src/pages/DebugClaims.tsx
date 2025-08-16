import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployeeByIdOrEmail } from '../lib/unifiedEmployeeService';
import { getClaimsForEmployee } from '../lib/claimsService';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DebugClaims: React.FC = () => {
  const { user } = useAuth();
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugClaimsIssue();
  }, [user]);

  const debugClaimsIssue = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    const debugInfo: any = {
      user: {
        email: user.email,
        uid: user.uid
      }
    };

    try {
      // 1. Check employee data
      console.log('🔍 Debug: Finding employee for:', user.email);
      const employee = await getEmployeeByIdOrEmail(user.email);
      debugInfo.employee = employee;
      
      if (employee) {
        // 2. Check approval chain
        debugInfo.approvalChain = employee.approvalChain;
        
        // 3. Check claims by employeeId
        console.log('🔍 Debug: Getting claims for employeeId:', employee.employeeId);
        const claimsFromService = await getClaimsForEmployee(employee.employeeId);
        debugInfo.claimsFromService = claimsFromService;
        
        // 4. Direct Firestore query
        const claimsQuery = query(
          collection(db, 'claims'),
          where('employeeId', '==', employee.employeeId)
        );
        const claimsSnapshot = await getDocs(claimsQuery);
        debugInfo.directClaimsQuery = {
          count: claimsSnapshot.size,
          claims: claimsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        };
        
        // 5. Check all claims in collection
        const allClaimsQuery = query(collection(db, 'claims'));
        const allClaimsSnapshot = await getDocs(allClaimsQuery);
        debugInfo.allClaims = {
          count: allClaimsSnapshot.size,
          claims: allClaimsSnapshot.docs.map(doc => ({
            id: doc.id,
            employeeId: doc.data().employeeId,
            employeeEmail: doc.data().employeeEmail,
            type: doc.data().type,
            status: doc.data().status,
            submittedAt: doc.data().submittedAt?.toDate?.()
          }))
        };
        
        // 6. Check if approval chain is working
        if (employee.approvalChain?.L1) {
          const l1Manager = await getEmployeeByIdOrEmail(employee.approvalChain.L1);
          debugInfo.l1Manager = l1Manager;
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

  if (loading) {
    return <div className="p-6">Loading debug info...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Claims Debug Information</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-2">User Information</h2>
          <pre className="text-sm text-blue-700">
            {JSON.stringify(debug.user, null, 2)}
          </pre>
        </div>

        {/* Employee Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold text-green-800 mb-2">Employee Information</h2>
          <pre className="text-sm text-green-700">
            {JSON.stringify(debug.employee, null, 2)}
          </pre>
        </div>

        {/* Approval Chain */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h2 className="font-semibold text-purple-800 mb-2">Approval Chain</h2>
          <pre className="text-sm text-purple-700">
            {JSON.stringify(debug.approvalChain, null, 2)}
          </pre>
        </div>

        {/* L1 Manager Info */}
        {debug.l1Manager && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="font-semibold text-yellow-800 mb-2">L1 Manager Information</h2>
            <pre className="text-sm text-yellow-700">
              {JSON.stringify(debug.l1Manager, null, 2)}
            </pre>
          </div>
        )}

        {/* Claims from Service */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold text-orange-800 mb-2">
            Claims from Service ({debug.claimsFromService?.length || 0})
          </h2>
          <pre className="text-sm text-orange-700">
            {JSON.stringify(debug.claimsFromService, null, 2)}
          </pre>
        </div>

        {/* Direct Claims Query */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="font-semibold text-red-800 mb-2">
            Direct Firestore Query ({debug.directClaimsQuery?.count || 0})
          </h2>
          <pre className="text-sm text-red-700">
            {JSON.stringify(debug.directClaimsQuery, null, 2)}
          </pre>
        </div>

        {/* All Claims */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-2">
            All Claims in Database ({debug.allClaims?.count || 0})
          </h2>
          <pre className="text-sm text-gray-700 max-h-60 overflow-y-auto">
            {JSON.stringify(debug.allClaims, null, 2)}
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
          <li>1. Check if employee record exists and has correct employeeId</li>
          <li>2. Check if approval chain is properly set (L1, L2, L3)</li>
          <li>3. Check if claims are being saved with correct employeeId</li>
          <li>4. Check if claims query is working correctly</li>
          <li>5. Check if manager records exist for approval chain</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugClaims;
