// Enhanced location service with precise GPS and automatic cache clearing
export interface PreciseLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  isHighAccuracy: boolean;
}

/**
 * Get precise GPS location with automatic cache clearing and multiple retry attempts
 */
export const getPreciseLocation = async (): Promise<{
  location: PreciseLocation | null;
  error: string | null;
}> => {
  console.log('🎯 Getting precise location with cache clearing...');
  
  if (!navigator.geolocation) {
    return { 
      location: null, 
      error: "GPS not supported by this browser" 
    };
  }

  // Clear any existing location cache
  await clearLocationCache();

  try {
    // Try multiple GPS attempts with different configurations
    const location = await attemptPreciseGPS();
    
    if (location && location.accuracy < 50) {
      console.log('✅ High precision GPS obtained:', {
        coordinates: `${location.latitude}, ${location.longitude}`,
        accuracy: `${location.accuracy}m`,
        quality: 'Excellent'
      });
      return { location, error: null };
    }

    if (location && location.accuracy < 200) {
      console.log('✅ Good precision GPS obtained:', {
        coordinates: `${location.latitude}, ${location.longitude}`,
        accuracy: `${location.accuracy}m`,
        quality: 'Good'
      });
      return { location, error: null };
    }

    if (location) {
      console.log('⚠️ Low precision GPS:', {
        coordinates: `${location.latitude}, ${location.longitude}`,
        accuracy: `${location.accuracy}m`,
        quality: 'Poor - trying again...'
      });
      
      // Try once more with different settings
      const retryLocation = await attemptPreciseGPS(true);
      return { 
        location: retryLocation || location, 
        error: retryLocation ? null : 'Low accuracy location obtained' 
      };
    }

    return { location: null, error: 'Failed to get GPS location' };

  } catch (error: any) {
    console.error('Precise location error:', error);
    return { 
      location: null, 
      error: error.message || 'Unknown GPS error' 
    };
  }
};

/**
 * Clear browser location cache by requesting location with maximumAge: 0
 */
const clearLocationCache = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve();
      return;
    }

    // Quick dummy request to clear cache
    navigator.geolocation.getCurrentPosition(
      () => resolve(),
      () => resolve(),
      { 
        enableHighAccuracy: false,
        timeout: 1000,
        maximumAge: 0 // Force cache clear
      }
    );
    
    // Resolve after short delay regardless
    setTimeout(resolve, 500);
  });
};

/**
 * Attempt to get precise GPS with multiple configurations
 */
const attemptPreciseGPS = (isRetry = false): Promise<PreciseLocation | null> => {
  return new Promise((resolve) => {
    const timeout = isRetry ? 30000 : 20000; // Longer timeout for retry
    let resolved = false;

    const resolveOnce = (location: PreciseLocation | null) => {
      if (!resolved) {
        resolved = true;
        resolve(location);
      }
    };

    // Primary attempt - High accuracy, no cache
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: PreciseLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 999999,
          timestamp: Date.now(),
          isHighAccuracy: position.coords.accuracy < 100
        };

        console.log('📍 GPS attempt result:', {
          coordinates: `${location.latitude}, ${location.longitude}`,
          accuracy: `${location.accuracy}m`,
          speed: position.coords.speed ? `${position.coords.speed}m/s` : 'N/A',
          heading: position.coords.heading || 'N/A',
          timestamp: new Date(position.timestamp).toISOString()
        });

        resolveOnce(location);
      },
      (error) => {
        console.warn('GPS attempt failed:', {
          code: error.code,
          message: error.message,
          isRetry: isRetry
        });

        if (!isRetry) {
          // Fallback attempt with relaxed settings
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location: PreciseLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy || 999999,
                timestamp: Date.now(),
                isHighAccuracy: false
              };
              
              console.log('📍 Fallback GPS result:', {
                coordinates: `${location.latitude}, ${location.longitude}`,
                accuracy: `${location.accuracy}m`,
                quality: 'Fallback'
              });

              resolveOnce(location);
            },
            () => resolveOnce(null),
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 0
            }
          );
        } else {
          resolveOnce(null);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 0 // Always get fresh location
      }
    );
  });
};

/**
 * Force GPS refresh by requesting location multiple times
 */
export const forceGPSRefresh = async (): Promise<void> => {
  console.log('🔄 Forcing GPS refresh...');
  
  // Multiple rapid requests to force GPS to get better fix
  for (let i = 0; i < 3; i++) {
    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(),
          () => resolve(),
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // Ignore errors during refresh
    }
  }
  
  console.log('✅ GPS refresh complete');
};
