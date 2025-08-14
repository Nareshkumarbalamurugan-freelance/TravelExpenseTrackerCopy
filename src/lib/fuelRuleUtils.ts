// Utility to extract fuel entitlement (km per litre) from entitlement string
export function parseFuelRule(fuelRule: string): number | null {
  // e.g., '1 litre per 7 km' => 7
  const match = fuelRule.match(/1\s*litre\s*per\s*(\d+)\s*km/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}
