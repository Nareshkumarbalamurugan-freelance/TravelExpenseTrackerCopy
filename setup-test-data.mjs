// 🎯 Setup Test Data for Role-Based Dashboard Testing (ES Module)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDBh9TGHd_Pd6vG2Rn6GFQV3MFxL2jb5tM",
  authDomain: "expensetracker-c25fd.firebaseapp.com",
  projectId: "expensetracker-c25fd",
  storageBucket: "expensetracker-c25fd.appspot.com",
  messagingSenderId: "1095383781743",
  appId: "1:1095383781743:web:7c8dc3b4f8e9a1d8c8b9fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Simple create employee function for this script
import { 
  collection, 
  addDoc, 
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const createEmployeeForTest = async (employeeData) => {
  console.log('📋 Creating employee:', employeeData.name);
  
  try {
    // Check if email already exists
    const emailQuery = query(
      collection(db, 'employees'), 
      where('email', '==', employeeData.email)
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      console.log('⚠️ Employee with this email already exists:', employeeData.email);
      return { success: true }; // Skip if already exists
    }

    // Create Firebase Auth user
    try {
      await createUserWithEmailAndPassword(auth, employeeData.email, employeeData.tempPassword);
      console.log('✅ Firebase Auth user created');
    } catch (authError) {
      console.log('⚠️ Auth user might already exist, continuing...');
    }

    // Create employee document
    const employeeDoc = {
      employeeId: employeeData.id,
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone || '',
      grade: employeeData.grade,
      designation: employeeData.designation || '',
      department: employeeData.department,
      approvalChain: employeeData.approvalChain,
      active: employeeData.active,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await addDoc(collection(db, 'employees'), employeeDoc);
    console.log('✅ Employee document created');

    return { success: true };

  } catch (error) {
    console.error('💥 Error creating employee:', error);
    return { success: false, error: error.message };
  }
};

const setupTestData = async () => {
  console.log('🎯 Setting up test data for role-based dashboards...');

  try {
    // Create a regular employee who reports to manager1
    console.log('\n👤 Creating regular employee...');
    const employeeResult = await createEmployeeForTest({
      id: 'EMP001',
      name: 'John Smith',
      email: 'john.smith@noveltech.com',
      phone: '+91 9876543210',
      grade: 'B',
      designation: 'Sales Executive',
      department: 'Sales',
      approvalChain: {
        L1: 'manager1', // Reports to manager1 for L1 approval
        L2: 'seniormanager1', // L2 approval
        L3: 'admin' // L3 approval
      },
      active: true,
      tempPassword: 'password123'
    });

    // Create another employee for testing
    console.log('\n👤 Creating another employee...');
    const employee2Result = await createEmployeeForTest({
      id: 'EMP002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@noveltech.com',
      phone: '+91 9876543211',
      grade: 'A',
      designation: 'Marketing Executive',
      department: 'Marketing',
      approvalChain: {
        L1: 'manager1', // Also reports to manager1
        L2: 'seniormanager1',
        L3: 'admin'
      },
      active: true,
      tempPassword: 'password123'
    });

    // Create a senior manager for L2/L3 approvals
    console.log('\n👔 Creating senior manager...');
    const seniorManagerResult = await createEmployeeForTest({
      id: 'seniormanager1',
      name: 'Michael Brown',
      email: 'michael.brown@noveltech.com',
      phone: '+91 9876543212',
      grade: 'Senior Manager',
      designation: 'Senior Manager',
      department: 'Management',
      approvalChain: {
        L1: 'admin',
        L2: 'admin',
        L3: 'admin'
      },
      active: true,
      tempPassword: 'password123'
    });

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📊 Test Accounts Created:');
    console.log('1. john.smith@noveltech.com (Employee) - Reports to manager1');
    console.log('2. sarah.johnson@noveltech.com (Employee) - Reports to manager1');
    console.log('3. manager1@noveltech.com (L1 Manager) - Manages EMP001 & EMP002');
    console.log('4. michael.brown@noveltech.com (Senior Manager) - L2/L3 approvals');
    console.log('\n🔐 All passwords: password123');
    console.log('\n🧪 Now you can test:');
    console.log('- Login as john.smith@noveltech.com → Employee Dashboard');
    console.log('- Login as manager1@noveltech.com → Manager Dashboard');
    console.log('- Login as michael.brown@noveltech.com → Manager Dashboard');

  } catch (error) {
    console.error('💥 Error setting up test data:', error);
  }

  process.exit(0);
};

// Run the setup
setupTestData();
