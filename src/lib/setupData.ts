// Initial setup script for admin panel
// Run this in Firebase console or admin panel to set up initial data

import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const setupInitialData = async () => {
  try {
    console.log('🚀 Setting up initial admin data...');

    // Set up system settings
    await setDoc(doc(db, 'admin', 'settings'), {
      maxDailyDistance: 500,
      maxMonthlyExpense: 50000,
      requirePhotoForVisits: true,
      autoApprovalLimit: 1000,
      companyName: 'Poultry Mitra',
      adminEmails: ['admin@poultrymitra.com'],
      defaultPositions: [
        {
          position: 'Sales Executive',
          perKmRate: 12,
          dailyAllowance: 500,
          maxDailyExpense: 2000
        },
        {
          position: 'Senior Executive',
          perKmRate: 15,
          dailyAllowance: 750,
          maxDailyExpense: 2500
        },
        {
          position: 'Manager',
          perKmRate: 18,
          dailyAllowance: 1000,
          maxDailyExpense: 3000
        },
        {
          position: 'Regional Manager',
          perKmRate: 22,
          dailyAllowance: 1500,
          maxDailyExpense: 4000
        },
        {
          position: 'Team Lead',
          perKmRate: 16,
          dailyAllowance: 800,
          maxDailyExpense: 2800
        }
      ],
      updatedAt: new Date()
    });

    console.log('✅ System settings configured');

    // Add individual position rates for easier management
    const positions = [
      { position: 'Sales Executive', perKmRate: 12, dailyAllowance: 500, maxDailyExpense: 2000 },
      { position: 'Senior Executive', perKmRate: 15, dailyAllowance: 750, maxDailyExpense: 2500 },
      { position: 'Manager', perKmRate: 18, dailyAllowance: 1000, maxDailyExpense: 3000 },
      { position: 'Regional Manager', perKmRate: 22, dailyAllowance: 1500, maxDailyExpense: 4000 },
      { position: 'Team Lead', perKmRate: 16, dailyAllowance: 800, maxDailyExpense: 2800 }
    ];

    for (const pos of positions) {
      await addDoc(collection(db, 'positionRates'), {
        ...pos,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('✅ Position rates added');

    // Set up admin stats initial document
    await setDoc(doc(db, 'admin', 'stats'), {
      totalEmployees: 0,
      activeEmployees: 0,
      totalTripsToday: 0,
      totalTripsThisMonth: 0,
      totalDistanceThisMonth: 0,
      totalExpensesThisMonth: 0,
      lastUpdated: new Date()
    });

    console.log('✅ Admin stats initialized');
    console.log('🎉 Initial setup complete!');
    
    return { success: true, message: 'Initial data setup completed successfully' };
  } catch (error) {
    console.error('❌ Error setting up initial data:', error);
    return { success: false, error: error.message };
  }
};

// Sample data for testing
export const createSampleData = async () => {
  try {
    console.log('📊 Creating sample data for testing...');

    // This would typically be called from admin panel after deployment
    // to create some sample trips and employees for demonstration

    console.log('ℹ️ Sample data creation should be done through the UI after deployment');
    console.log('ℹ️ Register employees through /login and admin can manage them via /admin');
    
    return { success: true, message: 'Sample data guidance provided' };
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in admin panel
export default {
  setupInitialData,
  createSampleData
};
