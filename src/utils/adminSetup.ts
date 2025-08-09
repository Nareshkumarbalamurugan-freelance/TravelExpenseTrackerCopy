// Initial admin setup utility
// Run this once to set up the admin system with default data

import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Set up initial admin user (make first user admin)
 * Call this function with a user ID to make them admin
 */
export const setupInitialAdmin = async (userId: string): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: 'admin',
      isAdmin: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ Admin user set up successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    return false;
  }
};

/**
 * Set up initial position rates in the database
 */
export const setupInitialPositionRates = async (): Promise<boolean> => {
  try {
    const defaultPositions = [
      {
        name: 'Sales Executive',
        ratePerKm: 12,
        dailyAllowance: 500,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Senior Executive', 
        ratePerKm: 15,
        dailyAllowance: 750,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Manager',
        ratePerKm: 18,
        dailyAllowance: 1000,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Regional Manager',
        ratePerKm: 22,
        dailyAllowance: 1500,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const position of defaultPositions) {
      const docRef = doc(collection(db, 'positionRates'));
      await setDoc(docRef, { ...position, id: docRef.id });
    }
    
    console.log('✅ Position rates set up successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up position rates:', error);
    return false;
  }
};

/**
 * Set up initial system configuration
 */
export const setupInitialSystemConfig = async (): Promise<boolean> => {
  try {
    const defaultConfig = {
      id: 'main',
      companyName: 'Noveltech Feeds',
      maxDailyDistance: 500,
      maxDealerVisits: 20,
      trackingInterval: 30,
      minLocationAccuracy: 100,
      isMaintenanceMode: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };

    await setDoc(doc(db, 'systemConfig', 'main'), defaultConfig);
    
    console.log('✅ System configuration set up successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up system config:', error);
    return false;
  }
};

/**
 * Complete admin system setup
 * Run this once after creating your first user account
 */
export const completeAdminSetup = async (firstUserId: string): Promise<boolean> => {
  console.log('🚀 Starting complete admin system setup...');
  
  try {
    const adminSetup = await setupInitialAdmin(firstUserId);
    const ratesSetup = await setupInitialPositionRates();
    const configSetup = await setupInitialSystemConfig();
    
    if (adminSetup && ratesSetup && configSetup) {
      console.log('🎉 Complete admin system setup successful!');
      console.log('👉 You can now access the admin dashboard');
      return true;
    } else {
      console.log('⚠️ Some setup steps failed. Check the logs above.');
      return false;
    }
  } catch (error) {
    console.error('❌ Complete setup failed:', error);
    return false;
  }
};

// Helper function to get current user ID from auth context
export const getCurrentUserId = (): string | null => {
  // This should be called from a component that has access to auth context
  // Return the current user's ID
  return null; // Placeholder - implement based on your auth setup
};
