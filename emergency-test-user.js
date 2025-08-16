// Emergency Test User Creator - Run this in browser console
// Navigate to your app first, then paste this code

async function createEmergencyTestUser() {
  try {
    console.log('🚀 Starting emergency test user creation...');
    
    // Import Firebase functions from the window or app
    const { auth, db } = window.firebaseApp || await import('./src/lib/firebase.js');
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { setDoc, doc } = await import('firebase/firestore');
    
    const testUser = {
      email: 'test@test.com',
      password: 'password123',
      employeeId: 'TEST001',
      name: 'Test User',
      role: 'employee',
      grade: 'C',
      department: 'Testing',
      position: 'Test Engineer',
      phone: '+91-9876543210'
    };
    
    console.log('📧 Creating Auth user...');
    let user;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, testUser.email, testUser.password);
      user = userCredential.user;
      console.log('✅ Auth user created:', testUser.email);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ User already exists in Auth');
        // Create a placeholder UID
        user = { uid: 'test_user_001' };
      } else {
        throw authError;
      }
    }
    
    console.log('📝 Creating Firestore documents...');
    const userData = {
      uid: user.uid,
      email: testUser.email,
      employeeId: testUser.employeeId,
      name: testUser.name,
      grade: testUser.grade,
      position: testUser.position,
      department: testUser.department,
      phone: testUser.phone,
      role: testUser.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      travelEntitlement: testUser.grade,
      joinDate: new Date('2024-01-15'),
      employeeType: 'permanent',
      location: 'Chennai',
      costCenter: testUser.department
    };
    
    // Create in both collections
    await setDoc(doc(db, 'users', user.uid), userData);
    await setDoc(doc(db, 'employees', testUser.employeeId), userData);
    
    console.log('✅ Emergency test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('🆔 Employee ID:', testUser.employeeId);
    
    // Sign out to allow testing
    if (auth.currentUser) {
      await auth.signOut();
      console.log('🚪 Signed out for testing');
    }
    
    return { success: true, user: testUser };
    
  } catch (error) {
    console.error('❌ Emergency user creation failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run the function
createEmergencyTestUser();
