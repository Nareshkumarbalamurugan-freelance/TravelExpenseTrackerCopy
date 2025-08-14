import admin from 'firebase-admin';
import serviceAccount from './expensetracker-c25fd-firebase-adminsdk-fbsvc-826ddb420c.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupHRSystem() {
  console.log('🚀 Setting up Travel Expense Tracker - HR System...');

  try {
    // 1. Create Employee Grades with Entitlements
    console.log('📋 Setting up employee grades and entitlements...');
    
    const grades = [
      {
        id: 'L4_SALES',
        name: 'L4 & Above (Sales)',
        designation: 'Sales Manager',
        allowances: {
          daily: 1000,
          travel: 0, // Calculated based on distance
          accommodation: 2000,
          other: 500
        },
        fuelRules: {
          vehicleType: 'Car',
          kmPerLitre: 7,
          description: '1 Litre fuel for every 7 km'
        },
        receiptRequired: false, // For KM-based fuel claims
        isActive: true
      },
      {
        id: 'BELOW_L4',
        name: 'Below L4',
        designation: 'Sales Executive',
        allowances: {
          daily: 500,
          travel: 0, // Calculated based on distance
          accommodation: 1000,
          other: 300
        },
        fuelRules: {
          vehicleType: '2-wheeler',
          kmPerLitre: 25,
          description: '1 Litre fuel for every 25 km'
        },
        receiptRequired: false, // For KM-based fuel claims
        isActive: true
      },
      {
        id: 'HR_MANAGER',
        name: 'HR Manager',
        designation: 'Human Resources',
        allowances: {
          daily: 1500,
          travel: 0,
          accommodation: 3000,
          other: 800
        },
        fuelRules: {
          vehicleType: 'Car',
          kmPerLitre: 7,
          description: '1 Litre fuel for every 7 km'
        },
        receiptRequired: false,
        isActive: true
      }
    ];

    for (const grade of grades) {
      await db.collection('grades').doc(grade.id).set({
        ...grade,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Created grade: ${grade.name}`);
    }

    // 2. Setup System Configuration
    console.log('⚙️ Setting up system configuration...');
    
    await db.collection('systemConfig').doc('main').set({
      companyName: 'Noveltech Feeds',
      claimCategories: [
        'Daily Allowance',
        'Toll Fee', 
        'Taxi / Auto / Bus / Train / Fuel Bills',
        'Lodging',
        'Boarding',
        'Tips Paid',
        'Miscellaneous'
      ],
      approvalWorkflow: {
        L1: 'Reporting Manager',
        L2: 'HR Manager', 
        L3: 'Next Higher Manager'
      },
      documentRequirements: {
        mandatory: 'All claims except kilometer-based fuel claims',
        allowedFormats: ['PDF', 'JPG', 'PNG'],
        maxFileSize: '5MB'
      },
      autoEscalation: {
        enabled: true,
        description: 'Auto-move to next level if reporting manager has resigned'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ System configuration completed');

    // 3. Create Sample Employees for Testing
    console.log('👥 Creating sample employees...');
    
    const sampleEmployees = [
      {
        id: 'EMP001',
        email: 'naresh@noveltech.com',
        name: 'Naresh Kumar',
        grade: 'L4_SALES',
        designation: 'Sales Manager',
        phone: '+91-9876543210',
        department: 'Sales',
        approvalChain: {
          L1: 'MGR001', // Reporting Manager
          L2: 'HR001',  // HR Manager
          L3: 'DIR001'  // Director
        },
        active: true,
        onboardingDate: new Date().toISOString(),
        location: 'Chennai'
      },
      {
        id: 'EMP002', 
        email: 'employee@noveltech.com',
        name: 'Test Employee',
        grade: 'BELOW_L4',
        designation: 'Sales Executive',
        phone: '+91-9876543211',
        department: 'Sales',
        approvalChain: {
          L1: 'EMP001', // Reports to Naresh
          L2: 'HR001',
          L3: 'DIR001'
        },
        active: true,
        onboardingDate: new Date().toISOString(),
        location: 'Chennai'
      },
      {
        id: 'HR001',
        email: 'hr@noveltech.com',
        name: 'HR Manager',
        grade: 'HR_MANAGER',
        designation: 'HR Manager',
        phone: '+91-9876543212',
        department: 'Human Resources',
        approvalChain: {
          L1: 'DIR001',
          L2: 'DIR001',
          L3: 'DIR001'
        },
        active: true,
        onboardingDate: new Date().toISOString(),
        location: 'Chennai'
      }
    ];

    for (const emp of sampleEmployees) {
      await db.collection('employees').doc(emp.id).set({
        ...emp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Created employee: ${emp.name} (${emp.id})`);
    }

    // 4. Create Admin User for Login
    console.log('🔐 Setting up admin access...');
    
    await db.collection('adminUsers').doc('admin').set({
      username: 'admin',
      email: 'admin@noveltech.com',
      name: 'System Administrator',
      role: 'Super Admin',
      permissions: ['all'],
      active: true,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Admin user created');

    // 5. Setup Position Rates (for backward compatibility)
    console.log('💰 Setting up position rates...');
    
    const positionRates = [
      {
        id: 'sales_executive',
        position: 'Sales Executive',
        perKmRate: 12,
        dailyAllowance: 500,
        maxDailyExpense: 2000,
        fuelRule: '1 litre per 25 km (2-wheeler)'
      },
      {
        id: 'sales_manager', 
        position: 'Sales Manager',
        perKmRate: 18,
        dailyAllowance: 1000,
        maxDailyExpense: 3000,
        fuelRule: '1 litre per 7 km (Car)'
      },
      {
        id: 'hr_manager',
        position: 'HR Manager', 
        perKmRate: 20,
        dailyAllowance: 1500,
        maxDailyExpense: 4000,
        fuelRule: '1 litre per 7 km (Car)'
      }
    ];

    for (const rate of positionRates) {
      await db.collection('positionRates').doc(rate.id).set({
        ...rate,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Created position rate: ${rate.position}`);
    }

    console.log('🎉 HR System setup completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- ✅ Employee grades and entitlements configured');
    console.log('- ✅ Fuel rules (L4+ Car: 7km/L, Below L4 2-wheeler: 25km/L)');
    console.log('- ✅ 7 claim categories as per HR requirements');
    console.log('- ✅ 3-level approval workflow (L1→L2→L3)');
    console.log('- ✅ Document requirements (mandatory except KM-based fuel)');
    console.log('- ✅ Sample employees created for testing');
    console.log('- ✅ Admin access configured');
    console.log('');
    console.log('🔐 Admin Login: admin / admin@poultrymitra');
    console.log('👤 Test Employee: employee@noveltech.com');
    console.log('🏢 Company: Noveltech Feeds');

  } catch (error) {
    console.error('❌ Error setting up HR system:', error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupHRSystem();
