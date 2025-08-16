import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

// Import your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
    email: 'emp.a1@nveltec.com',
    password: 'Test123!',
    employeeId: 'EMP003',
    name: 'Suresh Nair',
    grade: 'A Class',
    position: 'A Class Employee',
    department: 'Operations',
    phone: '+91-9876543212',
    reportingManager: 'MGR003',
    role: 'employee'
  },
  {
    email: 'emp.l5@nveltec.com',
    password: 'Test123!',
    employeeId: 'EMP004',
    name: 'Kavitha Reddy',
    grade: 'L5',
    position: 'L5 Executive',
    department: 'Finance',
    phone: '+91-9876543213',
    reportingManager: 'MGR004',
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
    email: 'emp.l3@nveltec.com',
    password: 'Test123!',
    employeeId: 'EMP006',
    name: 'Deepika Singh',
    grade: 'L3',
    position: 'L3 Senior Manager',
    department: 'HR',
    phone: '+91-9876543215',
    reportingManager: 'MGR006',
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
  {
    email: 'emp.l1@nveltec.com',
    password: 'Test123!',
    employeeId: 'EMP008',
    name: 'Meera Joshi',
    grade: 'L1',
    position: 'L1 General Manager',
    department: 'Business Development',
    phone: '+91-9876543217',
    reportingManager: 'MGR008',
    role: 'employee'
  },

  // Managers - L1 Approvers
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
  {
    email: 'mgr3@nveltec.com',
    password: 'Test123!',
    employeeId: 'MGR003',
    name: 'Ramesh Iyer',
    grade: 'L1',
    position: 'Operations Manager',
    department: 'Operations',
    phone: '+91-9876543222',
    reportingManager: 'HR001',
    role: 'manager'
  },

  // HR Users - L2 Approvers
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
  {
    email: 'hr2@nveltec.com',
    password: 'Test123!',
    employeeId: 'HR002',
    name: 'Ravi Menon',
    grade: 'L2',
    position: 'HR Executive',
    department: 'Human Resources',
    phone: '+91-9876543231',
    reportingManager: 'HR001',
    role: 'hr'
  },

  // Admin Users
  {
    email: 'admin@nveltec.com',
    password: 'Admin123!',
    employeeId: 'ADMIN001',
    name: 'Naresh Kumar B',
    grade: 'Director',
    position: 'System Administrator',
    department: 'IT',
    phone: '+91-9876543240',
    reportingManager: null,
    role: 'admin'
  },
  {
    email: 'admin2@nveltec.com',
    password: 'Admin123!',
    employeeId: 'ADMIN002',
    name: 'Sanjay Raghavan',
    grade: 'DGM',
    position: 'Deputy General Manager',
    department: 'Administration',
    phone: '+91-9876543241',
    reportingManager: 'ADMIN001',
    role: 'admin'
  },

  // Finance Users - L3 Approvers (for high-value claims)
  {
    email: 'finance1@nveltec.com',
    password: 'Test123!',
    employeeId: 'FIN001',
    name: 'Lakshmi Pillai',
    grade: 'L1',
    position: 'Finance Head',
    department: 'Finance',
    phone: '+91-9876543250',
    reportingManager: 'ADMIN001',
    role: 'finance'
  }
];

// Sample claims data for testing
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
    approvalChain: { L1: 'MGR001', L2: 'HR001' }
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
    approvalChain: { L1: 'MGR002', L2: 'HR001' }
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Suresh Nair',
    employeeEmail: 'emp.a1@nveltec.com',
    type: 'fuel',
    amount: 800,
    description: 'Fuel expenses for client visits - 150 km',
    date: new Date('2025-08-13'),
    status: 'approved',
    approvalChain: { L1: 'MGR003', L2: 'HR001' }
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Kavitha Reddy',
    employeeEmail: 'emp.l5@nveltec.com',
    type: 'food',
    amount: 450,
    description: 'Food expenses during business trip',
    date: new Date('2025-08-11'),
    status: 'pending_l2',
    approvalChain: { L1: 'MGR004', L2: 'HR001' }
  },
  {
    employeeId: 'EMP005',
    employeeName: 'Arjun Patel',
    employeeEmail: 'emp.l4@nveltec.com',
    type: 'other',
    amount: 15000,
    description: 'Conference attendance and training - Bangalore',
    date: new Date('2025-08-09'),
    status: 'pending_l3',
    approvalChain: { L1: 'MGR005', L2: 'HR001', L3: 'FIN001' }
  }
];

class TestDataSetup {
  async createUser(userData: any) {
    try {
      console.log(`Creating user: ${userData.email}`);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      console.log(`✅ Auth user created: ${user.uid}`);

      // Create employee document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
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
      });

      console.log(`✅ Firestore user document created for: ${userData.name}`);
      return { success: true, uid: user.uid, email: userData.email };
      
    } catch (error: any) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
      return { success: false, error: error.message, email: userData.email };
    }
  }

  async createSampleClaim(claimData: any) {
    try {
      console.log(`Creating sample claim for: ${claimData.employeeName}`);
      
      const claimDoc = {
        ...claimData,
        submittedAt: new Date(),
        updatedAt: new Date(),
        approvals: [],
        notes: 'Sample claim for testing purposes'
      };

      const docRef = await addDoc(collection(db, 'claims'), claimDoc);
      console.log(`✅ Sample claim created: ${docRef.id}`);
      return { success: true, claimId: docRef.id };
      
    } catch (error: any) {
      console.error(`❌ Error creating sample claim:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async setupAllTestData() {
    console.log('🚀 Starting test data setup...');
    console.log('═══════════════════════════════════════');
    
    const results = {
      users: { success: 0, failed: 0, errors: [] as any[] },
      claims: { success: 0, failed: 0, errors: [] as any[] }
    };

    // Create all test users
    console.log('\n👥 Creating test users...');
    for (const userData of testUsers) {
      const result = await this.createUser(userData);
      if (result.success) {
        results.users.success++;
      } else {
        results.users.failed++;
        results.users.errors.push(result);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create sample claims
    console.log('\n📄 Creating sample claims...');
    for (const claimData of sampleClaims) {
      const result = await this.createSampleClaim(claimData);
      if (result.success) {
        results.claims.success++;
      } else {
        results.claims.failed++;
        results.claims.errors.push(result);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Print summary
    console.log('\n📊 SETUP COMPLETE - SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users: ${results.users.success} created, ${results.users.failed} failed`);
    console.log(`📄 Claims: ${results.claims.success} created, ${results.claims.failed} failed`);
    
    if (results.users.errors.length > 0) {
      console.log('\n❌ User Creation Errors:');
      results.users.errors.forEach(error => {
        console.log(`  • ${error.email}: ${error.error}`);
      });
    }
    
    if (results.claims.errors.length > 0) {
      console.log('\n❌ Claim Creation Errors:');
      results.claims.errors.forEach(error => {
        console.log(`  • ${error.error}`);
      });
    }

    console.log('\n🎉 Test data setup completed!');
    console.log('\n📋 TEST ACCOUNTS CREATED:');
    console.log('Employee Accounts:');
    testUsers.filter(u => u.role === 'employee').forEach(u => {
      console.log(`  📧 ${u.email} | 🔑 ${u.password} | 👤 ${u.name} (${u.grade})`);
    });
    
    console.log('\nManager Accounts:');
    testUsers.filter(u => u.role === 'manager').forEach(u => {
      console.log(`  📧 ${u.email} | 🔑 ${u.password} | 👤 ${u.name} (${u.position})`);
    });
    
    console.log('\nHR Accounts:');
    testUsers.filter(u => u.role === 'hr').forEach(u => {
      console.log(`  📧 ${u.email} | 🔑 ${u.password} | 👤 ${u.name} (${u.position})`);
    });
    
    console.log('\nAdmin Accounts:');
    testUsers.filter(u => u.role === 'admin').forEach(u => {
      console.log(`  📧 ${u.email} | 🔑 ${u.password} | 👤 ${u.name} (${u.position})`);
    });

    return results;
  }
}

// Export for use in other scripts
export default TestDataSetup;

// If running directly
if (typeof window === 'undefined') {
  const setup = new TestDataSetup();
  setup.setupAllTestData().then(() => {
    console.log('\n✅ All done! You can now use these test accounts to login and test your application.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}
