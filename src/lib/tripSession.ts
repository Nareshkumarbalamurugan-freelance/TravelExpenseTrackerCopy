import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Location } from "./mapboxService";
import { calculateExpenseAmount } from "./expenseCalculator";

// Trip session interfaces
export interface TripSession {
  id?: string;
  userId: string;
  startTime: Date;
  startLocation: Location;
  endTime?: Date;
  endLocation?: Location;
  gpsTrackingPoints: GPSPoint[];
  dealerVisits: DealerVisit[];
  totalDistance?: number;
  totalExpense?: number;
  status: 'active' | 'completed' | 'paused';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number;
}

export interface DealerVisit {
  id: string;
  tripId: string;
  location: Location;
  timestamp: Date;
  dealerName?: string;
  visitPhoto?: string;
  notes?: string;
  visitDuration?: number; // in minutes
}

export interface EmployeePosition {
  position: string;
  perKmRate: number;
  dailyAllowance: number;
  maxDailyExpense: number;
}

// Predefined position rates
export const POSITION_RATES: Record<string, EmployeePosition> = {
  'Sales Executive': { 
    position: 'Sales Executive',
    perKmRate: 12, 
    dailyAllowance: 500,
    maxDailyExpense: 2000
  },
  'Senior Executive': { 
    position: 'Senior Executive',
    perKmRate: 15, 
    dailyAllowance: 750,
    maxDailyExpense: 2500
  },
  'Manager': { 
    position: 'Manager',
    perKmRate: 18, 
    dailyAllowance: 1000,
    maxDailyExpense: 3000
  },
  'Regional Manager': { 
    position: 'Regional Manager',
    perKmRate: 22, 
    dailyAllowance: 1500,
    maxDailyExpense: 4000
  }
};

/**
 * Start a new trip session
 */
export const startTripSession = async (
  userId: string, 
  startLocation: Location
): Promise<{ sessionId: string | null; error: string | null }> => {
  try {
    const tripSession: Omit<TripSession, 'id'> = {
      userId,
      startTime: new Date(),
      startLocation,
      gpsTrackingPoints: [{
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
        timestamp: new Date(),
      }],
      dealerVisits: [],
      status: 'active',
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    };

    const docRef = await addDoc(collection(db, "activeSessions"), tripSession);
    return { sessionId: docRef.id, error: null };
  } catch (error: any) {
    return { sessionId: null, error: error.message };
  }
};

/**
 * End an active trip session
 */
export const endTripSession = async (
  sessionId: string,
  endLocation: Location,
  totalDistance: number,
  employeePosition: string
): Promise<{ error: string | null }> => {
  try {
    const sessionRef = doc(db, "activeSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      return { error: "Trip session not found" };
    }
    const sessionData = sessionDoc.data() as TripSession;

    // Use admin-configurable rate calculation (with fallback)
    const totalExpense = await calculateExpenseAmount(totalDistance, employeePosition);

    // Update session as completed
    await updateDoc(sessionRef, {
      endTime: new Date(),
      endLocation,
      totalDistance,
      totalExpense,
      status: 'completed',
      updatedAt: serverTimestamp()
    });

    // Move to completed trips collection
    const completedTrip = {
      ...sessionData,
      id: sessionId,
      endTime: new Date(),
      endLocation,
      totalDistance,
      totalExpense,
      status: 'completed'
    };

    await addDoc(collection(db, "completedTrips"), completedTrip);

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Add GPS tracking point to active session
 */
export const addGPSPoint = async (
  sessionId: string,
  gpsPoint: GPSPoint
): Promise<{ error: string | null }> => {
  try {
    const sessionRef = doc(db, "activeSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return { error: "Trip session not found" };
    }

    const sessionData = sessionDoc.data() as TripSession;
    const updatedPoints = [...sessionData.gpsTrackingPoints, gpsPoint];

    await updateDoc(sessionRef, {
      gpsTrackingPoints: updatedPoints,
      updatedAt: serverTimestamp()
    });

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Add dealer visit to active session
 */
export const addDealerVisit = async (
  sessionId: string,
  dealerVisit: Omit<DealerVisit, 'id' | 'tripId'>
): Promise<{ visitId: string | null; error: string | null }> => {
  try {
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullDealerVisit: DealerVisit = {
      ...dealerVisit,
      id: visitId,
      tripId: sessionId
    };

    const sessionRef = doc(db, "activeSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return { visitId: null, error: "Trip session not found" };
    }

    const sessionData = sessionDoc.data() as TripSession;
    const updatedVisits = [...sessionData.dealerVisits, fullDealerVisit];

    await updateDoc(sessionRef, {
      dealerVisits: updatedVisits,
      updatedAt: serverTimestamp()
    });

    return { visitId, error: null };
  } catch (error: any) {
    return { visitId: null, error: error.message };
  }
};

/**
 * Get active trip session for user
 */
export const getActiveSession = async (
  userId: string
): Promise<{ session: TripSession | null; error: string | null }> => {
  try {
    const q = query(
      collection(db, "activeSessions"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { session: null, error: null };
    }

    const doc = querySnapshot.docs[0];
    const session = { id: doc.id, ...doc.data() } as TripSession;
    
    return { session, error: null };
  } catch (error: any) {
    return { session: null, error: error.message };
  }
};

/**
 * Get completed trips for user
 */
export const getCompletedTrips = async (
  userId: string,
  limit: number = 10
): Promise<{ trips: TripSession[]; error: string | null }> => {
  try {
    const q = query(
      collection(db, "completedTrips"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TripSession[];
    
    return { trips, error: null };
  } catch (error: any) {
    return { trips: [], error: error.message };
  }
};

/**
 * Calculate distance between GPS points using Haversine formula
 */
export const calculateTotalDistance = (gpsPoints: GPSPoint[]): number => {
  if (gpsPoints.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 1; i < gpsPoints.length; i++) {
    const distance = haversineDistance(
      gpsPoints[i - 1].latitude,
      gpsPoints[i - 1].longitude,
      gpsPoints[i].latitude,
      gpsPoints[i].longitude
    );
    totalDistance += distance;
  }

  return totalDistance;
};

/**
 * Haversine formula to calculate distance between two GPS points
 */
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Real-time listener for active session updates
 */
export const subscribeToActiveSession = (
  userId: string,
  callback: (session: TripSession | null) => void
) => {
  const q = query(
    collection(db, "activeSessions"),
    where("userId", "==", userId),
    where("status", "==", "active")
  );

  return onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
      callback(null);
    } else {
      const doc = querySnapshot.docs[0];
      const session = { id: doc.id, ...doc.data() } as TripSession;
      callback(session);
    }
  });
};
