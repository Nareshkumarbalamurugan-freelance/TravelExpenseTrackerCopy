// Location Debug Utilities
// This file helps debug location accuracy issues

export interface LocationDebugInfo {
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  source: 'GPS' | 'CACHE' | 'DEFAULT';
  userAgent: string;
  ipLocation?: {
    estimated: boolean;
    coordinates?: { lat: number; lng: number };
  };
}

/**
 * Clear browser location cache to force fresh GPS reading
 */
export const clearLocationCache = (): void => {
  try {
    // Clear geolocation permission and cached data
    if ('permissions' in navigator) {
      navigator.permissions.query({name: 'geolocation'}).then(result => {
        console.log('Current geolocation permission:', result.state);
      });
    }
    
    // Clear localStorage location data if any
    localStorage.removeItem('lastKnownLocation');
    localStorage.removeItem('cachedUserLocation');
    
    console.log('Location cache cleared. Please refresh and re-grant location permission if needed.');
  } catch (error) {
    console.warn('Could not clear location cache:', error);
  }
};

/**
 * Get detailed location debug information
 */
export const getLocationDebugInfo = (): Promise<LocationDebugInfo> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        timestamp: new Date().toISOString(),
        coordinates: { latitude: 0, longitude: 0 },
        source: 'DEFAULT',
        userAgent: navigator.userAgent,
        ipLocation: { estimated: true }
      });
      return;
    }

    // Force fresh GPS reading with no cache
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const debugInfo: LocationDebugInfo = {
          timestamp: new Date().toISOString(),
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          source: 'GPS',
          userAgent: navigator.userAgent
        };
        
        console.log('🎯 Location Debug Info:', {
          coordinates: `${position.coords.latitude}, ${position.coords.longitude}`,
          accuracy: `${position.coords.accuracy}m`,
          timestamp: debugInfo.timestamp,
          'Suspected Issue': position.coords.accuracy > 10000 ? 'Very low accuracy - might be IP-based' : 'Good accuracy'
        });
        
        resolve(debugInfo);
      },
      (error) => {
        console.error('GPS error:', error.message);
        resolve({
          timestamp: new Date().toISOString(),
          coordinates: { latitude: 0, longitude: 0 },
          source: 'DEFAULT',
          userAgent: navigator.userAgent,
          ipLocation: { estimated: true }
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh reading, no cache
      }
    );
  });
};

/**
 * Test if coordinates are in Chennai area
 */
export const isChennaiCoordinates = (lat: number, lng: number): boolean => {
  // Chennai bounding box (approximate)
  const chennaiBounds = {
    north: 13.25,
    south: 12.8,
    east: 80.35,
    west: 80.1
  };
  
  return (
    lat >= chennaiBounds.south && 
    lat <= chennaiBounds.north && 
    lng >= chennaiBounds.west && 
    lng <= chennaiBounds.east
  );
};

/**
 * Display location debug information to user
 */
export const displayLocationDebug = async (): Promise<void> => {
  const debugInfo = await getLocationDebugInfo();
  
  const isInChennai = isChennaiCoordinates(
    debugInfo.coordinates.latitude, 
    debugInfo.coordinates.longitude
  );
  
  console.group('📍 Location Debug Report');
  console.log('Coordinates:', `${debugInfo.coordinates.latitude}, ${debugInfo.coordinates.longitude}`);
  console.log('Accuracy:', debugInfo.coordinates.accuracy ? `${debugInfo.coordinates.accuracy}m` : 'Unknown');
  console.log('Source:', debugInfo.source);
  console.log('In Chennai area:', isInChennai ? '⚠️ YES (might be incorrect)' : '✅ NO');
  console.log('Timestamp:', debugInfo.timestamp);
  
  if (isInChennai && debugInfo.coordinates.accuracy && debugInfo.coordinates.accuracy > 5000) {
    console.warn('🚨 POSSIBLE ISSUE: Showing Chennai coordinates with low accuracy. This might be IP-based location instead of GPS.');
    console.log('💡 Try:');
    console.log('1. Clear browser location permissions and re-grant');
    console.log('2. Ensure GPS/location services are enabled on device');
    console.log('3. Check if VPN is routing through Chennai');
    console.log('4. Try in a different browser');
  }
  
  console.groupEnd();
  
  return;
};
