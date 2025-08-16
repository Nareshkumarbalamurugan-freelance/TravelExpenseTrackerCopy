// Fix Approval Chains for Test Users
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2fuJSP_-dcaHpGwLRZI7-0T1rHHXEwuM",
  authDomain: "expensetracker-c25fd.firebaseapp.com", 
  projectId: "expensetracker-c25fd",
  storageBucket: "expensetracker-c25fd.firebasestorage.app",
  messagingSenderId: "667518600623",
  appId: "1:667518600623:web:5e7e5acfaed06c50a7e5d9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixApprovalChains() {
  console.log('🔧 Fixing approval chains for test users...');
  
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
      // Update in employees collection
      try {
        const employeeRef = doc(db, 'employees', fix.employeeId);
        await updateDoc(employeeRef, {
          approvalChain: fix.approvalChain,
          updatedAt: new Date()
        });
        console.log(`✅ Updated approval chain for ${fix.employeeId} in employees collection`);
      } catch (error) {
        console.log(`⚠️ Could not update ${fix.employeeId} in employees collection:`, error.message);
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
          console.log(`✅ Updated approval chain for ${fix.employeeId} in users collection`);
        }
      } catch (error) {
        console.log(`⚠️ Could not update ${fix.employeeId} in users collection:`, error.message);
      }
    }

    console.log('\n🎉 Approval chain fixes completed!');
    console.log('\n📋 Expected Flow:');
    console.log('Employee (EMP001-004) → L1 Manager (MGR001/002) → L2 HR (HR001) → L3 Admin (ADMIN001)');
    console.log('\n🧪 Test this flow:');
    console.log('1. Login as emp.c1@nveltec.com / Test123!');
    console.log('2. Create a claim');
    console.log('3. Login as mgr1@nveltec.com / Test123!');
    console.log('4. Check pending approvals - claim should appear');
    
  } catch (error) {
    console.error('❌ Error fixing approval chains:', error);
  }
}

// Run the fix
fixApprovalChains().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
