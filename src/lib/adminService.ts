import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { TripSession, EmployeePosition } from "./tripSession";

// Re-export for convenience
export type { EmployeePosition } from "./tripSession";

// Enhanced interfaces for admin
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  position: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  totalTrips: number;
  totalDistance: number;
  totalExpenses: number;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  trips: number;
  distance: number;
  expenses: number;
}

export interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTripsToday: number;
  totalTripsThisMonth: number;
  totalDistanceThisMonth: number;
  totalExpensesThisMonth: number;
  topPerformers: TopPerformer[];
  recentTrips: TripSession[];
}

export interface TopPerformer {
  userId: string;
  name: string;
  position: string;
  trips: number;
  distance: number;
  expenses: number;
}

export interface SystemSettings {
  id?: string;
  maxDailyDistance: number;
  maxMonthlyExpense: number;
  requirePhotoForVisits: boolean;
  autoApprovalLimit: number;
  defaultPositions: EmployeePosition[];
  companyName: string;
  adminEmails: string[];
  updatedAt: Date;
}

/**
 * Get all users with their trip statistics
 */
export const getAllUsersWithStats = async (): Promise<AdminUser[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: AdminUser[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Get user's trip statistics
      const tripsQuery = query(
        collection(db, 'tripSessions'),
        where('userId', '==', userDoc.id),
        where('status', '==', 'completed')
      );
      
      const tripsSnapshot = await getDocs(tripsQuery);
      let totalDistance = 0;
      let totalExpenses = 0;
      const monthlyStatsMap = new Map<string, MonthlyStats>();

      tripsSnapshot.docs.forEach(tripDoc => {
        const trip = tripDoc.data() as TripSession;
        totalDistance += trip.totalDistance || 0;
        totalExpenses += trip.totalExpense || 0;

        // Calculate monthly stats
        const tripDate = trip.startTime instanceof Timestamp 
          ? trip.startTime.toDate() 
          : new Date(trip.startTime);
        const monthKey = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyStatsMap.has(monthKey)) {
          monthlyStatsMap.set(monthKey, {
            month: monthKey,
            trips: 0,
            distance: 0,
            expenses: 0
          });
        }
        
        const monthStats = monthlyStatsMap.get(monthKey)!;
        monthStats.trips += 1;
        monthStats.distance += trip.totalDistance || 0;
        monthStats.expenses += trip.totalExpense || 0;
      });

      users.push({
        id: userDoc.id,
        email: userData.email || '',
        name: userData.name || userData.email?.split('@')[0] || 'Unknown',
        position: userData.position || 'Sales Executive',
        isActive: userData.isActive !== false,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate(),
        totalTrips: tripsSnapshot.docs.length,
        totalDistance,
        totalExpenses,
        monthlyStats: Array.from(monthlyStatsMap.values()).sort((a, b) => b.month.localeCompare(a.month))
      });
    }

    return users.sort((a, b) => b.totalTrips - a.totalTrips);
  } catch (error) {
    console.error('Error fetching users with stats:', error);
    throw error;
  }
};

/**
 * Get comprehensive admin dashboard statistics
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalEmployees = usersSnapshot.docs.length;
    const activeEmployees = usersSnapshot.docs.filter(doc => 
      doc.data().isActive !== false
    ).length;

    // Get today's trips
    const todayTripsQuery = query(
      collection(db, 'tripSessions'),
      where('startTime', '>=', Timestamp.fromDate(startOfToday))
    );
    const todayTripsSnapshot = await getDocs(todayTripsQuery);

    // Get this month's completed trips
    const monthTripsQuery = query(
      collection(db, 'tripSessions'),
      where('startTime', '>=', Timestamp.fromDate(startOfMonth)),
      where('status', '==', 'completed')
    );
    const monthTripsSnapshot = await getDocs(monthTripsQuery);

    let totalDistanceThisMonth = 0;
    let totalExpensesThisMonth = 0;
    const userStatsMap = new Map<string, TopPerformer>();

    // Calculate monthly totals and user performance
    for (const tripDoc of monthTripsSnapshot.docs) {
      const trip = tripDoc.data() as TripSession;
      totalDistanceThisMonth += trip.totalDistance || 0;
      totalExpensesThisMonth += trip.totalExpense || 0;

      // Update user performance stats
      if (!userStatsMap.has(trip.userId)) {
        const userDoc = await getDoc(doc(db, 'users', trip.userId));
        const userData = userDoc.data();
        userStatsMap.set(trip.userId, {
          userId: trip.userId,
          name: userData?.name || userData?.email?.split('@')[0] || 'Unknown',
          position: userData?.position || 'Sales Executive',
          trips: 0,
          distance: 0,
          expenses: 0
        });
      }

      const userStats = userStatsMap.get(trip.userId)!;
      userStats.trips += 1;
      userStats.distance += trip.totalDistance || 0;
      userStats.expenses += trip.totalExpense || 0;
    }

    // Get top performers
    const topPerformers = Array.from(userStatsMap.values())
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 5);

    // Get recent trips
    const recentTripsQuery = query(
      collection(db, 'tripSessions'),
      orderBy('startTime', 'desc'),
      limit(10)
    );
    const recentTripsSnapshot = await getDocs(recentTripsQuery);
    const recentTrips = recentTripsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TripSession[];

    return {
      totalEmployees,
      activeEmployees,
      totalTripsToday: todayTripsSnapshot.docs.length,
      totalTripsThisMonth: monthTripsSnapshot.docs.length,
      totalDistanceThisMonth,
      totalExpensesThisMonth,
      topPerformers,
      recentTrips
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Get system settings
 */
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'admin', 'settings'));
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        id: settingsDoc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as SystemSettings;
    }

    // Return default settings if none exist
    return {
      maxDailyDistance: 500,
      maxMonthlyExpense: 50000,
      requirePhotoForVisits: true,
      autoApprovalLimit: 1000,
      defaultPositions: [
        { position: 'Sales Executive', perKmRate: 12, dailyAllowance: 500, maxDailyExpense: 2000 },
        { position: 'Senior Executive', perKmRate: 15, dailyAllowance: 750, maxDailyExpense: 2500 },
        { position: 'Manager', perKmRate: 18, dailyAllowance: 1000, maxDailyExpense: 3000 },
        { position: 'Regional Manager', perKmRate: 22, dailyAllowance: 1500, maxDailyExpense: 4000 }
      ],
      companyName: 'Poultry Mitra',
      adminEmails: ['admin@poultrymitra.com'],
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'admin', 'settings');
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

/**
 * Add a new position with rates
 */
export const addPositionRate = async (position: EmployeePosition): Promise<void> => {
  try {
    await addDoc(collection(db, 'positionRates'), {
      ...position,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding position rate:', error);
    throw error;
  }
};

/**
 * Update position rates
 */
export const updatePositionRate = async (id: string, position: Partial<EmployeePosition>): Promise<void> => {
  try {
    const positionRef = doc(db, 'positionRates', id);
    await updateDoc(positionRef, {
      ...position,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating position rate:', error);
    throw error;
  }
};

/**
 * Delete position rate
 */
export const deletePositionRate = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'positionRates', id));
  } catch (error) {
    console.error('Error deleting position rate:', error);
    throw error;
  }
};

/**
 * Update user position and status
 */
export const updateUserAdmin = async (userId: string, updates: {
  position?: string;
  isActive?: boolean;
  name?: string;
}): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Get detailed trip analytics for a specific period
 */
export const getTripAnalytics = async (startDate: Date, endDate: Date) => {
  try {
    const tripsQuery = query(
      collection(db, 'tripSessions'),
      where('startTime', '>=', Timestamp.fromDate(startDate)),
      where('startTime', '<=', Timestamp.fromDate(endDate)),
      where('status', '==', 'completed')
    );

    const tripsSnapshot = await getDocs(tripsQuery);
    const analytics = {
      totalTrips: tripsSnapshot.docs.length,
      totalDistance: 0,
      totalExpenses: 0,
      averageDistance: 0,
      averageExpense: 0,
      tripsByPosition: new Map<string, number>(),
      dailyBreakdown: new Map<string, { trips: number; distance: number; expenses: number }>()
    };

    tripsSnapshot.docs.forEach(doc => {
      const trip = doc.data() as TripSession;
      analytics.totalDistance += trip.totalDistance || 0;
      analytics.totalExpenses += trip.totalExpense || 0;

      // Group by user position
      const userPosition = 'Sales Executive'; // You'd get this from user data
      analytics.tripsByPosition.set(
        userPosition,
        (analytics.tripsByPosition.get(userPosition) || 0) + 1
      );

      // Daily breakdown
      const tripDate = trip.startTime instanceof Timestamp 
        ? trip.startTime.toDate() 
        : new Date(trip.startTime);
      const dateKey = tripDate.toISOString().split('T')[0];
      
      if (!analytics.dailyBreakdown.has(dateKey)) {
        analytics.dailyBreakdown.set(dateKey, { trips: 0, distance: 0, expenses: 0 });
      }
      
      const dayStats = analytics.dailyBreakdown.get(dateKey)!;
      dayStats.trips += 1;
      dayStats.distance += trip.totalDistance || 0;
      dayStats.expenses += trip.totalExpense || 0;
    });

    analytics.averageDistance = analytics.totalDistance / analytics.totalTrips || 0;
    analytics.averageExpense = analytics.totalExpenses / analytics.totalTrips || 0;

    return analytics;
  } catch (error) {
    console.error('Error getting trip analytics:', error);
    throw error;
  }
};

/**
 * Export trip data for a specific period
 */
export const exportTripData = async (startDate: Date, endDate: Date, format: 'csv' | 'json' = 'csv') => {
  try {
    const users = await getAllUsersWithStats();
    const userMap = new Map(users.map(u => [u.id, u]));

    const tripsQuery = query(
      collection(db, 'tripSessions'),
      where('startTime', '>=', Timestamp.fromDate(startDate)),
      where('startTime', '<=', Timestamp.fromDate(endDate)),
      orderBy('startTime', 'desc')
    );

    const tripsSnapshot = await getDocs(tripsQuery);
    const tripData = tripsSnapshot.docs.map(doc => {
      const trip = doc.data() as TripSession;
      const user = userMap.get(trip.userId);
      
      return {
        tripId: doc.id,
        employeeName: user?.name || 'Unknown',
        employeeEmail: user?.email || '',
        position: user?.position || '',
        startTime: trip.startTime instanceof Timestamp ? trip.startTime.toDate().toISOString() : trip.startTime,
        endTime: trip.endTime instanceof Timestamp ? trip.endTime?.toDate().toISOString() : trip.endTime,
        distance: trip.totalDistance || 0,
        expense: trip.totalExpense || 0,
        status: trip.status,
        dealerVisits: trip.dealerVisits?.length || 0,
        gpsPoints: trip.gpsTrackingPoints?.length || 0
      };
    });

    if (format === 'csv') {
      const headers = Object.keys(tripData[0] || {});
      const csvContent = [
        headers.join(','),
        ...tripData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');
      
      return csvContent;
    }

    return JSON.stringify(tripData, null, 2);
  } catch (error) {
    console.error('Error exporting trip data:', error);
    throw error;
  }
};
