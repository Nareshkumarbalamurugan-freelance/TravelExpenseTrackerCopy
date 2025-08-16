// Emergency Test User Creator
// Run this in browser console if test users don't exist

async function createEmergencyTestUser() {
  try {
    console.log('🚀 Creating emergency test user...');
    
    // Import Firebase functions
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { auth, db } = await import('./src/lib/firebase');
    const { doc, setDoc, Timestamp } = await import('firebase/firestore');
    
    const testUser = {
      email: 'test@test.com',
      password: 'password',
      employeeId: 'TEST001',
      name: 'Test User',
      grade: 'C',
      position: 'Test Employee',
      department: 'Testing',
      phone: '+91-9999999999'
    };
    
    // Create Firebase Auth user
    console.log('📝 Creating Firebase Auth user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testUser.email, testUser.password);
    console.log('✅ Firebase Auth user created:', userCredential.user.uid);
    
    // Create Firestore document in 'users' collection
    console.log('📊 Creating Firestore document...');
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      employeeId: testUser.employeeId,
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      grade: testUser.grade,
      position: testUser.position,
      department: testUser.department,
      role: 'employee',
      isActive: true,
      approvalChain: {
        L1: 'MGR001',
        L2: 'HR001',
        L3: 'ADMIN001'
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Emergency test user created successfully!');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: password');
    
    // Sign out
    await auth.signOut();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create emergency test user:', error);
    return false;
  }
}

// Create the user
createEmergencyTestUser();
