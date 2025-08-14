import { EmployeeGrade } from '../types/employee';

/**
 * Returns entitlement details for a given grade/designation.
 * This logic can be extended or made dynamic from DB if needed.
 */
export function getEntitlementsForGrade(grade: EmployeeGrade): {
  vehicleType: 'car' | '2-wheeler' | 'special';
  fuelRule: string;
  specialEntitlement: boolean;
} {
  // Example rules (can be made dynamic)
  if (grade.name.match(/RBH|Regional Business Head|Head/i)) {
    return {
      vehicleType: 'special',
      fuelRule: 'Special entitlement',
      specialEntitlement: true,
    };
  }
  if (/L4|Sales/i.test(grade.name)) {
    return {
      vehicleType: 'car',
      fuelRule: '1 litre per 7 km',
      specialEntitlement: false,
    };
  }
  if (/L[1-3]/i.test(grade.name)) {
    return {
      vehicleType: '2-wheeler',
      fuelRule: '1 litre per 25 km',
      specialEntitlement: false,
    };
  }
  // Default fallback
  return {
    vehicleType: '2-wheeler',
    fuelRule: '1 litre per 25 km',
    specialEntitlement: false,
  };
}
