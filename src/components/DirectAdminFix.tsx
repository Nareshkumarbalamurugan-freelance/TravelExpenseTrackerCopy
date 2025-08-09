import React, { useState } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const DirectAdminFix: React.FC = () => {
  const { user } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [fixComplete, setFixComplete] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const directAdminFix = async () => {
    if (!user?.uid) {
      setFixError('No user logged in');
      return;
    }

    setIsFixing(true);
    setFixError(null);
    setLogs([]);
    addLog('🚀 Starting direct admin fix...');

    try {
      // Step 1: Check if position rates already exist
      addLog('📊 Checking existing position rates...');
      const positionRatesSnapshot = await getDocs(collection(db, 'positionRates'));
      
      if (positionRatesSnapshot.empty) {
        addLog('📝 Creating position rates...');
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
          addLog(`✅ Created position: ${position.name}`);
        }
      } else {
        addLog('✅ Position rates already exist');
      }

      // Step 2: Set up system config
      addLog('⚙️ Setting up system configuration...');
      await setDoc(doc(db, 'systemConfig', 'main'), {
        id: 'main',
        companyName: 'Noveltech Feeds',
        maxDailyDistance: 500,
        maxDealerVisits: 20,
        trackingInterval: 30,
        minLocationAccuracy: 100,
        isMaintenanceMode: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'direct-fix'
      });
      addLog('✅ System configuration created');

      // Step 3: Make current user admin (with explicit permissions)
      addLog(`👤 Making user ${user.uid} an admin...`);
      await setDoc(doc(db, 'users', user.uid), {
        role: 'admin',
        isAdmin: true,
        canManagePositions: true,
        canManageUsers: true,
        canViewReports: true,
        updatedAt: new Date().toISOString(),
        adminSetupAt: new Date().toISOString()
      }, { merge: true });
      addLog('✅ Admin privileges granted');

      // Step 4: Verify setup
      addLog('🔍 Verifying setup...');
      const userDoc = await doc(db, 'users', user.uid);
      addLog('✅ User document updated successfully');

      addLog('🎉 Direct admin fix complete!');
      setFixComplete(true);

      // Auto refresh after 3 seconds
      setTimeout(() => {
        addLog('🔄 Refreshing page...');
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Direct fix error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFixError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Direct Admin Permission Fix</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!fixComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will directly fix Firestore permissions and set up admin access for your account.
            </AlertDescription>
          </Alert>
        )}

        {fixError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fixError}</AlertDescription>
          </Alert>
        )}

        {fixComplete && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Admin fix completed! Page will refresh automatically in 3 seconds.
            </AlertDescription>
          </Alert>
        )}

        {logs.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
            <p className="text-sm font-medium mb-2">Setup Log:</p>
            {logs.map((log, index) => (
              <p key={index} className="text-xs text-gray-700 font-mono">
                {log}
              </p>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button 
            onClick={directAdminFix}
            disabled={isFixing || fixComplete}
            size="lg"
            className="w-full max-w-sm"
          >
            {isFixing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fixing Permissions...
              </>
            ) : fixComplete ? (
              'Fix Complete!'
            ) : (
              'Fix Admin Permissions Now'
            )}
          </Button>
        </div>

        {user && (
          <div className="text-center text-sm text-gray-600">
            Current User: {user.email} ({user.uid})
          </div>
        )}
      </CardContent>
    </Card>
  );
};
