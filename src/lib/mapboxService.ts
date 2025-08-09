// Mapbox API Integration
// Documentation: https://docs.mapbox.com/api/search/

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Mapbox API endpoints
const MAPBOX_ENDPOINTS = {
  GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  DIRECTIONS: 'https://api.mapbox.com/directions/v5/mapbox/driving',
  STATIC_IMAGES: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static'
};

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

// Place suggestion interface
export interface PlaceSuggestion {
  placeName: string;
  placeAddress: string;
  latitude?: number;
  longitude?: number;
  id?: string;
  relevance?: number;
  category?: string;
}

// Distance calculation interface
export interface DistanceResult {
  distance: number; // in meters
  duration: number; // in seconds
  route?: any; // Route details
}

/**
 * Get current location with address in one optimized call
 */
export const getCurrentLocationWithAddress = async (): Promise<{ location: Location | null; error: string | null }> => {
  try {
    // Get GPS coordinates first
    const { location: gpsLocation, error: gpsError } = await getCurrentLocation();
    
    if (!gpsLocation) {
      return { location: null, error: gpsError };
    }

    console.log('Got GPS coordinates, fetching address...');
    
    // Get address for the GPS coordinates
    const { address, error: addressError } = await getAddressFromCoordinates(
      gpsLocation.latitude, 
      gpsLocation.longitude
    );

    const locationWithAddress: Location = {
      ...gpsLocation,
      address: address || `${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`,
      placeName: address || 'Current Location'
    };

    if (addressError) {
      console.warn('Address lookup failed, using coordinates:', addressError);
    }

    return { location: locationWithAddress, error: null };
  } catch (error: any) {
    console.error('getCurrentLocationWithAddress error:', error);
    return { location: null, error: error.message || "Failed to get current location with address" };
  }
};

/**
 * Get high-accuracy GPS location with better error handling for IP-based fallbacks
 */
export const getHighAccuracyLocation = (): Promise<{ location: Location | null; error: string | null; isHighAccuracy: boolean }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: null, error: "Geolocation is not supported by this browser", isHighAccuracy: false });
      return;
    }

    let hasResolved = false;
    
    // Try multiple approaches to get the most accurate location
    const resolveOnce = (location: Location | null, error: string | null, isHighAccuracy: boolean) => {
      if (!hasResolved) {
        hasResolved = true;
        resolve({ location, error, isHighAccuracy });
      }
    };

    // First attempt: High accuracy with longer timeout
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        const isHighAccuracy = position.coords.accuracy < 100; // Less than 100m is considered good
        
        console.log('🎯 High-accuracy GPS attempt:', {
          coordinates: `${position.coords.latitude}, ${position.coords.longitude}`,
          accuracy: `${position.coords.accuracy}m`,
          quality: isHighAccuracy ? '✅ High accuracy' : '⚠️ Low accuracy (possibly IP-based)',
          timestamp: new Date().toISOString()
        });
        
        resolveOnce(location, null, isHighAccuracy);
      },
      (error) => {
        console.warn('High-accuracy GPS failed:', error.message);
        
        // Fallback attempt with relaxed settings
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            const isHighAccuracy = position.coords.accuracy < 1000; // Even 1km is better than IP-based
            
            console.log('📍 Fallback GPS attempt:', {
              coordinates: `${position.coords.latitude}, ${position.coords.longitude}`,
              accuracy: `${position.coords.accuracy}m`,
              quality: isHighAccuracy ? '✅ Acceptable accuracy' : '❌ Poor accuracy (likely IP-based)',
              timestamp: new Date().toISOString()
            });
            
            resolveOnce(location, null, isHighAccuracy);
          },
          (fallbackError) => {
            let errorMessage = "Failed to get location";
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage = "Location access denied. Please enable location permissions and try again.";
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage = "GPS unavailable. Please check if location services are enabled on your device.";
                break;
              case fallbackError.TIMEOUT:
                errorMessage = "Location request timeout. Please try again.";
                break;
            }
            resolveOnce(null, errorMessage, false);
          },
          {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 0 // No cache
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // No cache
      }
    );
  });
};

/**
 * Check if Mapbox service is configured
 */
export const isMapServiceConfigured = (): boolean => {
  return !!MAPBOX_ACCESS_TOKEN;
};

/**
 * Get current location using browser's geolocation API with enhanced accuracy
 */
export const getCurrentLocation = (): Promise<{ location: Location | null; error: string | null }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: null, error: "Geolocation is not supported by this browser" });
      return;
    }

    // First attempt with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        console.log('GPS Location obtained:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy + 'm',
          warning: position.coords.accuracy > 10000 ? '⚠️ Very low accuracy - likely IP-based location, not GPS' : '✅ Good GPS accuracy'
        });
        
        // Warn if accuracy is very poor (indicating IP-based location)
        if (position.coords.accuracy > 50000) {
          console.warn('🚨 LOCATION ACCURACY WARNING:');
          console.warn('- Accuracy:', position.coords.accuracy + 'm (very poor)');
          console.warn('- This appears to be IP-based geolocation, not real GPS');
          console.warn('- Try: Enable GPS on device, grant location permission, disable VPN');
        }
        
        resolve({ location, error: null });
      },
      (error) => {
        console.warn('High accuracy GPS failed, trying standard accuracy:', error);
        
        // Fallback with standard accuracy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            console.log('Standard GPS Location obtained:', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy + 'm',
              warning: position.coords.accuracy > 10000 ? '⚠️ Very low accuracy - likely IP-based location, not GPS' : '✅ Good GPS accuracy'
            });
            
            // Warn if accuracy is very poor (indicating IP-based location)
            if (position.coords.accuracy > 50000) {
              console.warn('🚨 LOCATION ACCURACY WARNING:');
              console.warn('- Accuracy:', position.coords.accuracy + 'm (very poor)');
              console.warn('- This appears to be IP-based geolocation, not real GPS');
              console.warn('- Try: Enable GPS on device, grant location permission, disable VPN');
            }
            
            resolve({ location, error: null });
          },
          (fallbackError) => {
            let errorMessage = "Failed to get location";
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage = "Location access denied by user";
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable";
                break;
              case fallbackError.TIMEOUT:
                errorMessage = "Location request timeout";
                break;
            }
            resolve({ location: null, error: errorMessage });
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute for high accuracy
      }
    );
  });
};

/**
 * Search for places using Mapbox Geocoding API with proximity bias
 */
export const searchPlaces = async (query: string, userLocation?: Location): Promise<{ suggestions: PlaceSuggestion[]; error: string | null }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    return { suggestions: [], error: "Mapbox access token not configured" };
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    
    // Build URL with proximity if user location is available
    let url = `${MAPBOX_ENDPOINTS.GEOCODING}/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=in&types=place,locality,neighborhood,address,poi&limit=8`;
    
    // Add proximity to bias results towards user's current location
    if (userLocation) {
      url += `&proximity=${userLocation.longitude},${userLocation.latitude}`;
      console.log('Search with proximity bias:', { lat: userLocation.latitude, lng: userLocation.longitude });
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && Array.isArray(data.features)) {
      const suggestions: PlaceSuggestion[] = data.features.map((feature: any) => {
        const coords = feature.geometry?.coordinates || [];
        return {
          id: feature.id,
          placeName: feature.text || feature.place_name,
          placeAddress: feature.place_name,
          latitude: coords[1], // Mapbox uses [lng, lat] format
          longitude: coords[0],
          relevance: feature.relevance,
          category: feature.properties?.category
        };
      });
      
      // If user location is available, sort by distance
      if (userLocation) {
        suggestions.sort((a, b) => {
          if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
          
          const distanceA = calculateHaversineDistance(
            userLocation.latitude, userLocation.longitude,
            a.latitude, a.longitude
          );
          const distanceB = calculateHaversineDistance(
            userLocation.latitude, userLocation.longitude,
            b.latitude, b.longitude
          );
          
          return distanceA - distanceB;
        });
      }
      
      return { suggestions, error: null };
    }

    return { suggestions: [], error: null };
  } catch (error: any) {
    console.error('Mapbox search error:', error);
    return { suggestions: [], error: error.message || "Failed to search places" };
  }
};

/**
 * Get address from coordinates using Mapbox Reverse Geocoding with enhanced accuracy
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<{ address: string | null; error: string | null }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    return { address: null, error: "Mapbox access token not configured" };
  }

  try {
    console.log('Reverse geocoding coordinates:', { latitude, longitude });
    
    // Try multiple geocoding strategies for better accuracy
    const strategies = [
      // Strategy 1: Precise address lookup with proximity
      {
        types: 'address',
        proximity: `${longitude},${latitude}`,
        limit: 1
      },
      // Strategy 2: POI and address lookup
      {
        types: 'poi,address',
        proximity: `${longitude},${latitude}`,
        limit: 5
      },
      // Strategy 3: Broader search including places
      {
        types: 'address,poi,place,locality,neighborhood',
        proximity: `${longitude},${latitude}`,
        limit: 5
      }
    ];

    for (const strategy of strategies) {
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        types: strategy.types,
        proximity: strategy.proximity,
        limit: strategy.limit.toString(),
        country: 'in' // Restrict to India for better accuracy
      });

      const url = `${MAPBOX_ENDPOINTS.GEOCODING}/${longitude},${latitude}.json?${params}`;
      console.log('Trying geocoding strategy:', strategy.types);
      
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Geocoding strategy ${strategy.types} failed with status:`, response.status);
        continue;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Find the most relevant result based on distance
        const bestMatch = findBestLocationMatch(data.features, latitude, longitude);
        
        if (bestMatch) {
          console.log('Best location match found:', bestMatch.place_name);
          return { address: bestMatch.place_name, error: null };
        }
      }
    }

    return { address: null, error: "No accurate address found for these coordinates" };
  } catch (error: any) {
    console.error('Mapbox reverse geocoding error:', error);
    return { address: null, error: error.message || "Failed to get address" };
  }
};

/**
 * Find the best location match based on proximity to actual coordinates
 */
const findBestLocationMatch = (features: any[], targetLat: number, targetLng: number) => {
  let bestMatch = null;
  let shortestDistance = Infinity;

  for (const feature of features) {
    if (feature.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      const distance = calculateHaversineDistance(targetLat, targetLng, lat, lng);
      
      console.log(`Location: ${feature.place_name}, Distance: ${(distance/1000).toFixed(2)}km`);
      
      // Prefer results within 1km for better accuracy
      if (distance < shortestDistance && distance < 1000) {
        shortestDistance = distance;
        bestMatch = feature;
      }
    }
  }

  // If no result within 1km, take the closest one but warn about accuracy
  if (!bestMatch && features.length > 0) {
    bestMatch = features[0];
    console.warn('No precise location found within 1km, using closest result');
  }

  return bestMatch;
};

/**
 * Calculate distance and route between two points using Mapbox Directions API
 */
export const calculateDistance = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ result: DistanceResult | null; error: string | null }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    return { result: null, error: "Mapbox access token not configured" };
  }

  try {
    const url = `${MAPBOX_ENDPOINTS.DIRECTIONS}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=simplified`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const result: DistanceResult = {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        route: route
      };
      
      return { result, error: null };
    }

    return { result: null, error: "No route found" };
  } catch (error: any) {
    console.error('Mapbox directions error:', error);
    return { result: null, error: error.message || "Failed to calculate distance" };
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * This is a fallback method that doesn't require API calls
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance * 1000; // Convert to meters
};

/**
 * Generate static map image URL using Mapbox Static Images API
 */
export const generateStaticMapUrl = (
  latitude: number,
  longitude: number,
  zoom: number = 15,
  width: number = 400,
  height: number = 300
): string => {
  if (!MAPBOX_ACCESS_TOKEN) {
    return '';
  }

  // Add a marker at the location
  const marker = `pin-s-circle+285A98(${longitude},${latitude})`;
  
  return `${MAPBOX_ENDPOINTS.STATIC_IMAGES}/${marker}/${longitude},${latitude},${zoom}/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
};

/**
 * Generate map URL for displaying in iframe or opening in browser
 */
export const generateMapUrl = (
  latitude: number,
  longitude: number,
  zoom: number = 15
): string => {
  return `https://www.mapbox.com/maps?center=${longitude},${latitude}&zoom=${zoom}`;
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};
