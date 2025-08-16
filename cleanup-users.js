// Firebase User Cleanup Script
// This script removes all users except admin from Firebase Auth and Firestore

import { auth, db } from './src/lib/firebase.js';
import { 
  signInWithEmailAndPassword, 
  deleteUser,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';

// Admin user to preserve (update this to your actual admin email)
const ADMIN_EMAIL = 'admin.test@nveltec.com';
const ADMIN_PASSWORD = 'Admin123!'; // Update with actual admin password

async function cleanupAllUsers() {
  console.log('🚀 Starting Firebase user cleanup...');
  console.log(`⚠️  Will preserve admin user: ${ADMIN_EMAIL}`);
  console.log('⚠️  This will delete ALL other users from Auth and Firestore!');
  
  try {
    // Step 1: Clean up Firestore collections first
    await cleanupFirestoreUsers();
    await cleanupFirestoreEmployees();
    await cleanupFirestoreClaims();
    
    // Step 2: Clean up Firebase Auth users
    // Note: We can't directly list all Auth users from client-side
    // We'll clean up known test users
    await cleanupAuthUsers();
    
    console.log('✅ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Clean up users collection in Firestore
async function cleanupFirestoreUsers() {
  console.log('🧹 Cleaning up Firestore users collection...');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let deletedCount = 0;
    let preservedCount = 0;
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      if (userData.email && userData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log(`✅ Preserving admin user: ${userData.email}`);
        preservedCount++;
      } else {
        await deleteDoc(doc(db, 'users', userDoc.id));
        console.log(`🗑️  Deleted user: ${userData.email || userDoc.id}`);
        deletedCount++;
      }
    }
    
    console.log(`📊 Users collection: ${deletedCount} deleted, ${preservedCount} preserved`);
    
  } catch (error) {
    console.error('❌ Error cleaning users collection:', error);
  }
}

// Clean up employees collection in Firestore
async function cleanupFirestoreEmployees() {
  console.log('🧹 Cleaning up Firestore employees collection...');
  
  try {
    const employeesRef = collection(db, 'employees');
    const snapshot = await getDocs(employeesRef);
    
    let deletedCount = 0;
    let preservedCount = 0;
    
    for (const empDoc of snapshot.docs) {
      const empData = empDoc.data();
      
      if (empData.email && empData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log(`✅ Preserving admin employee: ${empData.email}`);
        preservedCount++;
      } else {
        await deleteDoc(doc(db, 'employees', empDoc.id));
        console.log(`🗑️  Deleted employee: ${empData.email || empData.employeeId || empDoc.id}`);
        deletedCount++;
      }
    }
    
    console.log(`📊 Employees collection: ${deletedCount} deleted, ${preservedCount} preserved`);
    
  } catch (error) {
    console.error('❌ Error cleaning employees collection:', error);
  }
}

// Clean up claims collection in Firestore
async function cleanupFirestoreClaims() {
  console.log('🧹 Cleaning up Firestore claims collection...');
  
  try {
    const claimsRef = collection(db, 'claims');
    const snapshot = await getDocs(claimsRef);
    
    let deletedCount = 0;
    let preservedCount = 0;
    
    for (const claimDoc of snapshot.docs) {
      const claimData = claimDoc.data();
      
      // Preserve claims from admin user
      if (claimData.employeeEmail && claimData.employeeEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log(`✅ Preserving admin claim: ${claimDoc.id}`);
        preservedCount++;
      } else {
        await deleteDoc(doc(db, 'claims', claimDoc.id));
        console.log(`🗑️  Deleted claim: ${claimData.employeeEmail || claimDoc.id}`);
        deletedCount++;
      }
    }
    
    console.log(`📊 Claims collection: ${deletedCount} deleted, ${preservedCount} preserved`);
    
  } catch (error) {
    console.error('❌ Error cleaning claims collection:', error);
  }
}

// Clean up Firebase Auth users
async function cleanupAuthUsers() {
  console.log('🧹 Cleaning up Firebase Auth users...');
  console.log('⚠️  Note: Client-side can only delete currently authenticated user');
  console.log('💡 For complete Auth cleanup, use Firebase Admin SDK or Firebase Console');
  
  // List of known test users to clean up
  const testUsers = [
    { email: 'test@test.com', password: 'password123' },
    { email: 'test@test.com', password: 'password' },
    { email: 'emp1@nveltec.com', password: 'Test123!' },
    { email: 'emp2@nveltec.com', password: 'Test123!' },
    { email: 'mgr1@nveltec.com', password: 'Test123!' },
    { email: 'mgr2@nveltec.com', password: 'Test123!' },
    { email: 'hr1@nveltec.com', password: 'Test123!' },
    { email: 'finance1@nveltec.com', password: 'Test123!' },
    { email: 'emp.c1@nveltec.com', password: 'Test123!' },
    { email: 'emp.b1@nveltec.com', password: 'Test123!' },
    { email: 'emp.a1@nveltec.com', password: 'Test123!' }
  ];
  
  let deletedCount = 0;
  let skippedCount = 0;
  
  for (const testUser of testUsers) {
    if (testUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      console.log(`✅ Skipping admin user: ${testUser.email}`);
      skippedCount++;
      continue;
    }
    
    try {
      // Sign in as the test user
      const userCredential = await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
      const user = userCredential.user;
      
      // Delete the user account
      await deleteUser(user);
      console.log(`🗑️  Deleted Auth user: ${testUser.email}`);
      deletedCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log(`ℹ️  User not found or invalid credentials: ${testUser.email}`);
      } else {
        console.error(`❌ Error deleting Auth user ${testUser.email}:`, error.message);
      }
    }
  }
  
  console.log(`📊 Auth users: ${deletedCount} deleted, ${skippedCount} skipped`);
  
  // Sign out after cleanup
  try {
    await signOut(auth);
    console.log('🚪 Signed out successfully');
  } catch (error) {
    console.log('ℹ️  No user was signed in');
  }
}

// Confirmation function
function confirmCleanup() {
  const confirmation = confirm(
    `⚠️  WARNING: This will delete ALL users except ${ADMIN_EMAIL} from:\n\n` +
    '• Firebase Authentication\n' +
    '• Firestore users collection\n' +
    '• Firestore employees collection\n' +
    '• Firestore claims collection\n\n' +
    'This action CANNOT be undone!\n\n' +
    'Are you sure you want to proceed?'
  );
  
  if (confirmation) {
    const doubleConfirm = confirm(
      '🚨 FINAL CONFIRMATION:\n\n' +
      'You are about to permanently delete all user data except the admin account.\n\n' +
      'Type YES in your mind and click OK to proceed, or Cancel to abort.'
    );
    
    if (doubleConfirm) {
      cleanupAllUsers();
    } else {
      console.log('🛑 Cleanup cancelled by user');
    }
  } else {
    console.log('🛑 Cleanup cancelled by user');
  }
}

// Export for manual execution
window.cleanupAllUsers = cleanupAllUsers;
window.confirmCleanup = confirmCleanup;

console.log('🧹 Firebase Cleanup Script Loaded');
console.log('📝 Available commands:');
console.log('  - confirmCleanup() - Start cleanup with confirmation');
console.log('  - cleanupAllUsers() - Start cleanup without confirmation');
console.log(`⚠️  Admin user to preserve: ${ADMIN_EMAIL}`);

// Auto-run with confirmation (comment out if you want manual execution)
// confirmCleanup();
