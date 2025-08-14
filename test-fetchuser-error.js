// Quick test to check if fetchUser error still exists
// Add this to your browser console after starting the app

console.log('🧪 Running comprehensive fetchUser error test...');

// Test 1: Check if all modules can be imported
const testImports = async () => {
  console.log('📦 Testing module imports...');
  
  try {
    const employeeService = await import('/src/lib/employeeService.ts');
    console.log('✅ employeeService imported:', Object.keys(employeeService));
    
    const auth = await import('/src/lib/auth.ts');
    console.log('✅ auth imported:', Object.keys(auth));
    
    const firebase = await import('/src/lib/firebase.ts');
    console.log('✅ firebase imported:', Object.keys(firebase));
    
    const managerUtils = await import('/src/lib/managerUtils.ts');
    console.log('✅ managerUtils imported:', Object.keys(managerUtils));
    
    return true;
  } catch (error) {
    console.error('❌ Import error:', error);
    return false;
  }
};

// Test 2: Check if employee lookup works
const testEmployeeLookup = async () => {
  console.log('🔍 Testing employee lookup...');
  
  try {
    const { getEmployeeByIdOrEmail } = await import('/src/lib/employeeService.ts');
    const result = await getEmployeeByIdOrEmail('manager1@noveltech.com');
    console.log('📊 Employee lookup result:', result);
    return result;
  } catch (error) {
    console.error('❌ Employee lookup error:', error);
    return null;
  }
};

// Test 3: Check Firebase connection
const testFirebase = async () => {
  console.log('🔥 Testing Firebase connection...');
  
  try {
    const { auth, db } = await import('/src/lib/firebase.ts');
    console.log('🔐 Auth state:', auth.currentUser ? 'authenticated' : 'not authenticated');
    console.log('🗄️ Database:', db ? 'connected' : 'not connected');
    return true;
  } catch (error) {
    console.error('❌ Firebase error:', error);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting all tests...');
  
  const importTest = await testImports();
  const employeeTest = await testEmployeeLookup();
  const firebaseTest = await testFirebase();
  
  console.log('📊 Test Results:');
  console.log('- Imports:', importTest ? '✅' : '❌');
  console.log('- Employee lookup:', employeeTest ? '✅' : '❌');
  console.log('- Firebase:', firebaseTest ? '✅' : '❌');
  
  if (importTest && employeeTest && firebaseTest) {
    console.log('🎉 All tests passed! fetchUser error should be resolved.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }
};

// Auto-run tests
runAllTests();
