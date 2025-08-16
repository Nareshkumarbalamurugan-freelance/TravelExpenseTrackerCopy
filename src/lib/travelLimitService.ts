// 📊 Monthly Travel Limit Tracking - Noveltech Policy Compliance
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface MonthlyTravelData {
  id?: string;
  employeeId: string;
  employeeName: string;
  month: string; // Format: "2025-08"
  year: number;
  monthNumber: number;
  totalClaims: number;
  totalAmount: number;
  totalDistance: number;
  fuelClaims: number;
  fuelAmount: number;
  policyLimit: number; // Monthly limit based on grade
  remainingLimit: number;
  exceedsLimit: boolean;
  lastUpdated: Date;
}

export interface TravelLimitResult {
  success: boolean;
  data?: MonthlyTravelData;
  error?: string;
  warnings?: string[];
}

// Get monthly travel limits based on grade (as per Noveltech policy)
const getMonthlyTravelLimit = (grade: string): number => {
  // From Noveltech policy: Monthly travel limits
  const limits: Record<string, number> = {
    'C Class': 5000,
    'B Class': 7500,
    'A Class': 10000,
    'L5': 12000,
    'L4': 15000,
    'L3': 20000,
    'L2': 25000,
    'L1': 30000,
    'GM': 40000,
    'Sr. GM': 50000,
    'DGM': 60000,
    'Director': 75000,
    // Default limits for other grades
    'Manager': 18000,
    'Sr. Manager': 22000,
    'AGM': 28000
  };
  
  return limits[grade] || 10000; // Default ₹10,000 if grade not found
};

// Calculate or update monthly travel data for an employee
export const updateMonthlyTravelData = async (
  employeeId: string, 
  employeeName: string, 
  grade: string,
  claimAmount: number,
  distance: number = 0,
  isFuelClaim: boolean = false
): Promise<TravelLimitResult> => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const year = now.getFullYear();
    const monthNumber = now.getMonth() + 1;
    
    console.log('📊 TravelLimitService: Updating monthly data for:', employeeId, month);
    
    // Check if monthly record exists
    const monthlyQuery = query(
      collection(db, 'monthlyTravelData'),
      where('employeeId', '==', employeeId),
      where('month', '==', month)
    );
    
    const monthlySnapshot = await getDocs(monthlyQuery);
    const policyLimit = getMonthlyTravelLimit(grade);
    
    let monthlyData: MonthlyTravelData;
    
    if (monthlySnapshot.empty) {
      // Create new monthly record
      monthlyData = {
        employeeId,
        employeeName,
        month,
        year,
        monthNumber,
        totalClaims: 1,
        totalAmount: claimAmount,
        totalDistance: distance,
        fuelClaims: isFuelClaim ? 1 : 0,
        fuelAmount: isFuelClaim ? claimAmount : 0,
        policyLimit,
        remainingLimit: Math.max(0, policyLimit - claimAmount),
        exceedsLimit: claimAmount > policyLimit,
        lastUpdated: now
      };
      
      await addDoc(collection(db, 'monthlyTravelData'), {
        ...monthlyData,
        lastUpdated: Timestamp.fromDate(now)
      });
    } else {
      // Update existing record
      const doc = monthlySnapshot.docs[0];
      const existing = doc.data();
      
      monthlyData = {
        id: doc.id,
        employeeId,
        employeeName,
        month,
        year,
        monthNumber,
        totalClaims: existing.totalClaims + 1,
        totalAmount: existing.totalAmount + claimAmount,
        totalDistance: existing.totalDistance + distance,
        fuelClaims: existing.fuelClaims + (isFuelClaim ? 1 : 0),
        fuelAmount: existing.fuelAmount + (isFuelClaim ? claimAmount : 0),
        policyLimit,
        remainingLimit: Math.max(0, policyLimit - (existing.totalAmount + claimAmount)),
        exceedsLimit: (existing.totalAmount + claimAmount) > policyLimit,
        lastUpdated: now
      };
      
      const batch = writeBatch(db);
      batch.update(doc.ref, {
        totalClaims: monthlyData.totalClaims,
        totalAmount: monthlyData.totalAmount,
        totalDistance: monthlyData.totalDistance,
        fuelClaims: monthlyData.fuelClaims,
        fuelAmount: monthlyData.fuelAmount,
        remainingLimit: monthlyData.remainingLimit,
        exceedsLimit: monthlyData.exceedsLimit,
        lastUpdated: Timestamp.fromDate(now)
      });
      await batch.commit();
    }
    
    // Generate warnings
    const warnings = [];
    if (monthlyData.exceedsLimit) {
      warnings.push(`Monthly travel limit exceeded by ₹${monthlyData.totalAmount - monthlyData.policyLimit}`);
    }
    if (monthlyData.remainingLimit < 1000 && monthlyData.remainingLimit > 0) {
      warnings.push(`Only ₹${monthlyData.remainingLimit} remaining in monthly limit`);
    }
    
    console.log('✅ TravelLimitService: Monthly data updated:', monthlyData);
    
    return {
      success: true,
      data: monthlyData,
      warnings
    };
    
  } catch (error) {
    console.error('💥 TravelLimitService: Error updating monthly data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get monthly travel data for an employee
export const getMonthlyTravelData = async (employeeId: string, month?: string): Promise<TravelLimitResult> => {
  try {
    const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyQuery = query(
      collection(db, 'monthlyTravelData'),
      where('employeeId', '==', employeeId),
      where('month', '==', targetMonth)
    );
    
    const monthlySnapshot = await getDocs(monthlyQuery);
    
    if (monthlySnapshot.empty) {
      return {
        success: true,
        data: undefined
      };
    }
    
    const doc = monthlySnapshot.docs[0];
    const data = doc.data();
    
    return {
      success: true,
      data: {
        id: doc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as MonthlyTravelData
    };
    
  } catch (error) {
    console.error('💥 TravelLimitService: Error fetching monthly data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get all monthly travel data for admin dashboard
export const getAllMonthlyTravelData = async (month?: string): Promise<MonthlyTravelData[]> => {
  try {
    const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyQuery = query(
      collection(db, 'monthlyTravelData'),
      where('month', '==', targetMonth),
      orderBy('totalAmount', 'desc')
    );
    
    const monthlySnapshot = await getDocs(monthlyQuery);
    
    return monthlySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
    } as MonthlyTravelData));
    
  } catch (error) {
    console.error('💥 TravelLimitService: Error fetching all monthly data:', error);
    return [];
  }
};

// Check if claim would exceed monthly limit (for validation)
export const validateMonthlyLimit = async (
  employeeId: string, 
  grade: string, 
  claimAmount: number
): Promise<{ isValid: boolean; warning?: string; currentTotal?: number; limit?: number }> => {
  try {
    const monthlyResult = await getMonthlyTravelData(employeeId);
    const limit = getMonthlyTravelLimit(grade);
    
    if (!monthlyResult.success || !monthlyResult.data) {
      // First claim of the month
      return {
        isValid: claimAmount <= limit,
        warning: claimAmount > limit ? `Claim exceeds monthly limit of ₹${limit}` : undefined,
        currentTotal: 0,
        limit
      };
    }
    
    const currentTotal = monthlyResult.data.totalAmount;
    const newTotal = currentTotal + claimAmount;
    
    return {
      isValid: newTotal <= limit,
      warning: newTotal > limit ? `Total monthly claims would exceed limit by ₹${newTotal - limit}` : undefined,
      currentTotal,
      limit
    };
    
  } catch (error) {
    console.error('💥 TravelLimitService: Error validating monthly limit:', error);
    return { isValid: true }; // Allow if validation fails
  }
};

export { getMonthlyTravelLimit };
