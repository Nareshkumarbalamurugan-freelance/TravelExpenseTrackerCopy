// 👔 Manager Dashboard - Specialized interface for managers to approve claims
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { getUserRole, UserRole, getRolePermissions } from '@/lib/roleService';
import { getAllEmployees, Employee } from '@/lib/unifiedEmployeeService';
import { 
  getPendingClaimsForManager, 
  approveClaim, 
  rejectClaim, 
  Claim,
  ApprovalLevel 
} from '@/lib/claimsService';
import { CheckCircle, XCircle, Clock, Eye, DollarSign, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [managedEmployees, setManagedEmployees] = useState<Employee[]>([]);
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [approvedClaims, setApprovedClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagerData();
  }, [user]);

  const loadManagerData = async () => {
    if (!user?.email) return;
    
    console.log('👔 ManagerDashboard: Loading manager data for:', user.email);
    setLoading(true);
    
    try {
      // Get user role
      const role = await getUserRole(user.email);
      setUserRole(role);
      console.log('👔 ManagerDashboard: User role determined:', role);

      if (role.type === 'manager' && role.managedEmployees) {
        // Get managed employees details
        const allEmployees = await getAllEmployees();
        const managed = allEmployees.filter(emp => 
          role.managedEmployees?.includes(emp.employeeId)
        );
        setManagedEmployees(managed);
        console.log('👔 ManagerDashboard: Managing', managed.length, 'employees');

        // Load claims for managed employees
        await loadClaims(role.managedEmployees, role.level);
      }
    } catch (error) {
      console.error('💥 ManagerDashboard: Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load manager dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async (employeeIds: string[], managerLevel?: ApprovalLevel) => {
    console.log('📋 ManagerDashboard: Loading claims for manager level:', managerLevel);
    
    if (!userRole?.employee?.employeeId || !managerLevel) {
      console.log('❌ ManagerDashboard: Missing manager info for claim loading');
      return;
    }

    try {
      // Get pending claims for this manager at their level
      const pending = await getPendingClaimsForManager(userRole.employee.employeeId, managerLevel);
      setPendingClaims(pending);

      // For now, we'll skip approved claims to keep it simple
      // In a full implementation, you'd get approved claims this manager has processed
      setApprovedClaims([]);

      console.log('📋 ManagerDashboard: Loaded', pending.length, 'pending claims');
    } catch (error) {
      console.error('💥 ManagerDashboard: Error loading claims:', error);
      setPendingClaims([]);
      setApprovedClaims([]);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    console.log('✅ ManagerDashboard: Approving claim:', claimId);
    
    if (!userRole?.employee || !userRole.level) {
      console.error('❌ ManagerDashboard: Missing manager info for approval');
      return;
    }
    
    try {
      const result = await approveClaim(
        claimId,
        userRole.employee.employeeId,
        userRole.employee.name,
        userRole.employee.email,
        userRole.level,
        'Approved by manager'
      );

      if (result.success) {
        // Refresh the claims list
        if (userRole.managedEmployees) {
          await loadClaims(userRole.managedEmployees, userRole.level);
        }

        toast({
          title: 'Claim Approved',
          description: `The expense claim has been approved and moved to ${result.data?.newStatus === 'approved' ? 'final approval' : 'next approval level'}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('💥 ManagerDashboard: Error approving claim:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve claim',
        variant: 'destructive'
      });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    console.log('❌ ManagerDashboard: Rejecting claim:', claimId);
    
    if (!userRole?.employee || !userRole.level) {
      console.error('❌ ManagerDashboard: Missing manager info for rejection');
      return;
    }

    // For demo, using a simple rejection reason. In real app, you'd show a dialog
    const rejectionReason = 'Rejected by manager - insufficient documentation';
    
    try {
      const result = await rejectClaim(
        claimId,
        userRole.employee.employeeId,
        userRole.employee.name,
        userRole.employee.email,
        userRole.level,
        rejectionReason
      );

      if (result.success) {
        // Refresh the claims list
        if (userRole.managedEmployees) {
          await loadClaims(userRole.managedEmployees, userRole.level);
        }

        toast({
          title: 'Claim Rejected',
          description: 'The expense claim has been rejected',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('💥 ManagerDashboard: Error rejecting claim:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject claim',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: Claim['status']) => {
    const statusConfig = {
      'pending_l1': { label: 'Pending L1', variant: 'secondary' as const, icon: Clock },
      'pending_l2': { label: 'Pending L2', variant: 'secondary' as const, icon: Clock },
      'pending_l3': { label: 'Pending L3', variant: 'secondary' as const, icon: Clock },
      'approved': { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userRole || userRole.type !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">This dashboard is only accessible to managers.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userRole.employee?.name}! You are an {userRole.level} level manager.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Managed Employees</p>
                  <p className="text-2xl font-bold">{managedEmployees.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingClaims.length}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                  <p className="text-2xl font-bold text-green-600">{approvedClaims.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(
                    [...pendingClaims, ...approvedClaims].reduce((sum, claim) => sum + claim.amount, 0)
                  )}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Management */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Claims Management</CardTitle>
            <CardDescription>
              Review and approve expense claims from your team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Pending Approvals ({pendingClaims.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved Claims ({approvedClaims.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-6">
                {pendingClaims.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending claims requiring your approval</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.employeeName}</TableCell>
                          <TableCell className="capitalize">{claim.type}</TableCell>
                          <TableCell>{formatCurrency(claim.amount)}</TableCell>
                          <TableCell>{claim.date.toLocaleDateString()}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {claim.location || 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveClaim(claim.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleRejectClaim(claim.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="approved" className="mt-6">
                {approvedClaims.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No approved claims yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.employeeName}</TableCell>
                          <TableCell className="capitalize">{claim.type}</TableCell>
                          <TableCell>{formatCurrency(claim.amount)}</TableCell>
                          <TableCell>{claim.date.toLocaleDateString()}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {claim.location || 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Managed Employees */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Team</CardTitle>
            <CardDescription>
              Employees under your management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managedEmployees.map((employee) => (
                <Card key={employee.id} className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.designation}</p>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                    <Badge variant="outline">{employee.grade}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
