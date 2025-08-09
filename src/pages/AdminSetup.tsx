import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeAdminSetup } from '../utils/adminSetup';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

export const AdminSetupPage: React.FC = () => {
  const { user } = useAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const handleSetupAdmin = async () => {
    if (!user?.uid) {
      setSetupError('No user logged in. Please login first.');
      return;
    }

    setIsSettingUp(true);
    setSetupError(null);

    try {
      const success = await completeAdminSetup(user.uid);
      
      if (success) {
        setSetupComplete(true);
      } else {
        setSetupError('Setup failed. Check console for details.');
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      setSetupError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSettingUp(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Setup</CardTitle>
            <CardDescription className="text-center">
              Please login first to set up admin access
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Settings className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin System Setup</CardTitle>
          <CardDescription>
            Initialize the admin system with default configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!setupComplete && !setupError && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What this setup will do:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make you an admin user</li>
                  <li>• Create default position rates (Sales Executive, Manager, etc.)</li>
                  <li>• Set up system configuration</li>
                  <li>• Enable admin dashboard access</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Important:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Run this only once for initial setup</li>
                  <li>• Make sure you're logged in as the intended admin user</li>
                  <li>• Your user ID: <code className="bg-yellow-100 px-1 rounded">{user.uid}</code></li>
                </ul>
              </div>
            </div>
          )}

          {setupError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {setupError}
              </AlertDescription>
            </Alert>
          )}

          {setupComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Admin setup completed successfully! You can now access the admin dashboard.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            {!setupComplete && (
              <Button 
                onClick={handleSetupAdmin}
                disabled={isSettingUp}
                size="lg"
                className="w-full max-w-sm"
              >
                {isSettingUp ? 'Setting up...' : 'Setup Admin System'}
              </Button>
            )}
            
            {setupComplete && (
              <Button 
                onClick={() => window.location.href = '/admin'}
                size="lg"
                className="w-full max-w-sm"
              >
                Go to Admin Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
