// Dynamic expense calculator using admin-configured position rates
// This replaces hardcoded rates with configurable position-based rates from Firestore

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface ExpenseRates {
  ratePerKm: number;      // Rate per kilometer
  dailyAllowance: number; // Daily allowance amount
}

// Cache for position rates to avoid frequent database calls
let positionRatesCache: { [key: string]: ExpenseRates } = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get position rates from Firestore with caching
 */
export const getPositionRates = async (): Promise<{ [key: string]: ExpenseRates }> => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION && Object.keys(positionRatesCache).length > 0) {
    return positionRatesCache;
  }

  try {
    const ratesQuery = query(
      collection(db, 'positionRates'),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(ratesQuery);
    const rates: { [key: string]: ExpenseRates } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      rates[data.name] = {
        ratePerKm: data.ratePerKm,
        dailyAllowance: data.dailyAllowance
      };
    });
    
    // Update cache
    positionRatesCache = rates;
    cacheTimestamp = now;
    
    console.log('Position rates loaded from admin config:', rates);
    return rates;
  } catch (error) {
    console.error('Error loading position rates from admin config:', error);
    
    // Fallback to default rates if database fails
    return getDefaultRates();
  }
};

/**
 * Fallback default rates if database is unavailable
 */
const getDefaultRates = (): { [key: string]: ExpenseRates } => {
  console.warn('Using fallback default rates (admin rates unavailable)');
  return {
    'Sales Executive': { ratePerKm: 12, dailyAllowance: 500 },
    'Senior Executive': { ratePerKm: 15, dailyAllowance: 750 },
    'Manager': { ratePerKm: 18, dailyAllowance: 1000 },
    'Regional Manager': { ratePerKm: 22, dailyAllowance: 1500 }
  };
};

/**
 * Calculate expense amount based on distance and user position
 * @param distanceKm - Distance traveled in kilometers
 * @param userPosition - User's position level
 * @returns Calculated expense amount in rupees
 */
export const calculateExpenseAmount = async (distanceKm: number, userPosition: string = 'Sales Executive'): Promise<number> => {
  try {
    const positionRates = await getPositionRates();
    
    // Get rate for the specific position
    const rate = positionRates[userPosition];
    
    if (!rate) {
      console.warn(`No admin rate found for position: ${userPosition}. Using default Sales Executive rate.`);
      const defaultRates = getDefaultRates();
      const defaultRate = defaultRates['Sales Executive'];
      return Math.round((distanceKm * defaultRate.ratePerKm) + defaultRate.dailyAllowance);
    }
    
    const totalAmount = (distanceKm * rate.ratePerKm) + rate.dailyAllowance;
    
    console.log(`Expense calculation (admin rates):`, {
      position: userPosition,
      distance: `${distanceKm}km`,
      ratePerKm: `₹${rate.ratePerKm}`,
      dailyAllowance: `₹${rate.dailyAllowance}`,
      totalAmount: `₹${totalAmount}`
    });
    
    return Math.round(totalAmount);
  } catch (error) {
    console.error('Error calculating expense:', error);
    
    // Fallback calculation
    const defaultRates = getDefaultRates();
    const defaultRate = defaultRates['Sales Executive'];
    return Math.round((distanceKm * defaultRate.ratePerKm) + defaultRate.dailyAllowance);
  }
};

/**
 * Get expense rates for a specific position
 */
export const getExpenseRates = async (userPosition: string = 'Sales Executive'): Promise<ExpenseRates> => {
  try {
    const positionRates = await getPositionRates();
    return positionRates[userPosition] || positionRates['Sales Executive'] || getDefaultRates()['Sales Executive'];
  } catch (error) {
    console.error('Error getting expense rates:', error);
    return getDefaultRates()['Sales Executive'];
  }
};

/**
 * Get available position rates for display purposes
 */
export const getAvailablePositions = async (): Promise<string[]> => {
  try {
    const positionRates = await getPositionRates();
    return Object.keys(positionRates);
  } catch (error) {
    console.error('Error getting available positions:', error);
    return Object.keys(getDefaultRates());
  }
};

/**
 * Format expense amount for display
 */
export const formatExpenseAmount = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Calculate breakdown of expenses
 */
export const calculateExpenseBreakdown = async (
  distanceKm: number,
  userPosition: string = 'Sales Executive'
) => {
  try {
    const rates = await getExpenseRates(userPosition);
    const travelExpense = distanceKm * rates.ratePerKm;
    const dailyAllowance = rates.dailyAllowance;
    const totalAmount = travelExpense + dailyAllowance;
    
    return {
      travelExpense,
      dailyAllowance,
      totalAmount,
      position: userPosition,
      rates
    };
  } catch (error) {
    console.error('Error calculating expense breakdown:', error);
    const defaultRates = getDefaultRates()['Sales Executive'];
    const travelExpense = distanceKm * defaultRates.ratePerKm;
    const dailyAllowance = defaultRates.dailyAllowance;
    
    return {
      travelExpense,
      dailyAllowance,
      totalAmount: travelExpense + dailyAllowance,
      position: userPosition,
      rates: defaultRates
    };
  }
};

/**
 * Clear the position rates cache (useful when rates are updated)
 */
export const clearPositionRatesCache = (): void => {
  positionRatesCache = {};
  cacheTimestamp = 0;
  console.log('Position rates cache cleared - will reload from admin config');
};
