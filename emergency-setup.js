// Emergency Admin Setup Script
// Run this in browser console to fix permission issues immediately

// Copy and paste this entire script into your browser console and press Enter
(async function emergencyAdminSetup() {
  console.log('🚨 Emergency Admin Setup Starting...');
  
  // Import Firebase dependencies
  const { doc, setDoc, collection } = await import('firebase/firestore');
  const { db } = await import('./src/lib/firebase.ts');
  
  const userId = 'bUekUMejRsO8EngZxcjLQ79DPPC2'; // Your user ID from logs
  
  try {
    // Step 1: Make user admin
    console.log('1️⃣ Setting up admin user...');
    await setDoc(doc(db, 'users', userId), {
      role: 'admin',
      isAdmin: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ Admin user created');
    
    // Step 2: Create position rates
    console.log('2️⃣ Creating position rates...');
    const positions = [
      { name: 'Sales Executive', ratePerKm: 12, dailyAllowance: 500, isActive: true },
      { name: 'Senior Executive', ratePerKm: 15, dailyAllowance: 750, isActive: true },
      { name: 'Manager', ratePerKm: 18, dailyAllowance: 1000, isActive: true },
      { name: 'Regional Manager', ratePerKm: 22, dailyAllowance: 1500, isActive: true }
    ];
    
    for (const position of positions) {
      const docRef = doc(collection(db, 'positionRates'));
      await setDoc(docRef, {
        ...position,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log('✅ Position rates created');
    
    // Step 3: Create system config
    console.log('3️⃣ Creating system config...');
    await setDoc(doc(db, 'systemConfig', 'main'), {
      id: 'main',
      companyName: 'Noveltech Feeds',
      maxDailyDistance: 500,
      maxDealerVisits: 20,
      trackingInterval: 30,
      minLocationAccuracy: 100,
      isMaintenanceMode: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'emergency-setup'
    });
    console.log('✅ System config created');
    
    console.log('🎉 EMERGENCY SETUP COMPLETE!');
    console.log('👉 Refresh the page and try starting/ending trips again');
    
  } catch (error) {
    console.error('❌ Emergency setup failed:', error);
    console.log('📝 Try navigating to /admin-setup in your app instead');
  }
})();

// Alternative: If above fails, use this simpler version
// Just copy the code inside emergencyAdminSetup() and run it manually
