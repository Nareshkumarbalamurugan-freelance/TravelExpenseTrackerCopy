import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { testFirebaseConnection } from '@/utils/firebaseTestUtils';
import { searchPlaces, getAddressFromCoordinates } from '@/lib/mapboxService';
import { useAuth } from '@/context/AuthContext';

interface ServiceStatus {
  firebase: {
    connected: boolean;
    testing: boolean;
    stats?: { trips: number; activeSessions: number };
    error?: string;
  };
  mapApi: {
    connected: boolean;
    testing: boolean;
    error?: string;
  };
}

const SystemStatusCard: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ServiceStatus>({
    firebase: { connected: false, testing: false },
    mapApi: { connected: false, testing: false }
  });

  useEffect(() => {
    if (user) {
      testAllServices();
    }
  }, [user]);

  const testAllServices = async () => {
    // Test Firebase
    await testFirebaseService();
    // Test Map API
    await testMapService();
  };

  const testFirebaseService = async () => {
    setStatus(prev => ({
      ...prev,
      firebase: { ...prev.firebase, testing: true }
    }));

    const result = await testFirebaseConnection();
    
    setStatus(prev => ({
      ...prev,
      firebase: {
        connected: result.success,
        testing: false,
        stats: result.stats,
        error: result.error
      }
    }));
  };

  const testMapService = async () => {
    setStatus(prev => ({
      ...prev,
      mapApi: { ...prev.mapApi, testing: true }
    }));

    try {
      // Test search functionality
      const searchResult = await searchPlaces('Chennai');

      // Test reverse geocoding
      const addressResult = await getAddressFromCoordinates(13.0827, 80.2707);

      setStatus(prev => ({
        ...prev,
        mapApi: {
          connected: searchResult.suggestions.length > 0,
          testing: false,
          error: searchResult.error
        }
      }));
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        mapApi: {
          connected: false,
          testing: false,
          error: error.message
        }
      }));
    }
  };

  const getStatusIcon = (connected: boolean, testing: boolean) => {
    if (testing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (connected) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (connected: boolean, testing: boolean, label: string) => {
    if (testing) return <Badge variant="outline">Testing...</Badge>;
    if (connected) return <Badge variant="default">{label} Connected</Badge>;
    return <Badge variant="destructive">{label} Error</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </span>
          <Button onClick={testAllServices} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Firebase Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.firebase.connected, status.firebase.testing)}
              <span className="font-medium">Firebase Database</span>
            </div>
            {getStatusBadge(status.firebase.connected, status.firebase.testing, 'Firebase')}
          </div>
          
          {status.firebase.connected && status.firebase.stats && (
            <div className="ml-6 text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-4">
                <div>Trips: {status.firebase.stats.trips}</div>
                <div>Active Sessions: {status.firebase.stats.activeSessions}</div>
              </div>
            </div>
          )}
          
          {status.firebase.error && (
            <div className="ml-6 text-sm text-red-600">
              Error: {status.firebase.error}
            </div>
          )}
        </div>

        {/* Map API Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.mapApi.connected, status.mapApi.testing)}
              <span className="font-medium">Map Services</span>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(status.mapApi.connected, status.mapApi.testing, 'Maps')}
            </div>
          </div>
          
          <div className="ml-6 text-sm text-muted-foreground">
            <div className="text-green-600">
              Using Mapbox API services for location data.
            </div>
          </div>
          
          {status.mapApi.error && (
            <div className="ml-6 text-sm text-red-600">
              Error: {status.mapApi.error}
            </div>
          )}
        </div>

        {/* Environment Info */}
        <div className="pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span>{import.meta.env.DEV ? 'Development' : 'Production'}</span>
            </div>
            <div className="flex justify-between">
              <span>Force Real API:</span>
              <span>{import.meta.env.VITE_FORCE_REAL_MAP_API === 'true' ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-xs">{user?.uid || 'Not authenticated'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
