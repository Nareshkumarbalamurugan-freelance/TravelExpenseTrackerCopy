import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Settings, 
  BarChart3, 
  MapPin, 
  DollarSign, 
  Route,
  Shield,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Save,
  Download,
  TrendingUp,
  Clock,
  Activity,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  AdminUser,
  AdminStats,
  SystemSettings,
  EmployeePosition,
  getAllUsersWithStats,
  getAdminStats,
  getSystemSettings,
  updateSystemSettings,
  addPositionRate,
  updatePositionRate,
  deletePositionRate,
  updateUserAdmin,
  getTripAnalytics,
  exportTripData
} from '@/lib/adminService';

import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

const ComprehensiveAdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [positionRates, setPositionRates] = useState<EmployeePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  // Approval workflow state
  const [pendingClaims, setPendingClaims] = useState<any[]>([]); // Replace any with your claim type
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalRemark, setApprovalRemark] = useState<{ [claimId: string]: string }>({});

  // Load real pending claims for the logged-in admin/manager
  useEffect(() => {
    const fetchClaims = async () => {
      if (activeTab !== 'approvals' || !user) return;
      setApprovalLoading(true);
      try {
        const { getPendingClaimsForManager } = await import('../lib/database');
        // Assume user.approvalLevel and user.uid are available
        // Use position as fallback for approval level
        let level: string = 'L1';
        if (user.position) {
          if (user.position.toLowerCase().includes('hr')) level = 'L2';
          else if (user.position.toLowerCase().includes('manager')) level = 'L1';
          else if (user.position.toLowerCase().includes('admin')) level = 'L3';
        }
        const managerId = user.uid;
  const { claims, error } = await getPendingClaimsForManager(level as 'L1' | 'L2' | 'L3', managerId);
        if (error) {
          toast({ title: 'Error loading claims', description: error, variant: 'destructive' });
          setPendingClaims([]);
        } else {
          setPendingClaims(claims);
        }
      } catch (err: any) {
        toast({ title: 'Error loading claims', description: err.message, variant: 'destructive' });
        setPendingClaims([]);
      } finally {
        setApprovalLoading(false);
      }
    };
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const handleApprove = async (claimId: string) => {
    try {
      const { approveClaim } = await import('../lib/database');
      const { error } = await approveClaim(claimId);
      if (error) {
        toast({ title: 'Approval failed', description: error, variant: 'destructive' });
      } else {
        setPendingClaims(claims => claims.filter(c => c.id !== claimId));
        toast({ title: 'Claim Approved', description: `Claim ${claimId} approved.` });
      }
    } catch (err: any) {
      toast({ title: 'Approval failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleReject = async (claimId: string) => {
    if (!approvalRemark[claimId]) {
      toast({ title: 'Remarks required', description: 'Please enter remarks for rejection.', variant: 'destructive' });
      return;
    }
    try {
      const { rejectClaim } = await import('../lib/database');
      const { error } = await rejectClaim(claimId, approvalRemark[claimId]);
      if (error) {
        toast({ title: 'Rejection failed', description: error, variant: 'destructive' });
      } else {
        setPendingClaims(claims => claims.filter(c => c.id !== claimId));
        toast({ title: 'Claim Rejected', description: `Claim ${claimId} rejected.` });
      }
    } catch (err: any) {
      toast({ title: 'Rejection failed', description: err.message, variant: 'destructive' });
    }
  };

  // Form states
  const [newPosition, setNewPosition] = useState({
    position: '',
    perKmRate: 0,
    dailyAllowance: 0,
    maxDailyExpense: 0
  });
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [settingsForm, setSettingsForm] = useState<Partial<SystemSettings>>({});

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData, settingsData] = await Promise.all([
        getAllUsersWithStats(),
        getAdminStats(),
        getSystemSettings()
      ]);

      setUsers(usersData);
      setStats(statsData);
      setSettings(settingsData);
      setSettingsForm(settingsData);
      setPositionRates(settingsData.defaultPositions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosition = async () => {
    try {
      if (!newPosition.position || newPosition.perKmRate <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }

      const updatedPositions = [...positionRates, newPosition];
      await updateSystemSettings({
        defaultPositions: updatedPositions
      });

      setPositionRates(updatedPositions);
      setNewPosition({ position: '', perKmRate: 0, dailyAllowance: 0, maxDailyExpense: 0 });
      
      toast({
        title: "Success",
        description: "Position added successfully"
      });
    } catch (error) {
      console.error('Error adding position:', error);
      toast({
        title: "Error",
        description: "Failed to add position",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      await updateUserAdmin(userId, updates);
      await loadDashboardData();
      setEditingUser(null);
      
      toast({
        title: "Success",
        description: "User updated successfully"
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSystemSettings(settingsForm);
      setSettings({ ...settings!, ...settingsForm });
      
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last month
      const endDate = new Date();

      const data = await exportTripData(startDate, endDate, format);
      
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trip-data-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      
      toast({
        title: "Success",
        description: "Data exported successfully"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title="Admin Dashboard - Travel Expense Tracker"
        description="Comprehensive admin panel for managing employees, trips, and system settings"
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage employees, trips, and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportData('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExportData('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeEmployees || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trips Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTripsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalTripsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance This Month</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.totalDistanceThisMonth || 0).toFixed(0)} km
            </div>
            <p className="text-xs text-muted-foreground">
              Across all trips
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats?.totalExpensesThisMonth || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total reimbursements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Expense Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {approvalLoading ? (
                <div>Loading...</div>
              ) : pendingClaims.length === 0 ? (
                <div className="text-gray-500">No pending claims.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Claim ID</th>
                        <th className="p-2 border">Employee</th>
                        <th className="p-2 border">Type</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Level</th>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border">Receipt</th>
                        <th className="p-2 border">Remarks (for Rejection)</th>
                        <th className="p-2 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingClaims.map(claim => (
                        <tr key={claim.id}>
                          <td className="p-2 border">{claim.id}</td>
                          <td className="p-2 border">{claim.employee}</td>
                          <td className="p-2 border">{claim.type}</td>
                          <td className="p-2 border">₹{claim.amount}</td>
                          <td className="p-2 border">{claim.date}</td>
                          <td className="p-2 border">{claim.level}</td>
                          <td className="p-2 border">{claim.description}</td>
                          <td className="p-2 border">{claim.receipt ? 'Yes' : 'No'}</td>
                          <td className="p-2 border">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-40"
                              placeholder="Remarks (required for rejection)"
                              value={approvalRemark[claim.id] || ''}
                              onChange={e => setApprovalRemark(r => ({ ...r, [claim.id]: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 border flex flex-col gap-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleApprove(claim.id)}>Approve</button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleReject(claim.id)}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topPerformers.map((performer, index) => (
                    <div key={performer.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-muted-foreground">{performer.position}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{performer.distance.toFixed(0)} km</p>
                        <p className="text-sm text-muted-foreground">{performer.trips} trips</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Trips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentTrips.slice(0, 5).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Trip #{trip.id?.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                          {trip.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {(trip.totalDistance || 0).toFixed(1)} km
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.position}</p>
                      </div>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{user.totalTrips} trips</p>
                        <p className="text-sm text-muted-foreground">
                          {user.totalDistance.toFixed(0)} km | ₹{user.totalExpenses.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Employee</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                  id="name"
                                  value={editingUser?.name || ''}
                                  onChange={(e) => setEditingUser(prev => 
                                    prev ? { ...prev, name: e.target.value } : null
                                  )}
                                />
                              </div>
                              <div>
                                <Label htmlFor="position">Position</Label>
                                <Select
                                  value={editingUser?.position}
                                  onValueChange={(value) => setEditingUser(prev => 
                                    prev ? { ...prev, position: value } : null
                                  )}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {positionRates.map((pos) => (
                                      <SelectItem key={pos.position} value={pos.position}>
                                        {pos.position}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={editingUser?.isActive}
                                  onCheckedChange={(checked) => setEditingUser(prev => 
                                    prev ? { ...prev, isActive: checked } : null
                                  )}
                                />
                                <Label>Active</Label>
                              </div>
                              <Button 
                                onClick={() => editingUser && handleUpdateUser(editingUser.id, {
                                  name: editingUser.name,
                                  position: editingUser.position,
                                  isActive: editingUser.isActive
                                })}
                                className="w-full"
                              >
                                Update Employee
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trips Tab */}
        <TabsContent value="trips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{stats?.totalTripsThisMonth || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{(stats?.totalDistanceThisMonth || 0).toFixed(0)} km</p>
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">₹{(stats?.totalExpensesThisMonth || 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trip Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentTrips.map((trip) => {
                  const user = users.find(u => u.id === trip.userId);
                  return (
                    <div key={trip.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{user?.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{user?.position}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(trip.startTime).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p className="font-medium">{(trip.totalDistance || 0).toFixed(1)} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expense</p>
                          <p className="font-medium">₹{(trip.totalExpense || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dealer Visits</p>
                          <p className="font-medium">{trip.dealerVisits?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Position Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Position */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Add New Position</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="position">Position Name</Label>
                    <Input
                      id="position"
                      value={newPosition.position}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Team Lead"
                    />
                  </div>
                  <div>
                    <Label htmlFor="perKmRate">Rate per KM (₹)</Label>
                    <Input
                      id="perKmRate"
                      type="number"
                      value={newPosition.perKmRate}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, perKmRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyAllowance">Daily Allowance (₹)</Label>
                    <Input
                      id="dailyAllowance"
                      type="number"
                      value={newPosition.dailyAllowance}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, dailyAllowance: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDailyExpense">Max Daily Expense (₹)</Label>
                    <Input
                      id="maxDailyExpense"
                      type="number"
                      value={newPosition.maxDailyExpense}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, maxDailyExpense: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <Button onClick={handleAddPosition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </div>

              {/* Existing Positions */}
              <div className="space-y-4">
                <h3 className="font-medium">Current Positions</h3>
                {positionRates.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{position.position}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{position.perKmRate}/km | Daily: ₹{position.dailyAllowance} | Max: ₹{position.maxDailyExpense}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const updatedPositions = positionRates.filter((_, i) => i !== index);
                          setPositionRates(updatedPositions);
                          updateSystemSettings({ defaultPositions: updatedPositions });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settingsForm.companyName || ''}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDailyDistance">Max Daily Distance (km)</Label>
                    <Input
                      id="maxDailyDistance"
                      type="number"
                      value={settingsForm.maxDailyDistance || 0}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, maxDailyDistance: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxMonthlyExpense">Max Monthly Expense (₹)</Label>
                    <Input
                      id="maxMonthlyExpense"
                      type="number"
                      value={settingsForm.maxMonthlyExpense || 0}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, maxMonthlyExpense: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="autoApprovalLimit">Auto Approval Limit (₹)</Label>
                    <Input
                      id="autoApprovalLimit"
                      type="number"
                      value={settingsForm.autoApprovalLimit || 0}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, autoApprovalLimit: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settingsForm.requirePhotoForVisits}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, requirePhotoForVisits: checked }))}
                    />
                    <Label>Require Photo for Dealer Visits</Label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleUpdateSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAdminDashboard;
