// Quick Firebase Auth Test Script
// Run this in browser console to check if test users exist

const testUsers = [
  { email: 'emp1@nveltec.com', password: 'Test123!' },
  { email: 'mgr1@nveltec.com', password: 'Test123!' },
  { email: 'hr1@nveltec.com', password: 'Test123!' },
  { email: 'admin.test@nveltec.com', password: 'Admin123!' }
];

// Test function to check if users exist
async function testFirebaseAuth() {
  console.log('🧪 Testing Firebase Auth for test users...');
  
  for (const user of testUsers) {
    try {
      console.log(`Testing: ${user.email}`);
      
      // Try to sign in
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('./src/lib/firebase');
      
      const result = await signInWithEmailAndPassword(auth, user.email, user.password);
      console.log(`✅ ${user.email} - EXISTS and login successful`);
      
      // Sign out immediately
      await auth.signOut();
      
    } catch (error) {
      console.log(`❌ ${user.email} - ${error.code}: ${error.message}`);
    }
  }
}

// Run the test
testFirebaseAuth();
