import { searchPlaces, getAddressFromCoordinates } from '../lib/mapboxService';

// Simple test functions for development
export const testMapServices = async () => {
  console.log('=== Testing Map Services with Enhanced Coordinate Mapping ===');
  
  // Test place search
  console.log('\n1. Testing Place Search:');
  const searchResult = await searchPlaces('Chennai Central');
  console.log('Search results:', searchResult);
  
  // Test place search with specific area
  console.log('\n2. Testing Area-Specific Search:');
  const chrompetSearch = await searchPlaces('Chrompet');
  console.log('Chrompet search results:', chrompetSearch);
  
  // Test reverse geocoding with various Chennai coordinates
  console.log('\n3. Testing Reverse Geocoding - Central Chennai:');
  const addressResult1 = await getAddressFromCoordinates(13.0827, 80.2707); // Central Chennai
  console.log('Central Chennai:', addressResult1);
  
  console.log('\n4. Testing Reverse Geocoding - T Nagar:');
  const addressResult2 = await getAddressFromCoordinates(13.0435, 80.2349); // T Nagar area
  console.log('T Nagar area:', addressResult2);
  
  console.log('\n5. Testing Reverse Geocoding - Chrompet:');
  const addressResult3 = await getAddressFromCoordinates(12.9595, 80.1495); // Chrompet coordinates
  console.log('Chrompet area:', addressResult3);
  
  console.log('\n6. Testing Reverse Geocoding - Velachery:');
  const addressResult4 = await getAddressFromCoordinates(12.9759, 80.2206); // Velachery
  console.log('Velachery area:', addressResult4);
  
  console.log('\n7. Testing Reverse Geocoding - Anna Nagar:');
  const addressResult5 = await getAddressFromCoordinates(13.0850, 80.2101); // Anna Nagar
  console.log('Anna Nagar area:', addressResult5);
  
  console.log('\n=== Test Complete ===');
};

// DISABLED: Auto-test removed to use real GPS only
// Test functions available for manual calling only
