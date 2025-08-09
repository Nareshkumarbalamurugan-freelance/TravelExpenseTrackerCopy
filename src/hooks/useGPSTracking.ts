import { useState, useEffect, useRef, useCallback } from 'react';
import { GPSPoint } from '@/lib/tripSession';

interface GPSTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  trackingInterval?: number; // milliseconds
  minDistanceThreshold?: number; // meters
}

interface GPSTrackingState {
  isTracking: boolean;
  currentLocation: GPSPoint | null;
  error: string | null;
  accuracy: number | null;
  lastUpdate: Date | null;
}

const DEFAULT_OPTIONS: GPSTrackingOptions = {
  enableHighAccuracy: true,
  timeout: 20000, // Longer timeout for better accuracy
  maximumAge: 0, // NO CACHE - always get fresh location
  trackingInterval: 15000, // 15 seconds for real-time tracking
  minDistanceThreshold: 5 // 5 meters for precise tracking
};

export const useGPSTracking = (
  options: GPSTrackingOptions = DEFAULT_OPTIONS,
  onLocationUpdate?: (gpsPoint: GPSPoint) => void
) => {
  const [state, setState] = useState<GPSTrackingState>({
    isTracking: false,
    currentLocation: null,
    error: null,
    accuracy: null,
    lastUpdate: null
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<GPSPoint | null>(null);
  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options });

  // Calculate distance between two GPS points
  const calculateDistance = useCallback((
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Handle successful location update
  const handleLocationSuccess = useCallback((position: GeolocationPosition) => {
    const newGPSPoint: GPSPoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: new Date(),
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined
    };

    // Check if we should update based on distance threshold
    let shouldUpdate = true;
    if (lastLocationRef.current && optionsRef.current.minDistanceThreshold) {
      const distance = calculateDistance(
        lastLocationRef.current.latitude,
        lastLocationRef.current.longitude,
        newGPSPoint.latitude,
        newGPSPoint.longitude
      );
      
      shouldUpdate = distance >= optionsRef.current.minDistanceThreshold;
    }

    if (shouldUpdate) {
      lastLocationRef.current = newGPSPoint;
      
      setState(prev => ({
        ...prev,
        currentLocation: newGPSPoint,
        accuracy: position.coords.accuracy,
        lastUpdate: new Date(),
        error: null
      }));

      // Call the callback if provided
      if (onLocationUpdate) {
        onLocationUpdate(newGPSPoint);
      }
    }
  }, [calculateDistance, onLocationUpdate]);

  // Handle location error
  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown location error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timeout';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage
    }));
  }, []);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isTracking: true,
      error: null
    }));

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      {
        enableHighAccuracy: optionsRef.current.enableHighAccuracy,
        timeout: optionsRef.current.timeout,
        maximumAge: optionsRef.current.maximumAge
      }
    );

    // Set up continuous tracking
    if (optionsRef.current.trackingInterval) {
      intervalIdRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          handleLocationSuccess,
          handleLocationError,
          {
            enableHighAccuracy: optionsRef.current.enableHighAccuracy,
            timeout: optionsRef.current.timeout,
            maximumAge: optionsRef.current.maximumAge
          }
        );
      }, optionsRef.current.trackingInterval);
    } else {
      // Use watchPosition for continuous tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleLocationSuccess,
        handleLocationError,
        {
          enableHighAccuracy: optionsRef.current.enableHighAccuracy,
          timeout: optionsRef.current.timeout,
          maximumAge: optionsRef.current.maximumAge
        }
      );
    }
  }, [handleLocationSuccess, handleLocationError]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTracking: false
    }));

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // Get current location once
  const getCurrentLocation = useCallback((): Promise<GPSPoint> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsPoint: GPSPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined
          };
          resolve(gpsPoint);
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: optionsRef.current.enableHighAccuracy,
          timeout: optionsRef.current.timeout,
          maximumAge: optionsRef.current.maximumAge
        }
      );
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentLocation
  };
};

export default useGPSTracking;
