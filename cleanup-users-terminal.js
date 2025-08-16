#!/usr/bin/env node

/**
 * Firebase User Cleanup Terminal Script
 * Run this with: node cleanup-users-terminal.js
 * 
 * This script cleans up all Firebase users except the admin
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin (you'll need to set up service account)
// Make sure you have the service account key file
try {
  const serviceAccount = require('./expensetracker-c25fd-firebase-adminsdk-fbsvc-826ddb420c.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'expensetracker-c25fd'
  });
  
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('💡 Make sure the service account file exists in the project root');
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

// Admin user to preserve
const ADMIN_EMAIL = 'admin.test@nveltec.com';

async function cleanupFirestoreCollection(collectionName, preserveField = 'email') {
  console.log(`🧹 Cleaning up ${collectionName} collection...`);
  
  const results = { deleted: 0, preserved: 0, errors: [] };
  
  try {
    const snapshot = await db.collection(collectionName).get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data[preserveField] && data[preserveField].toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log(`✅ Preserving admin in ${collectionName}: ${data[preserveField]}`);
        results.preserved++;
      } else {
        try {
          await doc.ref.delete();
          console.log(`🗑️  Deleted from ${collectionName}: ${data[preserveField] || doc.id}`);
          results.deleted++;
        } catch (error) {
          console.error(`❌ Error deleting from ${collectionName}:`, error);
          results.errors.push(`${data[preserveField] || doc.id}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error accessing ${collectionName}:`, error);
    results.errors.push(`Collection access error: ${error.message}`);
  }
  
  console.log(`📊 ${collectionName}: ${results.deleted} deleted, ${results.preserved} preserved`);
  return results;
}

async function cleanupAuthUsers() {
  console.log('🧹 Cleaning up Firebase Auth users...');
  
  const results = { deleted: 0, preserved: 0, errors: [] };
  
  try {
    // List all users (Admin SDK can do this)
    let listResult = await auth.listUsers();
    
    while (true) {
      for (const userRecord of listResult.users) {
        if (userRecord.email && userRecord.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          console.log(`✅ Preserving admin auth user: ${userRecord.email}`);
          results.preserved++;
        } else {
          try {
            await auth.deleteUser(userRecord.uid);
            console.log(`🗑️  Deleted auth user: ${userRecord.email || userRecord.uid}`);
            results.deleted++;
          } catch (error) {
            console.error(`❌ Error deleting auth user ${userRecord.email}:`, error);
            results.errors.push(`${userRecord.email || userRecord.uid}: ${error.message}`);
          }
        }
      }
      
      // Check if there are more users to process
      if (listResult.pageToken) {
        listResult = await auth.listUsers(1000, listResult.pageToken);
      } else {
        break;
      }
    }
  } catch (error) {
    console.error('❌ Error listing auth users:', error);
    results.errors.push(`Auth listing error: ${error.message}`);
  }
  
  console.log(`📊 Firebase Auth: ${results.deleted} deleted, ${results.preserved} preserved`);
  return results;
}

async function main() {
  console.log('🚀 Starting Firebase user cleanup...');
  console.log(`⚠️  Will preserve admin user: ${ADMIN_EMAIL}`);
  console.log('⚠️  This will delete ALL other users from Auth and Firestore!');
  
  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const confirm = await new Promise((resolve) => {
    readline.question('\n❓ Are you sure you want to proceed? (yes/no): ', (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
  
  readline.close();
  
  if (!confirm) {
    console.log('🛑 Cleanup cancelled by user');
    return;
  }
  
  try {
    // Clean up Firestore collections
    const usersResult = await cleanupFirestoreCollection('users', 'email');
    const employeesResult = await cleanupFirestoreCollection('employees', 'email');
    const claimsResult = await cleanupFirestoreCollection('claims', 'employeeEmail');
    
    // Clean up Firebase Auth
    const authResult = await cleanupAuthUsers();
    
    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`Users: ${usersResult.deleted} deleted, ${usersResult.preserved} preserved`);
    console.log(`Employees: ${employeesResult.deleted} deleted, ${employeesResult.preserved} preserved`);
    console.log(`Claims: ${claimsResult.deleted} deleted, ${claimsResult.preserved} preserved`);
    console.log(`Auth: ${authResult.deleted} deleted, ${authResult.preserved} preserved`);
    
    // Show errors if any
    const allErrors = [
      ...usersResult.errors,
      ...employeesResult.errors,
      ...claimsResult.errors,
      ...authResult.errors
    ];
    
    if (allErrors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      allErrors.forEach(error => console.log(`  - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
main().catch(console.error);
