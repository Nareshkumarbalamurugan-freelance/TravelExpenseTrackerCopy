// 🏢 N.VELTEC Travel Policy Implementation - Updated with HR Requirements
// Based on: Domestic Sales Travel Policy 2022–2024 + HR Feedback (Aug 2025)
// Doc. No.: TF / PL 01 HR 01 | Issue Date: 01-12-2022

export interface TravelEntitlement {
  grade: string;
  level: string;
  daFood: number;           // Daily Allowance for Food (₹)
  daTown: number;          // DA for Town (₹)
  daCapital: number;       // DA for Capital (₹)
  daMetro: number;         // DA for Metro (₹)
  hotelMax: number;        // Maximum Hotel cost with bill (₹)
  travellingEntitlement: number; // General travelling entitlement (₹)
  mealWithoutBill: number; // Meal expenses without bills (₹/day)
  phoneLimit: number;      // Monthly phone limit (₹)
  fuelEntitlement: string; // Fuel entitlement description
  vehicleType: 'car' | '2wheeler'; // Vehicle entitlement
  fuelEfficiencyKmPerLiter: number; // Fuel efficiency (km per liter)
}

// Updated fuel entitlement rules based on HR feedback
export const FUEL_RULES = {
  car: {
    kmPerLiter: 7, // L4 and above: 1 liter for 7 km
    eligibleGrades: ['L4', 'L3', 'L2', 'L1', 'GM', 'Sr. GM', 'DGM', 'Director']
  },
  '2wheeler': {
    kmPerLiter: 25, // Below L4: 1 liter for 25 km  
    eligibleGrades: ['C Class', 'B Class', 'A Class', 'L5']
  },
  actual: {
    kmPerLiter: 0, // RBH and above: actual basis
    eligibleGrades: ['RBH', 'Sr. GM', 'DGM', 'Director']
  }
};

// Official N.VELTEC Travel Policy Data - Updated with HR Requirements
export const TRAVEL_POLICY: Record<string, TravelEntitlement> = {
  // C Class - 2-wheeler entitlement
  'C Class': {
    grade: 'C Class',
    level: 'C',
    daFood: 150,
    daTown: 250,
    daCapital: 750,
    daMetro: 1100,
    hotelMax: 750,
    travellingEntitlement: 1100,
    mealWithoutBill: 200,
    phoneLimit: 400,
    fuelEntitlement: '2-wheeler / 25 Km per liter fuel limit',
    vehicleType: '2wheeler',
    fuelEfficiencyKmPerLiter: 25
  },
  
  // B Class - 2-wheeler entitlement
  'B Class': {
    grade: 'B Class', 
    level: 'B',
    daFood: 200,
    daTown: 300,
    daCapital: 750,
    daMetro: 1200,
    hotelMax: 750,
    travellingEntitlement: 1200,
    mealWithoutBill: 200,
    phoneLimit: 400,
    fuelEntitlement: '2-wheeler / 25 Km per liter fuel limit',
    vehicleType: '2wheeler',
    fuelEfficiencyKmPerLiter: 25
  },
  
  // A Class - 2-wheeler entitlement
  'A Class': {
    grade: 'A Class',
    level: 'A', 
    daFood: 225,
    daTown: 350,
    daCapital: 800,
    daMetro: 1300,
    hotelMax: 800,
    travellingEntitlement: 1300,
    mealWithoutBill: 200,
    phoneLimit: 400,
    fuelEntitlement: '2-wheeler / 25 Km per liter fuel limit',
    vehicleType: '2wheeler',
    fuelEfficiencyKmPerLiter: 25
  },
  
  // L5 Level - 2-wheeler entitlement  
  'L5': {
    grade: 'L5',
    level: 'L5',
    daFood: 250,
    daTown: 400,
    daCapital: 900,
    daMetro: 1500,
    hotelMax: 900,
    travellingEntitlement: 1500,
    mealWithoutBill: 200,
    phoneLimit: 400,
    fuelEntitlement: '2-wheeler / 25 Km per liter fuel limit',
    vehicleType: '2wheeler',
    fuelEfficiencyKmPerLiter: 25
  },
  
  // L4 Level - Car entitlement starts here
  'L4': {
    grade: 'L4',
    level: 'L4',
    daFood: 275,
    daTown: 425,
    daCapital: 1000,
    daMetro: 1600,
    hotelMax: 1000,
    travellingEntitlement: 1600,
    mealWithoutBill: 300,
    phoneLimit: 400,
    fuelEntitlement: 'Car / 7 Km per liter fuel limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 7
  },
  
  // L3 Level - Car entitlement
  'L3': {
    grade: 'L3',
    level: 'L3',
    daFood: 300,
    daTown: 450,
    daCapital: 1200,
    daMetro: 1600,
    hotelMax: 1200,
    travellingEntitlement: 1600,
    mealWithoutBill: 300,
    phoneLimit: 400,
    fuelEntitlement: 'Car / 7 Km per liter fuel limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 7
  },
  
  // L2 Level - Car entitlement
  'L2': {
    grade: 'L2',
    level: 'L2',
    daFood: 325,
    daTown: 500,
    daCapital: 1500,
    daMetro: 2000,
    hotelMax: 1500,
    travellingEntitlement: 2000,
    mealWithoutBill: 500,
    phoneLimit: 400,
    fuelEntitlement: 'Car / 7 Km per liter fuel limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 7
  },
  
  // L1 Level - Car entitlement
  'L1': {
    grade: 'L1',
    level: 'L1',
    daFood: 350,
    daTown: 500,
    daCapital: 1800,
    daMetro: 2000,
    hotelMax: 1800,
    travellingEntitlement: 2000,
    mealWithoutBill: 500,
    phoneLimit: 400,
    fuelEntitlement: 'Car / 7 Km per liter fuel limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 7
  },
  
  // GM Level - Car entitlement
  'GM': {
    grade: 'GM',
    level: 'GM',
    daFood: 375,
    daTown: 550,
    daCapital: 2000,
    daMetro: 2500,
    hotelMax: 2000,
    travellingEntitlement: 2500,
    mealWithoutBill: 300,
    phoneLimit: 400,
    fuelEntitlement: 'Car / 7 Km per liter fuel limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 7
  },
  
  // Sr. GM Level - Actual basis
  'Sr. GM': {
    grade: 'Sr. GM',
    level: 'Sr. GM',
    daFood: 0, // Actual
    daTown: 0, // Actual
    daCapital: 3000,
    daMetro: 3500,
    hotelMax: 3000,
    travellingEntitlement: 3500,
    mealWithoutBill: 0,
    phoneLimit: 400,
    fuelEntitlement: 'Actual basis - no limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 0
  },
  
  // DGM Level - Actual basis
  'DGM': {
    grade: 'DGM',
    level: 'DGM',
    daFood: 0, // Actual
    daTown: 0, // Actual  
    daCapital: 3500,
    daMetro: 4000,
    hotelMax: 3500,
    travellingEntitlement: 4000,
    mealWithoutBill: 0,
    phoneLimit: 400,
    fuelEntitlement: 'Actual basis - no limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 0
  },
  
  // Director Level - Actual basis
  'Director': {
    grade: 'Director',
    level: 'Director',
    daFood: 0, // Actual
    daTown: 0, // Actual
    daCapital: 0, // Actual
    daMetro: 0, // Actual
    hotelMax: 0, // Actual
    travellingEntitlement: 0, // Actual
    mealWithoutBill: 0,
    phoneLimit: 400,
    fuelEntitlement: 'Actual basis - no limit',
    vehicleType: 'car',
    fuelEfficiencyKmPerLiter: 0
  }
};

// Grade Hierarchy Mapping (from policy document)
export const GRADE_HIERARCHY = [
  'Trainee',
  'Officer / Executive',
  'Sr. Officer / Sr. Executive', 
  'Asst. Manager',
  'Dy. Manager',
  'Manager',
  'Sr. Manager',
  'AGM',
  'DGM',
  'GM / RBH',
  'Sr. GM',
  'L2 & L1'
];

// Map specific grades to policy levels
export const GRADE_TO_POLICY_LEVEL: Record<string, string> = {
  'Trainee': 'C Class',
  'Officer': 'C Class',
  'Executive': 'C Class',
  'Sr. Officer': 'B Class',
  'Sr. Executive': 'B Class',
  'Asst. Manager': 'A Class',
  'ASM': 'L5',
  'Dy. Manager': 'L4',
  'Manager': 'L3',
  'Sr. Manager': 'L2',
  'AGM': 'L1',
  'DGM': 'DGM',
  'GM': 'GM',
  'RBH': 'GM',
  'Sr. GM': 'Sr. GM',
  'L2': 'L2',
  'L1': 'L1',
  'Director': 'Director'
};

// Location Types for DA calculation
export type LocationType = 'food' | 'town' | 'capital' | 'metro';

// Fuel calculation utility - Updated with HR requirements
export const calculateFuelEntitlement = (grade: string, distance: number): number => {
  const policy = getTravelPolicy(grade);
  
  if (policy.fuelEfficiencyKmPerLiter === 0) {
    return 0; // Actual basis - no limit
  }
  
  // Calculate liters required based on vehicle type
  const litersRequired = distance / policy.fuelEfficiencyKmPerLiter;
  
  // Assume average fuel price ₹100/liter (can be updated)
  const fuelPrice = 100;
  return Math.round(litersRequired * fuelPrice);
};

// Get vehicle type and fuel efficiency for display
export const getVehicleInfo = (grade: string): { type: string; efficiency: number; description: string } => {
  const policy = getTravelPolicy(grade);
  
  if (policy.vehicleType === 'car') {
    return {
      type: 'Car',
      efficiency: 7,
      description: 'Car entitlement - 1 liter per 7 km'
    };
  } else if (policy.vehicleType === '2wheeler') {
    return {
      type: '2-Wheeler', 
      efficiency: 25,
      description: '2-wheeler entitlement - 1 liter per 25 km'
    };
  } else {
    return {
      type: 'Actual',
      efficiency: 0,
      description: 'Actual basis - no limit'
    };
  }
};

// Get travel policy for a specific grade
export const getTravelPolicy = (grade: string): TravelEntitlement => {
  const policyLevel = GRADE_TO_POLICY_LEVEL[grade] || 'C Class';
  return TRAVEL_POLICY[policyLevel] || TRAVEL_POLICY['C Class'];
};

// Calculate DA based on location type
export const calculateDA = (grade: string, locationType: LocationType, days: number = 1): number => {
  const policy = getTravelPolicy(grade);
  
  let dailyRate = 0;
  switch (locationType) {
    case 'food':
      dailyRate = policy.daFood;
      break;
    case 'town':
      dailyRate = policy.daTown;
      break;
    case 'capital':
      dailyRate = policy.daCapital;
      break;
    case 'metro':
      dailyRate = policy.daMetro;
      break;
    default:
      dailyRate = policy.daFood;
  }
  
  return dailyRate * days;
};

// Validate claim amount against policy limits
export const validateClaimAmount = (
  grade: string, 
  claimType: string, 
  amount: number, 
  locationType?: LocationType,
  days?: number
): { isValid: boolean; maxAllowed: number; message: string } => {
  const policy = getTravelPolicy(grade);
  
  switch (claimType) {
    case 'accommodation':
      const maxHotel = policy.hotelMax;
      return {
        isValid: maxHotel === 0 || amount <= maxHotel, // 0 means actual basis
        maxAllowed: maxHotel,
        message: maxHotel === 0 ? 'On actual basis' : `Maximum allowed: ₹${maxHotel}`
      };
      
    case 'food':
      if (locationType && days) {
        const maxDA = calculateDA(grade, locationType, days);
        return {
          isValid: maxDA === 0 || amount <= maxDA,
          maxAllowed: maxDA,
          message: maxDA === 0 ? 'On actual basis' : `Maximum DA: ₹${maxDA} for ${days} day(s)`
        };
      }
      break;
      
    case 'communication':
      return {
        isValid: amount <= policy.phoneLimit,
        maxAllowed: policy.phoneLimit,
        message: `Monthly phone limit: ₹${policy.phoneLimit}`
      };
      
    case 'travel':
      const maxTravel = policy.travellingEntitlement;
      return {
        isValid: maxTravel === 0 || amount <= maxTravel,
        maxAllowed: maxTravel,
        message: maxTravel === 0 ? 'On actual basis' : `Maximum allowed: ₹${maxTravel}`
      };
  }
  
  return {
    isValid: true,
    maxAllowed: 0,
    message: 'Please review as per company policy'
  };
};

// Policy compliance rules
export const POLICY_RULES = {
  advanceBooking: 14, // days
  submissionDeadline: 5, // before 5th of every month
  fuelEfficiency: 8, // km per liter
  approvalRequired: {
    deviation: 'CCO/MD approval required for deviations',
    taxiTours: 'Prior CCO approval required',
    meetingExpenses: 'Managers must take prior RBH/CCO approval',
    exceedingLimit: 'Anything beyond travel limit requires CCO approval'
  },
  mandatoryDocuments: [
    'Monthly TA & DA statement with reporting manager approval',
    'Monthly tonnage sales achieved for claimed period',
    'Farm Tracking Report (must be submitted with travel claim)'
  ]
};
