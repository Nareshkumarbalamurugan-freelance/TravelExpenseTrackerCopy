import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin, SystemConfig } from '@/context/AdminContext';
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
  Save
} from 'lucide-react';
import SEO from '@/components/SEO';

const AdminDashboard = () => {
  const { 
    isAdmin, 
    positionRates, 
    systemConfig, 
    adminStats, 
    loading,
    addPositionRate,
    updatePositionRate,
    deletePositionRate,
    updateSystemConfig,
    refreshStats,
    getAllUsers,
    updateUserPosition,
    toggleUserStatus
  } = useAdmin();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newPosition, setNewPosition] = useState({
    name: '',
    ratePerKm: 0,
    dailyAllowance: 0,
    isActive: true
  });
  const [editingConfig, setEditingConfig] = useState(false);
  const [configForm, setConfigForm] = useState<Partial<SystemConfig>>({});

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (systemConfig) {
      setConfigForm(systemConfig);
    }
  }, [systemConfig]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      toast({
        title: "Error loading users",
        description: "Could not fetch user data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPosition.name || newPosition.ratePerKm <= 0) {
      toast({
        title: "Invalid data",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const success = await addPositionRate(newPosition);
    if (success) {
      toast({
        title: "Position added",
        description: `${newPosition.name} has been added successfully`,
      });
      setNewPosition({ name: '', ratePerKm: 0, dailyAllowance: 0, isActive: true });
    } else {
      toast({
        title: "Error",
        description: "Could not add position",
        variant: "destructive"
      });
    }
  };

  const handleUpdateConfig = async () => {
    const success = await updateSystemConfig(configForm);
    if (success) {
      toast({
        title: "Configuration updated",
        description: "System settings have been saved",
      });
      setEditingConfig(false);
    } else {
      toast({
        title: "Error",
        description: "Could not update configuration",
        variant: "destructive"
      });
    }
  };

  const handleTogglePosition = async (id: string, isActive: boolean) => {
    const success = await updatePositionRate(id, { isActive });
    if (success) {
      toast({
        title: isActive ? "Position activated" : "Position deactivated",
        description: "Position status updated successfully",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <SEO title="Access Denied" description="Admin access required" />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                You don't have administrator privileges to access this page.
              </p>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Admin Dashboard" description="System administration and configuration" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage system configuration and users</p>
          </div>
          <Button onClick={refreshStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Statistics Overview */}
        {adminStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{adminStats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Trips</p>
                    <p className="text-2xl font-bold">{adminStats.activeTrips}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trips Today</p>
                    <p className="text-2xl font-bold">{adminStats.totalTripsToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Route className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance Today</p>
                    <p className="text-2xl font-bold">{adminStats.totalDistanceToday.toFixed(1)}km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expense Today</p>
                    <p className="text-2xl font-bold">₹{adminStats.totalExpenseToday.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                    <p className="text-2xl font-bold">{adminStats.averageAccuracy.toFixed(0)}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Admin Tabs */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="positions">Position Rates</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Config</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Position Rates Management */}
          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Position Rates Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Position */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Add New Position</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="positionName">Position Name</Label>
                      <Input
                        id="positionName"
                        value={newPosition.name}
                        onChange={(e) => setNewPosition(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Sales Executive"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ratePerKm">Rate per KM (₹)</Label>
                      <Input
                        id="ratePerKm"
                        type="number"
                        value={newPosition.ratePerKm}
                        onChange={(e) => setNewPosition(prev => ({ ...prev, ratePerKm: Number(e.target.value) }))}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dailyAllowance">Daily Allowance (₹)</Label>
                      <Input
                        id="dailyAllowance"
                        type="number"
                        value={newPosition.dailyAllowance}
                        onChange={(e) => setNewPosition(prev => ({ ...prev, dailyAllowance: Number(e.target.value) }))}
                        placeholder="500"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddPosition} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Position
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing Positions */}
                <div className="space-y-2">
                  <h4 className="font-medium">Current Position Rates</h4>
                  {positionRates.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{position.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{position.ratePerKm}/km + ₹{position.dailyAllowance} daily
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={position.isActive ? "default" : "secondary"}>
                          {position.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={position.isActive}
                          onCheckedChange={(checked) => handleTogglePosition(position.id, checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </div>
                  <Button onClick={loadUsers} variant="outline" size="sm" disabled={isLoadingUsers}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.position || 'No position assigned'} • {user.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                        <select
                          value={user.position || ''}
                          onChange={(e) => updateUserPosition(user.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="">Select Position</option>
                          {positionRates.filter(p => p.isActive).map(position => (
                            <option key={position.id} value={position.name}>
                              {position.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Configuration */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>System Configuration</span>
                  </div>
                  <div className="flex space-x-2">
                    {editingConfig ? (
                      <>
                        <Button onClick={() => setEditingConfig(false)} variant="outline" size="sm">
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateConfig} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditingConfig(true)} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemConfig && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={configForm.companyName || ''}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, companyName: e.target.value }))}
                        disabled={!editingConfig}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDistance">Max Daily Distance (km)</Label>
                      <Input
                        id="maxDistance"
                        type="number"
                        value={configForm.maxDailyDistance || 0}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, maxDailyDistance: Number(e.target.value) }))}
                        disabled={!editingConfig}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxVisits">Max Dealer Visits</Label>
                      <Input
                        id="maxVisits"
                        type="number"
                        value={configForm.maxDealerVisits || 0}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, maxDealerVisits: Number(e.target.value) }))}
                        disabled={!editingConfig}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trackingInterval">GPS Tracking Interval (seconds)</Label>
                      <Input
                        id="trackingInterval"
                        type="number"
                        value={configForm.trackingInterval || 30}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, trackingInterval: Number(e.target.value) }))}
                        disabled={!editingConfig}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minAccuracy">Min Location Accuracy (meters)</Label>
                      <Input
                        id="minAccuracy"
                        type="number"
                        value={configForm.minLocationAccuracy || 100}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, minLocationAccuracy: Number(e.target.value) }))}
                        disabled={!editingConfig}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceMode"
                        checked={configForm.isMaintenanceMode || false}
                        onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, isMaintenanceMode: checked }))}
                        disabled={!editingConfig}
                      />
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>System Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard;
