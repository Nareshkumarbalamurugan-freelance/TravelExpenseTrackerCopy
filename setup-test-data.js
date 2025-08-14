// 🎯 Setup Test Data for Role-Based Dashboard Testing
// This script creates employees with proper approval chains

import { createEmployee } from '../src/lib/unifiedEmployeeService';

const setupTestData = async () => {
  console.log('🎯 Setting up test data for role-based dashboards...');

  try {
    // Create a regular employee who reports to manager1
    console.log('👤 Creating regular employee...');
    const employeeResult = await createEmployee({
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

    if (employeeResult.success) {
      console.log('✅ Regular employee created successfully');
    } else {
      console.log('❌ Failed to create employee:', employeeResult.error);
    }

    // Create another employee for testing
    console.log('👤 Creating another employee...');
    const employee2Result = await createEmployee({
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

    if (employee2Result.success) {
      console.log('✅ Second employee created successfully');
    } else {
      console.log('❌ Failed to create second employee:', employee2Result.error);
    }

    // Create a senior manager for L2/L3 approvals
    console.log('👔 Creating senior manager...');
    const seniorManagerResult = await createEmployee({
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

    if (seniorManagerResult.success) {
      console.log('✅ Senior manager created successfully');
    } else {
      console.log('❌ Failed to create senior manager:', seniorManagerResult.error);
    }

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
};

// Run the setup
setupTestData();
