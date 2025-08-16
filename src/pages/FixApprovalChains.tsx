import React, { useState } from 'react';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const FixApprovalChains: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const fixApprovalChains = async () => {
    setIsRunning(true);
    setStatus('🔧 Fixing approval chains for test users...\n');
    
    try {
      // Define the correct approval chain structure
      const approvalChainFixes = [
        // Employees should have MGR001/MGR002 as L1, HR001 as L2, ADMIN001 as L3
        {
          employeeId: 'EMP001',
          approvalChain: { L1: 'MGR001', L2: 'HR001', L3: 'ADMIN001' }
        },
        {
          employeeId: 'EMP002', 
          approvalChain: { L1: 'MGR001', L2: 'HR001', L3: 'ADMIN001' }
        },
        {
          employeeId: 'EMP003',
          approvalChain: { L1: 'MGR002', L2: 'HR001', L3: 'ADMIN001' }
        },
        {
          employeeId: 'EMP004',
          approvalChain: { L1: 'MGR002', L2: 'HR001', L3: 'ADMIN001' }
        },
        // Managers should have HR001 as L1, ADMIN001 as L2
        {
          employeeId: 'MGR001',
          approvalChain: { L1: 'HR001', L2: 'ADMIN001', L3: 'ADMIN001' }
        },
        {
          employeeId: 'MGR002',
          approvalChain: { L1: 'HR001', L2: 'ADMIN001', L3: 'ADMIN001' }
        },
        // HR should have ADMIN001 as L1
        {
          employeeId: 'HR001',
          approvalChain: { L1: 'ADMIN001', L2: 'ADMIN001', L3: 'ADMIN001' }
        }
      ];

      for (const fix of approvalChainFixes) {
        setStatus(prev => prev + `\n🔄 Processing ${fix.employeeId}...`);
        
        // Update in employees collection
        try {
          const employeeRef = doc(db, 'employees', fix.employeeId);
          const employeeDoc = await getDoc(employeeRef);
          
          if (employeeDoc.exists()) {
            await updateDoc(employeeRef, {
              approvalChain: fix.approvalChain,
              updatedAt: new Date()
            });
            setStatus(prev => prev + `\n✅ Updated ${fix.employeeId} in employees collection`);
          } else {
            setStatus(prev => prev + `\n⚠️ Employee ${fix.employeeId} not found in employees collection`);
          }
        } catch (error: any) {
          setStatus(prev => prev + `\n❌ Could not update ${fix.employeeId} in employees collection: ${error.message}`);
        }

        // Also update in users collection (find by employeeId)
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const userDoc = usersSnapshot.docs.find(doc => 
            doc.data().employeeId === fix.employeeId
          );
          
          if (userDoc) {
            await updateDoc(doc(db, 'users', userDoc.id), {
              approvalChain: fix.approvalChain,
              updatedAt: new Date()
            });
            setStatus(prev => prev + `\n✅ Updated ${fix.employeeId} in users collection`);
          } else {
            setStatus(prev => prev + `\n⚠️ User with employeeId ${fix.employeeId} not found in users collection`);
          }
        } catch (error: any) {
          setStatus(prev => prev + `\n❌ Could not update ${fix.employeeId} in users collection: ${error.message}`);
        }
      }

      setStatus(prev => prev + `
      
🎉 Approval chain fixes completed!

📋 Expected Flow:
Employee (EMP001-004) → L1 Manager (MGR001/002) → L2 HR (HR001) → L3 Admin (ADMIN001)

🧪 Test this flow:
1. Login as emp.c1@nveltec.com / Test123!
2. Create a claim
3. Login as mgr1@nveltec.com / Test123!
4. Check pending approvals - claim should appear`);
      
    } catch (error: any) {
      setStatus(prev => prev + `\n❌ Error fixing approval chains: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🔧 Fix Approval Chains
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This tool will fix the approval chains for all test users to ensure proper L1→L2→L3 workflow.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">What this will do:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Set proper L1, L2, L3 approval chains for all employees</li>
              <li>• EMP001-002 → MGR001 → HR001 → ADMIN001</li>
              <li>• EMP003-004 → MGR002 → HR001 → ADMIN001</li>
              <li>• MGR001-002 → HR001 → ADMIN001</li>
              <li>• HR001 → ADMIN001</li>
            </ul>
          </div>
        </div>

        <button
          onClick={fixApprovalChains}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          {isRunning ? '🔄 Fixing Approval Chains...' : '🔧 Fix Approval Chains'}
        </button>

        {status && (
          <div className="mt-6 bg-gray-50 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Status:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {status}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixApprovalChains;
