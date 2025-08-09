// Admin Context for managing system configuration and user roles
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Position levels and their rates (per km + daily allowance)
export interface PositionRate {
  id: string;
  name: string;
  ratePerKm: number;
  dailyAllowance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// System configuration
export interface SystemConfig {
  id: string;
  companyName: string;
  maxDailyDistance: number;
  maxDealerVisits: number;
  trackingInterval: number; // seconds
  minLocationAccuracy: number; // meters
  isMaintenanceMode: boolean;
  updatedAt: string;
  updatedBy: string;
}

// Admin statistics
export interface AdminStats {
  totalUsers: number;
  activeTrips: number;
  totalTripsToday: number;
  totalDistanceToday: number;
  totalExpenseToday: number;
  averageAccuracy: number;
}

interface AdminContextType {
  isAdmin: boolean;
  positionRates: PositionRate[];
  systemConfig: SystemConfig | null;
  adminStats: AdminStats | null;
  loading: boolean;
  // Position rate management
  addPositionRate: (rate: Omit<PositionRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updatePositionRate: (id: string, updates: Partial<PositionRate>) => Promise<boolean>;
  deletePositionRate: (id: string) => Promise<boolean>;
  // System configuration
  updateSystemConfig: (config: Partial<SystemConfig>) => Promise<boolean>;
  // Statistics
  refreshStats: () => Promise<void>;
  // User management
  getAllUsers: () => Promise<any[]>;
  updateUserPosition: (userId: string, position: string) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [positionRates, setPositionRates] = useState<PositionRate[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.uid) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const adminStatus = userData?.role === 'admin' || userData?.isAdmin === true;
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          await loadAdminData();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      await Promise.all([
        loadPositionRates(),
        loadSystemConfig(),
        refreshStats()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Load position rates
  const loadPositionRates = async () => {
    try {
      const ratesQuery = query(
        collection(db, 'positionRates'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(ratesQuery);
      const rates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PositionRate[];
      setPositionRates(rates);
    } catch (error) {
      console.error('Error loading position rates:', error);
    }
  };

  // Load system configuration
  const loadSystemConfig = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'systemConfig', 'main'));
      if (configDoc.exists()) {
        setSystemConfig({ id: configDoc.id, ...configDoc.data() } as SystemConfig);
      } else {
        // Create default config
        const defaultConfig: SystemConfig = {
          id: 'main',
          companyName: 'Travel Expense Tracker',
          maxDailyDistance: 500,
          maxDealerVisits: 20,
          trackingInterval: 30,
          minLocationAccuracy: 100,
          isMaintenanceMode: false,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid || 'system'
        };
        await setDoc(doc(db, 'systemConfig', 'main'), defaultConfig);
        setSystemConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading system config:', error);
    }
  };

  // Add position rate
  const addPositionRate = async (rate: Omit<PositionRate, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const newRate: PositionRate = {
        ...rate,
        id: '',
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = doc(collection(db, 'positionRates'));
      newRate.id = docRef.id;
      await setDoc(docRef, newRate);
      
      setPositionRates(prev => [...prev, newRate].sort((a, b) => a.name.localeCompare(b.name)));
      return true;
    } catch (error) {
      console.error('Error adding position rate:', error);
      return false;
    }
  };

  // Update position rate
  const updatePositionRate = async (id: string, updates: Partial<PositionRate>): Promise<boolean> => {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'positionRates', id), updateData);
      
      setPositionRates(prev => 
        prev.map(rate => 
          rate.id === id ? { ...rate, ...updateData } : rate
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating position rate:', error);
      return false;
    }
  };

  // Delete position rate
  const deletePositionRate = async (id: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'positionRates', id), { isActive: false });
      setPositionRates(prev => prev.filter(rate => rate.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting position rate:', error);
      return false;
    }
  };

  // Update system configuration
  const updateSystemConfig = async (configUpdates: Partial<SystemConfig>): Promise<boolean> => {
    try {
      const updateData = {
        ...configUpdates,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'system'
      };
      
      await updateDoc(doc(db, 'systemConfig', 'main'), updateData);
      
      setSystemConfig(prev => prev ? { ...prev, ...updateData } : null);
      return true;
    } catch (error) {
      console.error('Error updating system config:', error);
      return false;
    }
  };

  // Refresh admin statistics
  const refreshStats = async (): Promise<void> => {
    try {
      // Get all active trips today
      const today = new Date().toISOString().split('T')[0];
      const tripsQuery = query(
        collection(db, 'trips'),
        where('date', '==', today)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      
      // Calculate statistics
      let totalDistance = 0;
      let totalExpense = 0;
      let activeTrips = 0;
      let totalAccuracy = 0;
      let accuracyCount = 0;
      
      tripsSnapshot.docs.forEach(doc => {
        const trip = doc.data();
        totalDistance += trip.distanceKm || 0;
        totalExpense += trip.expenseAmount || 0;
        if (trip.status === 'in_progress') activeTrips++;
        if (trip.locationAccuracy) {
          totalAccuracy += trip.locationAccuracy;
          accuracyCount++;
        }
      });
      
      // Get total users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const stats: AdminStats = {
        totalUsers: usersSnapshot.size,
        activeTrips,
        totalTripsToday: tripsSnapshot.size,
        totalDistanceToday: totalDistance,
        totalExpenseToday: totalExpense,
        averageAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0
      };
      
      setAdminStats(stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // Get all users for admin management
  const getAllUsers = async (): Promise<any[]> => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  };

  // Update user position
  const updateUserPosition = async (userId: string, position: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        position,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating user position:', error);
      return false;
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      return false;
    }
  };

  const value = {
    isAdmin,
    positionRates,
    systemConfig,
    adminStats,
    loading,
    addPositionRate,
    updatePositionRate,
    deletePositionRate,
    updateSystemConfig,
    refreshStats,
    getAllUsers,
    updateUserPosition,
    toggleUserStatus
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
