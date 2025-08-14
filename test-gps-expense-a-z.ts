// test-gps-expense-a-z.ts
// Comprehensive test for GPS distance and expense calculation logic
// Run with: ts-node test-gps-expense-a-z.ts

import { calculateTotalDistance } from './src/lib/tripSession';
import { calculateExpenseAmount } from './src/lib/expenseCalculator';

// Helper: Generate a fake trip with N GPS points between two locations
function generateTripPoints(start, end, steps = 10) {
  const points: any[] = [];
  for (let i = 0; i <= steps; i++) {
    const lat = start.latitude + (end.latitude - start.latitude) * (i / steps);
    const lon = start.longitude + (end.longitude - start.longitude) * (i / steps);
  points.push({ latitude: lat, longitude: lon, timestamp: new Date(Date.now() + i * 60000), accuracy: 5 });
  }
  return points;
}

// Test cases: A-Z (varied distances, positions, edge cases)
const testCases = [
  {
    name: 'A. Chennai to Mahabalipuram',
    points: generateTripPoints({ latitude: 13.0827, longitude: 80.2707 }, { latitude: 12.6208, longitude: 80.1932 }, 20),
    expectedMin: 50, // km
    expectedMax: 70,
  },
  {
    name: 'B. Short city trip',
    points: generateTripPoints({ latitude: 13.0827, longitude: 80.2707 }, { latitude: 13.1000, longitude: 80.2200 }, 5),
    expectedMin: 5,
    expectedMax: 10,
  },
  {
    name: 'C. No movement',
    points: generateTripPoints({ latitude: 13.0827, longitude: 80.2707 }, { latitude: 13.0827, longitude: 80.2707 }, 1),
    expectedMin: 0,
    expectedMax: 0.1,
  },
  {
    name: 'D. Large cross-state trip',
    points: generateTripPoints({ latitude: 13.0827, longitude: 80.2707 }, { latitude: 17.3850, longitude: 78.4867 }, 30), // Chennai to Hyderabad
    expectedMin: 500,
    expectedMax: 700,
  },
  // ...add more cases as needed for A-Z coverage
];

const positions = ['Sales Executive', 'Senior Executive', 'Manager', 'Regional Manager'];

(async () => {
  for (const test of testCases) {
    const distance = calculateTotalDistance(test.points);
    console.log(`\n${test.name}`);
    console.log(`  Calculated distance: ${distance.toFixed(2)} km`);
    if (distance < test.expectedMin || distance > test.expectedMax) {
      console.error(`  ❌ Distance out of expected range (${test.expectedMin}-${test.expectedMax} km)`);
    } else {
      console.log('  ✅ Distance within expected range');
    }
    for (const pos of positions) {
      const amount = await calculateExpenseAmount(distance, pos);
      console.log(`    ${pos}: ₹${amount}`);
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        console.error(`    ❌ Invalid amount for ${pos}`);
      }
    }
  }
  // Edge: Empty points array
  const emptyDistance = calculateTotalDistance([]);
  console.log(`\nEdge: Empty GPS array distance: ${emptyDistance}`);
  if (emptyDistance !== 0) {
    console.error('  ❌ Should be 0 for empty array');
  } else {
    console.log('  ✅ Correct for empty array');
  }
})();
