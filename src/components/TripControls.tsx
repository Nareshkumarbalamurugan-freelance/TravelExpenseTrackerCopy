import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  DollarSign, 
  Navigation,
  Camera,
  Users,
  Timer,
  Route
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useGPSTracking from '@/hooks/useGPSTracking';
import { getPreciseLocation } from '@/lib/preciseLocation';
import {
  startTripSession,
  endTripSession,
  addDealerVisit,
  addGPSPoint,
  getActiveSession,
  calculateTotalDistance,
  TripSession,
  GPSPoint,
  POSITION_RATES
} from '@/lib/tripSession';
import { toast } from '@/hooks/use-toast';

const TripControls: React.FC = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<TripSession | null>(null);
  const [dealerName, setDealerName] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [currentExpense, setCurrentExpense] = useState(0);
  const [tripDuration, setTripDuration] = useState('00:00:00');

  // GPS tracking with automatic point collection
  const {
    isTracking,
    currentLocation,
    error: gpsError,
    accuracy,
    lastUpdate,
    startTracking,
    stopTracking
  } = useGPSTracking(
    {
      trackingInterval: 30000, // 30 seconds
      minDistanceThreshold: 10 // 10 meters
    },
    (gpsPoint: GPSPoint) => {
      // Automatically add GPS point to active session
      if (activeSession?.id) {
        addGPSPoint(activeSession.id, gpsPoint);
        updateDistanceAndExpense(activeSession, [...activeSession.gpsTrackingPoints, gpsPoint]);
      }
    }
  );

  // Load active session on mount
  useEffect(() => {
    if (user?.uid) {
      loadActiveSession();
    }
  }, [user]);

  // Update trip duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession && activeSession.status === 'active') {
      interval = setInterval(() => {
        const duration = Date.now() - new Date(activeSession.startTime).getTime();
        setTripDuration(formatDuration(duration));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const loadActiveSession = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    const { session, error } = await getActiveSession(user.uid);
    
    if (error) {
      toast({
        title: "Error loading session",
        description: error,
        variant: "destructive"
      });
    } else if (session) {
      setActiveSession(session);
      updateDistanceAndExpense(session, session.gpsTrackingPoints);
      
      // Resume GPS tracking if session is active
      if (session.status === 'active') {
        startTracking();
      }
    }
    
    setIsLoading(false);
  };

  const updateDistanceAndExpense = (session: TripSession, gpsPoints: GPSPoint[]) => {
    const distance = calculateTotalDistance(gpsPoints);
    setCurrentDistance(distance);

    // Calculate expense based on user position
    const positionRate = POSITION_RATES[user?.position || 'Sales Executive'];
    if (positionRate) {
      const expense = (distance * positionRate.perKmRate) + positionRate.dailyAllowance;
      setCurrentExpense(expense);
    }
  };

  const handleStartTrip = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    
    try {
      const { location, error: locationError } = await getPreciseLocation();
      
      if (locationError || !location) {
        toast({
          title: "Location Error",
          description: locationError || "Failed to get current location",
          variant: "destructive"
        });
        return;
      }

      const { sessionId, error } = await startTripSession(user.uid, {
        latitude: location.latitude,
        longitude: location.longitude,
        address: "Trip Start Location"
      });

      if (error) {
        toast({
          title: "Failed to start trip",
          description: error,
          variant: "destructive"
        });
      } else if (sessionId) {
        toast({
          title: "Trip started",
          description: "GPS tracking is now active"
        });
        
        // Reload active session
        await loadActiveSession();
        startTracking();
      }
    } catch (error: any) {
      toast({
        title: "Failed to start trip",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleEndTrip = async () => {
    if (!activeSession?.id || !user?.uid) return;

    setIsLoading(true);
    
    try {
      const { location, error: locationError } = await getPreciseLocation();
      
      if (locationError || !location) {
        toast({
          title: "Location Error",
          description: locationError || "Failed to get current location",
          variant: "destructive"
        });
        return;
      }

      const totalDistance = calculateTotalDistance(activeSession.gpsTrackingPoints);
      
      const { error } = await endTripSession(
        activeSession.id,
        {
          latitude: location.latitude,
          longitude: location.longitude,
          address: "Trip End Location"
        },
        totalDistance,
        user.position || 'Sales Executive'
      );

      if (error) {
        toast({
          title: "Failed to end trip",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Trip completed",
          description: `Total distance: ${totalDistance.toFixed(2)} km`
        });
        
        stopTracking();
        setActiveSession(null);
        setCurrentDistance(0);
        setCurrentExpense(0);
        setTripDuration('00:00:00');
      }
    } catch (error: any) {
      toast({
        title: "Failed to end trip",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleDealerPunch = async () => {
    if (!activeSession?.id || !currentLocation) return;

    setIsLoading(true);
    
    try {
      const { visitId, error } = await addDealerVisit(activeSession.id, {
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: "Dealer Visit Location"
        },
        timestamp: new Date(),
        dealerName: dealerName || undefined,
        notes: visitNotes || undefined
      });

      if (error) {
        toast({
          title: "Failed to record visit",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Dealer visit recorded",
          description: `Visit ${visitId} logged successfully`
        });
        
        setDealerName('');
        setVisitNotes('');
        
        // Reload session to update visit count
        await loadActiveSession();
      }
    } catch (error: any) {
      toast({
        title: "Failed to record visit",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trip data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trip Status</span>
            <Badge variant={activeSession ? "default" : "secondary"}>
              {activeSession ? activeSession.status.toUpperCase() : "NO ACTIVE TRIP"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSession ? (
            <>
              {/* Trip Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{tripDuration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{activeSession.dealerVisits.length}</p>
                    <p className="text-xs text-muted-foreground">Dealer Visits</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{currentDistance.toFixed(2)} km</p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">₹{currentExpense.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Est. Expense</p>
                  </div>
                </div>
              </div>

              {/* GPS Status */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Navigation className={`h-4 w-4 ${isTracking ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm">
                    GPS: {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {accuracy && (
                  <span className="text-xs text-muted-foreground">
                    ±{accuracy.toFixed(0)}m
                  </span>
                )}
              </div>

              <Button
                onClick={handleEndTrip}
                variant="destructive"
                className="w-full"
                disabled={isLoading}
              >
                <Square className="h-4 w-4 mr-2" />
                End Trip
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStartTrip}
              className="w-full"
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Trip
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dealer Visit Card - Only show during active trip */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Dealer Visit</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dealer-name">Dealer Name (Optional)</Label>
              <Input
                id="dealer-name"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                placeholder="Enter dealer name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit-notes">Visit Notes (Optional)</Label>
              <Input
                id="visit-notes"
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Meeting notes, orders, etc..."
              />
            </div>

            <Button
              onClick={handleDealerPunch}
              className="w-full"
              disabled={isLoading || !currentLocation}
            >
              <Camera className="h-4 w-4 mr-2" />
              Record Dealer Visit
            </Button>

            {!currentLocation && (
              <p className="text-xs text-muted-foreground text-center">
                Waiting for GPS location...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* GPS Error Display */}
      {gpsError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{gpsError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripControls;
