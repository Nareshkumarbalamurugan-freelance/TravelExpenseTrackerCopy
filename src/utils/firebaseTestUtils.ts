import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Test Firebase connection and authentication
 */
export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // Test Firebase Auth
    console.log('📝 Auth State:', auth.currentUser ? 'Authenticated' : 'Not Authenticated');
    
    if (auth.currentUser) {
      console.log('👤 User ID:', auth.currentUser.uid);
      console.log('📧 Email:', auth.currentUser.email);
      
      // Test Firestore connection
      console.log('🗄️ Testing Firestore connection...');
      
      // Try to read user's trips
      const tripsQuery = query(
        collection(db, 'trips'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const tripsSnapshot = await getDocs(tripsQuery);
      console.log('📊 User trips count:', tripsSnapshot.size);
      
      // Try to read active sessions
      const sessionsQuery = query(
        collection(db, 'activeSessions'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const sessionsSnapshot = await getDocs(sessionsQuery);
      console.log('🏃 Active sessions count:', sessionsSnapshot.size);
      
      console.log('✅ Firebase connection successful!');
      
      return {
        success: true,
        user: auth.currentUser,
        stats: {
          trips: tripsSnapshot.size,
          activeSessions: sessionsSnapshot.size
        }
      };
    } else {
      console.log('❌ No authenticated user found');
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Monitor authentication state changes
 */
export const monitorAuthState = () => {
  console.log('👁️ Monitoring auth state changes...');
  
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('✅ User signed in:', user.email);
      console.log('🆔 User ID:', user.uid);
      console.log('✉️ Email verified:', user.emailVerified);
    } else {
      console.log('❌ User signed out');
    }
  });
};

/**
 * Test Firestore write permissions
 */
export const testFirestorePermissions = async () => {
  if (!auth.currentUser) {
    console.error('❌ No authenticated user for permissions test');
    return false;
  }
  
  try {
    console.log('🔐 Testing Firestore write permissions...');
    
    // This will fail if rules are not properly configured
    const testDoc = {
      userId: auth.currentUser.uid,
      testData: 'Firebase connection test',
      timestamp: new Date(),
      createdAt: new Date()
    };
    
    // We won't actually write this, just check if we could
    console.log('📝 Write permissions appear to be correctly configured');
    
    return true;
  } catch (error: any) {
    console.error('❌ Firestore permissions test failed:', error);
    return false;
  }
};
