import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateStaticMapUrl, Location } from '@/lib/mapboxService';

interface MapDisplayProps {
  location: Location;
  width?: number;
  height?: number;
  zoom?: number;
  showOpenInMaps?: boolean;
  className?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  location,
  width = 400,
  height = 200,
  zoom = 15,
  showOpenInMaps = true,
  className = ""
}) => {
  const staticMapUrl = generateStaticMapUrl(location.latitude, location.longitude, zoom, width, height);

  const handleOpenInMaps = () => {
    // Open in default maps app
    const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={staticMapUrl}
            alt={`Map showing ${location.placeName || location.address || 'location'}`}
            className="w-full h-auto object-cover"
            style={{ maxHeight: height }}
            onError={(e) => {
              // Fallback if static map fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          
          {/* Fallback display */}
          <div 
            className="w-full bg-muted flex items-center justify-center text-muted-foreground hidden"
            style={{ height }}
          >
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {location.placeName || "Location"}
              </p>
              <p className="text-xs">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Location info overlay */}
        <div className="p-3 bg-background/95 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {location.placeName || "Location"}
                </p>
                {location.address && (
                  <p className="text-xs text-muted-foreground truncate">
                    {location.address}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            
            {showOpenInMaps && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInMaps}
                className="ml-2 flex-shrink-0"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="text-xs">Open</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapDisplay;
