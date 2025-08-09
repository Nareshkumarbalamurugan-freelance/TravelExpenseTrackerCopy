import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocationPicker from '@/components/LocationPicker';
import MapDisplay from '@/components/MapDisplay';
import { Location, isMapServiceConfigured } from '@/lib/mapboxService';
import { MapPin, Navigation, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import { testMapServices } from '@/utils/mapTestUtils';
import { displayLocationDebug, clearLocationCache } from '@/utils/locationDebug';

const MapDemo = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const isConfigured = isMapServiceConfigured();

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  if (!isConfigured) {
    return (
      <>
        <SEO title="Map Demo" description="MapMyIndia integration demo" />
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Map Integration Demo</h1>
            <Badge variant="destructive">Mapbox API Not Configured</Badge>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Setup Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                To use map features, please configure your Mapbox API credentials in the environment file.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Required variables:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>VITE_MAPBOX_ACCESS_TOKEN</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Map Demo" description="MapMyIndia integration demo" />
      <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Map Integration Demo</h1>
        <Badge variant="default">Mapbox API Configured</Badge>
      </div>        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Search className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Place Search</p>
                  <p className="text-xs text-muted-foreground">Find locations across India</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Navigation className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Current Location</p>
                  <p className="text-xs text-muted-foreground">Get GPS coordinates</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Map Display</p>
                  <p className="text-xs text-muted-foreground">Static map visualization</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Test Section */}
        {import.meta.env.DEV && (
          <Card>
            <CardHeader>
              <CardTitle>Development Testing & Debugging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Test the map services integration and debug location issues.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={testMapServices} variant="outline" size="sm">
                    Run Map Service Tests
                  </Button>
                  <Button onClick={displayLocationDebug} variant="outline" size="sm">
                    Debug Location
                  </Button>
                  <Button onClick={clearLocationCache} variant="outline" size="sm">
                    Clear Location Cache
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Check browser console for detailed results and debug information
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Accuracy Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Location Accuracy Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">If you're seeing wrong location (like Chennai when you're not there):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
                <li>Click "Clear Location Cache" button above</li>
                <li>Refresh the page and re-grant location permission</li>
                <li>Ensure GPS/Location Services are enabled on your device</li>
                <li>Disable any VPN that might be routing through Chennai</li>
                <li>Try using the location picker in a different browser</li>
                <li>On mobile: Check if "High Accuracy" location mode is enabled</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Understanding Location Accuracy:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li><strong>Good accuracy:</strong> &lt;100m - Real GPS signal</li>
                <li><strong>Moderate:</strong> 100m-1km - GPS with some interference</li>
                <li><strong>Poor:</strong> &gt;1km - Likely IP-based location (inaccurate)</li>
                <li><strong>Very poor:</strong> &gt;50km - Definitely IP-based, shows ISP location</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Location Picker Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Location Picker</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationPicker 
              onLocationSelect={handleLocationSelect}
              placeholder="Try searching for 'Mumbai', 'Delhi', or 'Bangalore'..."
            />
          </CardContent>
        </Card>

        {/* Map Display Demo */}
        {selectedLocation && (
          <Card>
            <CardHeader>
              <CardTitle>Map Display</CardTitle>
            </CardHeader>
            <CardContent>
              <MapDisplay 
                location={selectedLocation}
                width={400}
                height={250}
                zoom={15}
                showOpenInMaps={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Integration Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">For Expense Tracking:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use LocationPicker when adding new expenses</li>
                <li>Store latitude, longitude, and address in the expense record</li>
                <li>Display location using MapDisplay component</li>
                <li>Calculate travel distances between locations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Mapbox Benefits:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Global location data with India support</li>
                <li>High-precision GPS and geocoding</li>
                <li>Comprehensive address information</li>
                <li>Reliable international mapping service</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MapDemo;
