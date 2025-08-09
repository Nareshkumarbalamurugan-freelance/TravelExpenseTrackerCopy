import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { 
  Route, 
  DollarSign, 
  Clock, 
  MapPin, 
  Calendar,
  TrendingUp,
  Activity,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TripSession } from '@/lib/tripSession';
import { getSystemSettings, SystemSettings } from '@/lib/adminService';
import TripControls from '@/components/TripControls';
import SEO from '@/components/SEO';

interface EmployeeStats {
  todayTrips: number;
  todayDistance: number;
  todayExpenses: number;
  weekTrips: number;
  weekDistance: number;
  weekExpenses: number;
  monthTrips: number;
  monthDistance: number;
  monthExpenses: number;
  totalTrips: number;
  totalDistance: number;
  totalExpenses: number;
  averageDistance: number;
  averageExpense: number;
  currentStreak: number;
  bestMonth: string;
  positionRank: number;
}

interface RecentTrip {
  id: string;
  date: Date;
  distance: number;
  expense: number;
  status: string;
  dealerVisits: number;
  duration: string;
}

const EnhancedEmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.uid) {
      loadEmployeeData();
    }
  }, [user]);

  const loadEmployeeData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Load system settings for position rates
      const systemSettings = await getSystemSettings();
      setSettings(systemSettings);

      // Get user's position rate
      const userPosition = user.position || 'Sales Executive';
      const positionRate = systemSettings.defaultPositions.find(p => p.position === userPosition);

      // Calculate date ranges
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Query user's trips
      const tripsQuery = query(
        collection(db, 'tripSessions'),
        where('userId', '==', user.uid),
        orderBy('startTime', 'desc')
      );

      const tripsSnapshot = await getDocs(tripsQuery);
      const allTrips = tripsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TripSession[];

      // Calculate statistics
      const todayTrips = allTrips.filter(trip => {
        const tripDate = trip.startTime instanceof Timestamp ? trip.startTime.toDate() : new Date(trip.startTime);
        return tripDate >= startOfToday;
      });

      const weekTrips = allTrips.filter(trip => {
        const tripDate = trip.startTime instanceof Timestamp ? trip.startTime.toDate() : new Date(trip.startTime);
        return tripDate >= startOfWeek;
      });

      const monthTrips = allTrips.filter(trip => {
        const tripDate = trip.startTime instanceof Timestamp ? trip.startTime.toDate() : new Date(trip.startTime);
        return tripDate >= startOfMonth;
      });

      const completedTrips = allTrips.filter(trip => trip.status === 'completed');

      // Calculate totals
      const calculateTotals = (trips: TripSession[]) => ({
        trips: trips.length,
        distance: trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0),
        expenses: trips.reduce((sum, trip) => sum + (trip.totalExpense || 0), 0)
      });

      const todayTotals = calculateTotals(todayTrips);
      const weekTotals = calculateTotals(weekTrips);
      const monthTotals = calculateTotals(monthTrips);
      const allTotals = calculateTotals(completedTrips);

      // Prepare recent trips for display
      const recentTripsData: RecentTrip[] = completedTrips.slice(0, 10).map(trip => {
        const startTime = trip.startTime instanceof Timestamp ? trip.startTime.toDate() : new Date(trip.startTime);
        const endTime = trip.endTime instanceof Timestamp ? trip.endTime?.toDate() : trip.endTime ? new Date(trip.endTime) : null;
        
        let duration = 'Unknown';
        if (endTime) {
          const durationMs = endTime.getTime() - startTime.getTime();
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          duration = `${hours}h ${minutes}m`;
        }

        return {
          id: trip.id || '',
          date: startTime,
          distance: trip.totalDistance || 0,
          expense: trip.totalExpense || 0,
          status: trip.status,
          dealerVisits: trip.dealerVisits?.length || 0,
          duration
        };
      });

      setRecentTrips(recentTripsData);

      // Set statistics
      setStats({
        todayTrips: todayTotals.trips,
        todayDistance: todayTotals.distance,
        todayExpenses: todayTotals.expenses,
        weekTrips: weekTotals.trips,
        weekDistance: weekTotals.distance,
        weekExpenses: weekTotals.expenses,
        monthTrips: monthTotals.trips,
        monthDistance: monthTotals.distance,
        monthExpenses: monthTotals.expenses,
        totalTrips: allTotals.trips,
        totalDistance: allTotals.distance,
        totalExpenses: allTotals.expenses,
        averageDistance: allTotals.trips > 0 ? allTotals.distance / allTotals.trips : 0,
        averageExpense: allTotals.trips > 0 ? allTotals.expenses / allTotals.trips : 0,
        currentStreak: calculateCurrentStreak(completedTrips),
        bestMonth: findBestMonth(completedTrips),
        positionRank: 1 // This would be calculated against other users
      });

    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentStreak = (trips: TripSession[]): number => {
    // Calculate consecutive days with trips
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayHasTrip = trips.some(trip => {
        const tripDate = trip.startTime instanceof Timestamp ? trip.startTime.toDate() : new Date(trip.startTime);
        return tripDate >= dayStart && tripDate < dayEnd;
      });
      
      if (dayHasTrip) {
        streak++;
      } else if (i > 0) { // Don't break on today if no trips yet
        break;
      }
    }
    
    return streak;
  };

  const findBestMonth = (trips: TripSession[]): string => {
    const monthlyStats = new Map<string, number>();
    
    trips.forEach(trip => {
      const tripDate = trip.startTime instanceof Timestamp ? trip.startTime.toDate() : new Date(trip.startTime);
      const monthKey = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats.set(monthKey, (monthlyStats.get(monthKey) || 0) + (trip.totalDistance || 0));
    });
    
    let bestMonth = '';
    let bestDistance = 0;
    
    monthlyStats.forEach((distance, month) => {
      if (distance > bestDistance) {
        bestDistance = distance;
        bestMonth = month;
      }
    });
    
    return bestMonth || new Date().toISOString().slice(0, 7);
  };

  const getPerformanceLevel = (distance: number): { level: string; color: string; nextTarget: number } => {
    if (distance >= 1000) return { level: 'Elite', color: 'bg-purple-500', nextTarget: 1500 };
    if (distance >= 500) return { level: 'Expert', color: 'bg-blue-500', nextTarget: 1000 };
    if (distance >= 200) return { level: 'Advanced', color: 'bg-green-500', nextTarget: 500 };
    if (distance >= 50) return { level: 'Intermediate', color: 'bg-yellow-500', nextTarget: 200 };
    return { level: 'Beginner', color: 'bg-gray-500', nextTarget: 50 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const performance = getPerformanceLevel(stats?.monthDistance || 0);
  const userPosition = user?.position || 'Sales Executive';
  const positionRate = settings?.defaultPositions.find(p => p.position === userPosition);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title="Employee Dashboard - Travel Expense Tracker"
        description="Track your trips, expenses, and performance metrics"
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            {userPosition} • Rate: ₹{positionRate?.perKmRate || 12}/km
          </p>
        </div>
        <Badge className={`${performance.color} text-white`}>
          {performance.level} Level
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Trips</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayTrips || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(stats?.todayDistance || 0).toFixed(1)} km traveled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Distance</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.monthDistance || 0).toFixed(0)} km</div>
            <p className="text-xs text-muted-foreground">
              {((stats?.monthDistance || 0) / (performance.nextTarget) * 100).toFixed(0)}% to {performance.level === 'Elite' ? 'Elite+' : 'next level'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats?.monthExpenses || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month's reimbursements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">
              Days with trips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trip-controls">Trip Controls</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalTrips || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(stats?.totalDistance || 0).toFixed(0)} km</p>
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{(stats?.totalExpenses || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Average Distance per Trip</span>
                    <span className="font-medium">{(stats?.averageDistance || 0).toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Earnings per Trip</span>
                    <span className="font-medium">₹{(stats?.averageExpense || 0).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Best Performance Month</span>
                    <span className="font-medium">{stats?.bestMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Trips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrips.slice(0, 5).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {trip.date.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trip.distance.toFixed(1)} km • {trip.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{trip.expense.toFixed(0)}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.dealerVisits} visits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly/Monthly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Period Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{stats?.weekTrips || 0}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-xs text-muted-foreground">
                    {(stats?.weekDistance || 0).toFixed(0)} km • ₹{(stats?.weekExpenses || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-green-600">{stats?.monthTrips || 0}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xs text-muted-foreground">
                    {(stats?.monthDistance || 0).toFixed(0)} km • ₹{(stats?.monthExpenses || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{stats?.totalTrips || 0}</p>
                  <p className="text-sm text-muted-foreground">All Time</p>
                  <p className="text-xs text-muted-foreground">
                    {(stats?.totalDistance || 0).toFixed(0)} km • ₹{(stats?.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trip Controls Tab */}
        <TabsContent value="trip-controls">
          <TripControls />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {trip.date.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {trip.duration}
                        </p>
                      </div>
                      <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                        {trip.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="font-medium">{trip.distance.toFixed(1)} km</p>
                        <p className="text-xs text-muted-foreground">Distance</p>
                      </div>
                      <div>
                        <p className="font-medium">₹{trip.expense.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Expense</p>
                      </div>
                      <div>
                        <p className="font-medium">{trip.dealerVisits}</p>
                        <p className="text-xs text-muted-foreground">Visits</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Level Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Level: {performance.level}</span>
                      <span>{(stats?.monthDistance || 0).toFixed(0)} / {performance.nextTarget} km</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${performance.color}`}
                        style={{ 
                          width: `${Math.min(((stats?.monthDistance || 0) / performance.nextTarget) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Efficiency Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Avg Distance/Trip</span>
                      <span>{(stats?.averageDistance || 0).toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Earnings/Trip</span>
                      <span>₹{(stats?.averageExpense || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Earnings/km</span>
                      <span>₹{stats?.totalDistance ? (stats.totalExpenses / stats.totalDistance).toFixed(2) : '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedEmployeeDashboard;
