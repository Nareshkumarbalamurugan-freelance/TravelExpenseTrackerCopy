#!/usr/bin/env node

// Admin Setup Script - Run with: node setup-admin.js

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // Add your service account key here or use default credentials
};

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // Or use service account: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupAdmin() {
  console.log('🚀 Setting up admin system...');
  
  try {
    // Set up admin user
    console.log('👤 Setting up admin user...');
    await db.collection('users').doc('bUekUMejRsO8EngZxcjLQ79DPPC2').set({
      role: 'admin',
      isAdmin: true,
      email: 'nareshkumarbalamurugan@gmail.com',
      position: 'Regional Manager',
      canManagePositions: true,
      canManageUsers: true,
      canViewReports: true,
      adminSetupAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Admin user created');

    // Set up position rates
    console.log('💰 Setting up position rates...');
    const positions = [
      { id: 'sales_executive', name: 'Sales Executive', ratePerKm: 12, dailyAllowance: 500 },
      { id: 'senior_executive', name: 'Senior Executive', ratePerKm: 15, dailyAllowance: 750 },
      { id: 'manager', name: 'Manager', ratePerKm: 18, dailyAllowance: 1000 },
      { id: 'regional_manager', name: 'Regional Manager', ratePerKm: 22, dailyAllowance: 1500 }
    ];

    for (const position of positions) {
      await db.collection('positionRates').doc(position.id).set({
        ...position,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Created position: ${position.name}`);
    }

    // Set up system config
    console.log('⚙️ Setting up system configuration...');
    await db.collection('systemConfig').doc('main').set({
      id: 'main',
      companyName: 'Noveltech Feeds',
      maxDailyDistance: 500,
      maxDealerVisits: 20,
      trackingInterval: 30,
      minLocationAccuracy: 100,
      isMaintenanceMode: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'firebase-cli'
    });
    console.log('✅ System configuration created');

    console.log('🎉 Admin setup complete!');
    console.log('👉 You can now use the travel expense tracker with admin privileges');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }

  process.exit(0);
}

setupAdmin();
