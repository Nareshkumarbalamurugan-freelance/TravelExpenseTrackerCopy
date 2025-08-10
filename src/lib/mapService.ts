// MapMyIndia (Mappls) API Integration
// Documentation: https://docs.mappls.com/

const MAPPLS_API_KEY = import.meta.env.VITE_MAPPLS_API_KEY;
const MAPPLS_CLIENT_ID = import.meta.env.VITE_MAPPLS_CLIENT_ID;
const MAPPLS_CLIENT_SECRET = import.meta.env.VITE_MAPPLS_CLIENT_SECRET;

// Base URLs for different MapMyIndia services
// Using proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const forceRealAPI = import.meta.env.VITE_FORCE_REAL_MAP_API === 'true';

const BASE_URLS = {
  ATLAS_API: isDevelopment ? '/api/mappls/api/places' : 'https://atlas.mappls.com/api/places',
  AUTOSUGGEST: isDevelopment ? '/api/mappls/api/places/search/json' : 'https://atlas.mappls.com/api/places/search/json',
  GEOCODING: isDevelopment ? '/api/mappls/advancedmaps/v1' : 'https://apis.mappls.com/advancedmaps/v1',
  REVERSE_GEOCODING: isDevelopment ? '/api/mappls/advancedmaps/v1' : 'https://apis.mappls.com/advancedmaps/v1',
  DISTANCE_MATRIX: isDevelopment ? '/api/mappls/advancedmaps/v1' : 'https://apis.mappls.com/advancedmaps/v1',
  ROUTE: isDevelopment ? '/api/mappls/advancedmaps/v1' : 'https://apis.mappls.com/advancedmaps/v1'
};

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Place suggestion interface
export interface PlaceSuggestion {
  placeName: string;
  placeAddress: string;
  latitude?: number;
  longitude?: number;
  eLoc?: string; // MapMyIndia's unique place identifier
}

// Distance calculation interface
export interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  route?: any; // Route details
}

/**
 * Get current location using browser's geolocation API
 */
export const getCurrentLocation = (): Promise<{ location: Location | null; error: string | null }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: null, error: "Geolocation is not supported by this browser" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        resolve({ location, error: null });
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timeout";
            break;
        }
        resolve({ location: null, error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  });
};

/**
 * Search for places using MapMyIndia Autosuggest API
 */
export const searchPlaces = async (query: string): Promise<{ suggestions: PlaceSuggestion[]; error: string | null }> => {
  // Always use real API in production. Only use mock data in development mode and not forced real API.
  try {
    const response = await fetch(
      `${BASE_URLS.AUTOSUGGEST}?query=${encodeURIComponent(query)}&region=IND&key=${MAPPLS_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.suggestedLocations && Array.isArray(data.suggestedLocations)) {
      const suggestions: PlaceSuggestion[] = data.suggestedLocations.map((place: any) => ({
        placeName: place.placeName || place.placeAddress,
        placeAddress: place.placeAddress,
        latitude: place.latitude ? parseFloat(place.latitude) : undefined,
        longitude: place.longitude ? parseFloat(place.longitude) : undefined,
        eLoc: place.eLoc
      }));
      
      return { suggestions, error: null };
    }

    return { suggestions: [], error: null };
  } catch (error: any) {
    if (isDevelopment && !forceRealAPI) {
      // Only use mock data in development mode and not forced real API
      console.log('Development mode: Using mock search results for:', query);
      return generateMockSearchResults(query);
    }
    return { suggestions: [], error: error.message || 'Failed to fetch suggestions' };
  }
};

/**
 * Generate mock search results for development when CORS is blocked
 */
const generateMockSearchResults = (query: string): { suggestions: PlaceSuggestion[]; error: string | null } => {
  // Enhanced Chennai locations with more accurate coordinates
  const chennaiLocations = [
    { area: 'T Nagar', lat: 13.0435, lng: 80.2349, pincode: '600017' },
    { area: 'Anna Nagar', lat: 13.0850, lng: 80.2101, pincode: '600040' },
    { area: 'Velachery', lat: 12.9759, lng: 80.2206, pincode: '600042' },
    { area: 'Adyar', lat: 13.0067, lng: 80.2572, pincode: '600020' },
    { area: 'Mylapore', lat: 13.0339, lng: 80.2619, pincode: '600004' },
    { area: 'Nungambakkam', lat: 13.0569, lng: 80.2433, pincode: '600034' },
    { area: 'Chrompet', lat: 12.9595, lng: 80.1495, pincode: '600044' },
    { area: 'Tambaram', lat: 12.9249, lng: 80.1000, pincode: '600045' },
    { area: 'Porur', lat: 13.0389, lng: 80.1673, pincode: '600116' },
    { area: 'Perungudi', lat: 12.9716, lng: 80.2463, pincode: '600096' },
    { area: 'Thoraipakkam', lat: 12.9516, lng: 80.2370, pincode: '600097' },
    { area: 'Pallavaram', lat: 12.9675, lng: 80.1491, pincode: '600043' }
  ];

  const mockSuggestions: PlaceSuggestion[] = [];
  
  // Check if query contains a specific area name for more relevant results
  const queryLower = query.toLowerCase();
  let relevantLocations = chennaiLocations;
  
  // Filter locations based on query if it matches an area
  const matchingArea = chennaiLocations.find(loc => 
    queryLower.includes(loc.area.toLowerCase()) || 
    loc.area.toLowerCase().includes(queryLower)
  );
  
  if (matchingArea) {
    // Put the matching area first, then nearby areas
    relevantLocations = [matchingArea, ...chennaiLocations.filter(loc => loc !== matchingArea)];
  }
  
  // Generate suggestions based on relevant locations
  for (let i = 0; i < Math.min(5, relevantLocations.length); i++) {
    const location = relevantLocations[i];
    const variation = (Math.random() - 0.5) * 0.01; // Smaller variation for accuracy
    
    mockSuggestions.push({
      placeName: i === 0 && matchingArea ? query : `${query} - ${location.area}`,
      placeAddress: `Near ${query}, ${location.area}, Chennai, Tamil Nadu ${location.pincode}, India`,
      latitude: location.lat + variation,
      longitude: location.lng + variation,
      eLoc: `MOCK${String(i + 1).padStart(3, '0')}`
    });
  }
  
  // If no area-specific match, add a general suggestion
  if (!matchingArea && query && query.trim()) {
    mockSuggestions.unshift({
      placeName: query,
      placeAddress: `${query}, Chennai, Tamil Nadu, India`,
      latitude: 13.0827 + (Math.random() - 0.5) * 0.05,
      longitude: 80.2707 + (Math.random() - 0.5) * 0.05,
      eLoc: 'MOCK_MAIN'
    });
  }
  
  return { suggestions: mockSuggestions, error: null };
};

/**
 * Get address from coordinates (Reverse Geocoding)
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<{ address: string | null; error: string | null }> => {
  // Always use real API in production. Only use mock data in development mode and not forced real API.
  try {
    const response = await fetch(
      `${BASE_URLS.REVERSE_GEOCODING}/${MAPPLS_API_KEY}/rev_geocode?lat=${latitude}&lng=${longitude}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const address = result.formatted_address || 
                     `${result.locality || ''}, ${result.city || ''}, ${result.state || ''}`.replace(/^,\s*|,\s*$/g, '');
      
      return { address, error: null };
    }

    return { address: null, error: "No address found for these coordinates" };
  } catch (error: any) {
    if (isDevelopment && !forceRealAPI) {
      // Only use mock data in development mode and not forced real API
      console.log('Development mode: Using mock address for coordinates:', latitude, longitude);
      return generateMockAddress(latitude, longitude);
    }
    return { address: null, error: error.message || 'Failed to fetch address' };
  }
};

/**
 * Generate mock address for development when CORS is blocked
 */
const generateMockAddress = (latitude: number, longitude: number): { address: string | null; error: string | null } => {
  // More accurate Chennai area mapping based on actual coordinates
  const chennaiAreas = [
    // North Chennai
    { name: 'Purasavakkam', minLat: 13.10, maxLat: 13.12, minLng: 80.21, maxLng: 80.23 },
    { name: 'Anna Nagar', minLat: 13.08, maxLat: 13.09, minLng: 80.20, maxLng: 80.22 },
    { name: 'Aminjikarai', minLat: 13.07, maxLat: 13.08, minLng: 80.21, maxLng: 80.23 },
    
    // Central Chennai
    { name: 'T Nagar', minLat: 13.04, maxLat: 13.05, minLng: 80.23, maxLng: 80.25 },
    { name: 'Nungambakkam', minLat: 13.05, maxLat: 13.07, minLng: 80.24, maxLng: 80.26 },
    { name: 'Egmore', minLat: 13.07, maxLat: 13.08, minLng: 80.25, maxLng: 80.27 },
    { name: 'Mylapore', minLat: 13.03, maxLat: 13.04, minLng: 80.26, maxLng: 80.28 },
    
    // South Chennai
    { name: 'Adyar', minLat: 13.00, maxLat: 13.02, minLng: 80.25, maxLng: 80.27 },
    { name: 'Velachery', minLat: 12.97, maxLat: 12.99, minLng: 80.21, maxLng: 80.23 },
    { name: 'Tambaram', minLat: 12.92, maxLat: 12.94, minLng: 80.09, maxLng: 80.12 },
    { name: 'Chrompet', minLat: 12.95, maxLat: 12.97, minLng: 80.13, maxLng: 80.16 },
    { name: 'Pallavaram', minLat: 12.95, maxLat: 12.97, minLng: 80.14, maxLng: 80.17 },
    
    // West Chennai
    { name: 'Porur', minLat: 13.03, maxLat: 13.05, minLng: 80.15, maxLng: 80.18 },
    { name: 'Vadapalani', minLat: 13.05, maxLat: 13.07, minLng: 80.20, maxLng: 80.22 },
    
    // East Chennai (OMR corridor)
    { name: 'Perungudi', minLat: 12.96, maxLat: 12.98, minLng: 80.24, maxLng: 80.26 },
    { name: 'Thoraipakkam', minLat: 12.94, maxLat: 12.96, minLng: 80.23, maxLng: 80.25 },
    { name: 'Sholinganallur', minLat: 12.90, maxLat: 12.92, minLng: 80.22, maxLng: 80.24 }
  ];
  
  // Find the best matching area based on coordinates
  let selectedArea = 'Chennai Central'; // Default fallback
  let minDistance = Infinity;
  
  for (const area of chennaiAreas) {
    if (latitude >= area.minLat && latitude <= area.maxLat && 
        longitude >= area.minLng && longitude <= area.maxLng) {
      selectedArea = area.name;
      break; // Exact match found
    }
    
    // Calculate distance to area center if no exact match
    const areaCenterLat = (area.minLat + area.maxLat) / 2;
    const areaCenterLng = (area.minLng + area.maxLng) / 2;
    const distance = Math.sqrt(
      Math.pow(latitude - areaCenterLat, 2) + Math.pow(longitude - areaCenterLng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      selectedArea = area.name;
    }
  }
  
  const streets = ['Main Road', 'Cross Street', 'Avenue', 'Lane', 'Street', 'Road'];
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];
  
  // Generate pin code based on area (simplified mapping)
  const pinCodes: { [key: string]: string } = {
    'Anna Nagar': '600040',
    'T Nagar': '600017',
    'Adyar': '600020',
    'Velachery': '600042',
    'Chrompet': '600044',
    'Tambaram': '600045',
    'Mylapore': '600004',
    'Nungambakkam': '600034',
    'Pallavaram': '600043',
    'Porur': '600116',
    'Perungudi': '600096',
    'Thoraipakkam': '600097',
    'Sholinganallur': '600119'
  };
  
  const pinCode = pinCodes[selectedArea] || '600001';
  
  const address = `Mock Location, ${randomStreet}, ${selectedArea}, Chennai, Tamil Nadu ${pinCode}, India`;
  
  return { address, error: null };
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ result: DistanceResult | null; error: string | null }> => {
  try {
    const response = await fetch(
      `${BASE_URLS.DISTANCE_MATRIX}/${MAPPLS_API_KEY}/distance_matrix/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?rtype=1&region=IND`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.distances && data.results.durations) {
      const distanceInMeters = data.results.distances[0][1];
      const durationInSeconds = data.results.durations[0][1];
      
      const result: DistanceResult = {
        distance: distanceInMeters / 1000, // Convert to kilometers
        duration: durationInSeconds / 60 // Convert to minutes
      };
      
      return { result, error: null };
    }

    return { result: null, error: "Unable to calculate distance" };
  } catch (error: any) {
    return { result: null, error: error.message || "Failed to calculate distance" };
  }
};

/**
 * Get coordinates from address or place name (Geocoding)
 */
export const getCoordinatesFromAddress = async (address: string): Promise<{ location: Location | null; error: string | null }> => {
  try {
    // First try to search for the place
    const { suggestions, error: searchError } = await searchPlaces(address);
    
    if (searchError) {
      return { location: null, error: searchError };
    }
    
    if (suggestions.length > 0 && suggestions[0].latitude && suggestions[0].longitude) {
      const location: Location = {
        latitude: suggestions[0].latitude,
        longitude: suggestions[0].longitude,
        address: suggestions[0].placeAddress,
        placeName: suggestions[0].placeName
      };
      
      return { location, error: null };
    }
    
    return { location: null, error: "No coordinates found for this address" };
  } catch (error: any) {
    return { location: null, error: error.message || "Failed to get coordinates" };
  }
};

/**
 * Generate a static map URL for display
 */
export const getStaticMapUrl = (
  latitude: number, 
  longitude: number, 
  zoom: number = 15, 
  width: number = 400, 
  height: number = 300
): string => {
  return `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_API_KEY}/still_image?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red|${latitude},${longitude}`;
};

/**
 * Validate if the API key is configured
 */
export const isMapServiceConfigured = (): boolean => {
  return !!(MAPPLS_API_KEY && MAPPLS_CLIENT_ID && MAPPLS_CLIENT_SECRET);
};
