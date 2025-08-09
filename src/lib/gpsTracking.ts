// GPS-based distance tracking system
// This replaces hardcoded distance calculations with real GPS tracking

import { getCurrentLocation, getCurrentLocationWithAddress, calculateHaversineDistance, Location } from './mapboxService';

export interface GPSTrackingPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface DistanceTrackingSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  trackingPoints: GPSTrackingPoint[];
  totalDistance: number;
  isActive: boolean;
}

// Store for tracking sessions
let currentSession: DistanceTrackingSession | null = null;
let trackingInterval: NodeJS.Timeout | null = null;

/**
 * Start GPS distance tracking
 */
export const startDistanceTracking = async (): Promise<{ success: boolean; error?: string }> => {
  if (currentSession?.isActive) {
    return { success: false, error: 'Tracking session already active' };
  }

  try {
    const { location, error } = await getCurrentLocation();
    if (!location) {
      return { success: false, error: error || 'Failed to get current location' };
    }

    currentSession = {
      sessionId: Date.now().toString(),
      startTime: Date.now(),
      trackingPoints: [{
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      }],
      totalDistance: 0,
      isActive: true
    };

    // Start periodic tracking (every 30 seconds)
    trackingInterval = setInterval(async () => {
      await addTrackingPoint();
    }, 30000);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Stop GPS distance tracking
 */
export const stopDistanceTracking = (): { totalDistance: number; duration: number } => {
  if (!currentSession) {
    return { totalDistance: 0, duration: 0 };
  }

  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  currentSession.endTime = Date.now();
  currentSession.isActive = false;

  const totalDistance = currentSession.totalDistance;
  const duration = currentSession.endTime - currentSession.startTime;

  // Clear session
  currentSession = null;

  return { totalDistance, duration };
};

/**
 * Add a new tracking point and calculate distance
 */
const addTrackingPoint = async (): Promise<void> => {
  if (!currentSession?.isActive) return;

  try {
    const { location, error } = await getCurrentLocation();
    if (!location) {
      console.warn('Failed to get location for tracking:', error);
      return;
    }

    const newPoint: GPSTrackingPoint = {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: Date.now()
    };

    // Calculate distance from last point
    const lastPoint = currentSession.trackingPoints[currentSession.trackingPoints.length - 1];
    if (lastPoint) {
      const distance = calculateHaversineDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      // Only add distance if movement is significant (more than 10 meters)
      // This helps filter out GPS noise
      if (distance > 10) {
        currentSession.totalDistance += distance;
      }
    }

    currentSession.trackingPoints.push(newPoint);
  } catch (error) {
    console.warn('Error adding tracking point:', error);
  }
};

/**
 * Get current tracking session status
 */
export const getTrackingStatus = (): {
  isActive: boolean;
  currentDistance: number;
  duration: number;
  lastLocation?: { latitude: number; longitude: number };
} => {
  if (!currentSession) {
    return {
      isActive: false,
      currentDistance: 0,
      duration: 0
    };
  }

  const duration = Date.now() - currentSession.startTime;
  const lastPoint = currentSession.trackingPoints[currentSession.trackingPoints.length - 1];

  return {
    isActive: currentSession.isActive,
    currentDistance: currentSession.totalDistance,
    duration,
    lastLocation: lastPoint ? {
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude
    } : undefined
  };
};

/**
 * Manually add a dealer visit location with accurate address
 */
export const addDealerVisit = async (dealerName: string): Promise<{ success: boolean; location?: Location; error?: string }> => {
  try {
    const { location, error } = await getCurrentLocationWithAddress();
    if (!location) {
      return { success: false, error: error || 'Failed to get current location' };
    }

    console.log(`Dealer visit recorded: ${dealerName} at ${location.address}`);

    // If tracking is active, add this as a significant point
    if (currentSession?.isActive) {
      await addTrackingPoint();
    }

    return { success: true, location };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Convert meters to kilometers with proper formatting
 */
export const formatDistance = (distanceInMeters: number): string => {
  const km = distanceInMeters / 1000;
  return `${km.toFixed(1)} km`;
};

/**
 * Convert milliseconds to readable duration
 */
export const formatDuration = (durationInMs: number): string => {
  const hours = Math.floor(durationInMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
