// Simple expense calculator with hardcoded rates - no admin required
export interface ExpenseRates {
  ratePerKm: number;
  dailyAllowance: number;
}

// Hardcoded position rates - no database dependency
const POSITION_RATES: Record<string, ExpenseRates> = {
  'Sales Executive': { ratePerKm: 12, dailyAllowance: 500 },
  'Senior Executive': { ratePerKm: 15, dailyAllowance: 750 },
  'Manager': { ratePerKm: 18, dailyAllowance: 1000 },
  'Regional Manager': { ratePerKm: 22, dailyAllowance: 1500 },
  'default': { ratePerKm: 12, dailyAllowance: 500 } // fallback
};

/**
 * Get expense rates for a position - always works, no admin setup needed
 */
export const getExpenseRates = (position: string): ExpenseRates => {
  const rates = POSITION_RATES[position] || POSITION_RATES['default'];
  console.log(`📊 Using rates for ${position}:`, rates);
  return rates;
};

/**
 * Calculate total expense amount for a trip
 */
export const calculateExpenseAmount = (
  distanceKm: number,
  position: string,
  includeDailyAllowance: boolean = true
): number => {
  const rates = getExpenseRates(position);
  
  const travelExpense = distanceKm * rates.ratePerKm;
  const dailyAllowance = includeDailyAllowance ? rates.dailyAllowance : 0;
  const totalAmount = travelExpense + dailyAllowance;
  
  console.log('💰 Expense calculation:', {
    position,
    distanceKm,
    ratePerKm: rates.ratePerKm,
    travelExpense,
    dailyAllowance,
    totalAmount
  });
  
  return Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
};

/**
 * Get available positions for dropdown
 */
export const getAvailablePositions = (): string[] => {
  return Object.keys(POSITION_RATES).filter(key => key !== 'default');
};
