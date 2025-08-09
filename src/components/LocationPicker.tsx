import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { 
  getCurrentLocationWithAddress, 
  searchPlaces, 
  getAddressFromCoordinates,
  getHighAccuracyLocation,
  PlaceSuggestion,
  Location
} from '@/lib/mapboxService';
import { toast } from '@/hooks/use-toast';

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location | null;
  placeholder?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for a location..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Get user's current location for proximity bias
    getCurrentLocationWithAddress().then(({ location }) => {
      if (location) {
        setUserLocation(location);
      }
    }).catch(console.warn);
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setSearchQuery(initialLocation.address || initialLocation.placeName || '');
    }
  }, [initialLocation]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    const { suggestions: results, error } = await searchPlaces(searchQuery, userLocation || undefined);
    
    if (error) {
      toast({
        title: "Search failed",
        description: error,
        variant: "destructive"
      });
    } else {
      setSuggestions(results);
      setShowSuggestions(true);
    }
    
    setIsSearching(false);
  };

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    const location: Location = {
      latitude: suggestion.latitude!,
      longitude: suggestion.longitude!,
      address: suggestion.placeAddress,
      placeName: suggestion.placeName
    };
    
    setSelectedLocation(location);
    setSearchQuery(suggestion.placeName);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    // First, try to get high-accuracy GPS to check if we're getting IP-based location
    const { location: gpsLocation, error: gpsError, isHighAccuracy } = await getHighAccuracyLocation();
    
    if (gpsError) {
      toast({
        title: "Location access failed",
        description: gpsError,
        variant: "destructive"
      });
      setIsGettingLocation(false);
      return;
    }
    
    // If GPS accuracy is very poor, warn the user
    if (gpsLocation && !isHighAccuracy) {
      toast({
        title: "⚠️ Location accuracy warning",
        description: "Getting approximate location. For better accuracy, enable GPS and location services on your device.",
        variant: "destructive"
      });
    }
    
    const { location, error } = await getCurrentLocationWithAddress();
    
    if (error) {
      toast({
        title: "Location access failed",
        description: error,
        variant: "destructive"
      });
    } else if (location) {
      setSelectedLocation(location);
      setSearchQuery(location.address || location.placeName || "Current Location");
      onLocationSelect(location);
      
      const accuracyNote = !isHighAccuracy ? " (Low accuracy - please verify)" : "";
      
      toast({
        title: "Location found" + accuracyNote,
        description: `Located: ${location.address || 'Current position'}`,
        variant: isHighAccuracy ? "default" : "destructive"
      });
    }
    
    setIsGettingLocation(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location-search">Location</Label>
        
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="location-search"
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-10 pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            )}
          </div>
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
              <CardContent className="p-0">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{suggestion.placeName}</p>
                        <p className="text-xs text-muted-foreground truncate">{suggestion.placeAddress}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center space-x-2"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>{isGettingLocation ? "Getting..." : "Use Current"}</span>
        </Button>
        
        {selectedLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearLocation}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Selected location display */}
      {selectedLocation && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {selectedLocation.placeName || "Selected Location"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationPicker;
