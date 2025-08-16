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
  const [approving, setApproving] = useState<string | null>(null); // Track which claim is being processed
  const [rejecting, setRejecting] = useState<string | null>(null);

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
        await loadClaims(role.managedEmployees, role.level, role.employee?.employeeId);
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

  const loadClaims = async (employeeIds: string[], managerLevel?: ApprovalLevel, managerId?: string) => {
    console.log('📋 ManagerDashboard: Loading claims for manager level:', managerLevel);
    console.log('📋 ManagerDashboard: managerId passed:', managerId);
    console.log('📋 ManagerDashboard: managerLevel passed:', managerLevel);
    console.log('📋 ManagerDashboard: employeeIds:', employeeIds);
    
    if (!managerId || !managerLevel) {
      console.log('❌ ManagerDashboard: Missing manager info for claim loading');
      console.log('❌ ManagerDashboard: managerId check:', !!managerId);
      console.log('❌ ManagerDashboard: managerLevel check:', !!managerLevel);
      return;
    }

    try {
      console.log('📋 ManagerDashboard: Calling getPendingClaimsForManager with:', { managerId, managerLevel });
      
      // Get pending claims for this manager at their level
      const pending = await getPendingClaimsForManager(managerId, managerLevel);
      console.log('📋 ManagerDashboard: Received pending claims:', pending);
      
      setPendingClaims(pending);

      // For now, we'll skip approved claims to keep it simple
      // TODO: Implement getApprovedClaimsForManager
      setApprovedClaims([]);

      console.log('📋 ManagerDashboard: Successfully loaded', pending.length, 'pending claims');
      
      if (pending.length === 0) {
        console.log('⚠️ ManagerDashboard: No pending claims found. Debugging info:', {
          managerId,
          managerLevel,
          expectedStatus: `pending_${managerLevel.toLowerCase()}`,
          managedEmployees: employeeIds
        });
      }
      
    } catch (error) {
      console.error('💥 ManagerDashboard: Error loading claims:', error);
      setPendingClaims([]);
      setApprovedClaims([]);
      
      // Show user-friendly error
      toast({
        title: 'Error Loading Claims',
        description: 'Failed to load pending claims. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    console.log('✅ ManagerDashboard: Approving claim:', claimId);
    setApproving(claimId); // Set loading state
    
    if (!userRole?.employee?.employeeId || !userRole.level) {
      console.error('❌ ManagerDashboard: Missing manager info for approval');
      toast({
        title: 'Error',
        description: 'Manager information not available. Please refresh the page.',
        variant: 'destructive'
      });
      setApproving(null);
      return;
    }
    
    try {
      console.log('✅ ManagerDashboard: Calling approveClaim with:', {
        claimId,
        approverId: userRole.employee.employeeId,
        approverName: userRole.employee.name,
        approverEmail: userRole.employee.email,
        level: userRole.level
      });
      
      const result = await approveClaim(
        claimId,
        userRole.employee.employeeId,
        userRole.employee.name,
        userRole.employee.email,
        userRole.level,
        'Approved by manager'
      );

      console.log('✅ ManagerDashboard: Approval result:', result);

      if (result.success) {
        // Refresh the claims list
        if (userRole.managedEmployees) {
          console.log('🔄 ManagerDashboard: Refreshing claims list after approval');
          await loadClaims(userRole.managedEmployees, userRole.level, userRole.employee?.employeeId);
        }

        toast({
          title: 'Claim Approved',
          description: `The expense claim has been approved and moved to ${result.data?.newStatus === 'approved' ? 'final approval' : 'next approval level'}`,
        });
      } else {
        throw new Error(result.error || 'Unknown approval error');
      }
    } catch (error: any) {
      console.error('💥 ManagerDashboard: Error approving claim:', error);
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve claim. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setApproving(null); // Clear loading state
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    console.log('❌ ManagerDashboard: Rejecting claim:', claimId);
    setRejecting(claimId); // Set loading state
    
    if (!userRole?.employee?.employeeId || !userRole.level) {
      console.error('❌ ManagerDashboard: Missing manager info for rejection');
      toast({
        title: 'Error',
        description: 'Manager information not available. Please refresh the page.',
        variant: 'destructive'
      });
      setRejecting(null);
      return;
    }

    // TODO: In a real app, show a dialog to collect rejection reason
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason || rejectionReason.trim() === '') {
      toast({
        title: 'Rejection Cancelled',
        description: 'A rejection reason is required.',
        variant: 'destructive'
      });
      setRejecting(null);
      return;
    }
    
    try {
      console.log('❌ ManagerDashboard: Calling rejectClaim with:', {
        claimId,
        approverId: userRole.employee.employeeId,
        approverName: userRole.employee.name,
        approverEmail: userRole.employee.email,
        level: userRole.level,
        rejectionReason
      });
      
      const result = await rejectClaim(
        claimId,
        userRole.employee.employeeId,
        userRole.employee.name,
        userRole.employee.email,
        userRole.level,
        rejectionReason
      );

      console.log('❌ ManagerDashboard: Rejection result:', result);

      if (result.success) {
        // Refresh the claims list
        if (userRole.managedEmployees) {
          console.log('🔄 ManagerDashboard: Refreshing claims list after rejection');
          await loadClaims(userRole.managedEmployees, userRole.level, userRole.employee?.employeeId);
        }

        toast({
          title: 'Claim Rejected',
          description: 'The expense claim has been rejected and employee will be notified.',
        });
      } else {
        throw new Error(result.error || 'Unknown rejection error');
      }
    } catch (error: any) {
      console.error('💥 ManagerDashboard: Error rejecting claim:', error);
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject claim. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRejecting(null); // Clear loading state
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

    // Helper function to safely format dates
  const formatDate = (date: any): string => {
    try {
      if (!date) return 'N/A';
      if (date instanceof Date) return date.toLocaleDateString();
      if (typeof date?.toDate === 'function') return date.toDate().toLocaleDateString();
      if (typeof date === 'string') return new Date(date).toLocaleDateString();
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Helper function to format currency
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
    <div className="min-h-screen bg-gray-50 py-4 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Welcome back, {userRole.employee?.name}! You are an {userRole.level} level manager.
          </p>
        </div>

        {/* Overview Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Managed</p>
                  <p className="text-lg md:text-2xl font-bold">{managedEmployees.length}</p>
                </div>
                <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                  <Eye className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg md:text-2xl font-bold text-orange-600">{pendingClaims.length}</p>
                </div>
                <div className="bg-orange-100 p-2 md:p-3 rounded-full">
                  <Clock className="h-4 w-4 md:h-6 md:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">{approvedClaims.length}</p>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-full">
                  <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
                  <p className="text-sm md:text-xl font-bold">{formatCurrency(
                    [...pendingClaims, ...approvedClaims].reduce((sum, claim) => sum + claim.amount, 0)
                  )}</p>
                </div>
                <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                  <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
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
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="pending" data-value="pending" className="text-xs md:text-sm">
                  <span className="hidden md:inline">Pending Approvals</span>
                  <span className="md:hidden">Pending</span>
                  <span className="ml-1">({pendingClaims.length})</span>
                </TabsTrigger>
                <TabsTrigger value="approved" data-value="approved" className="text-xs md:text-sm">
                  <span className="hidden md:inline">Approved Claims</span>
                  <span className="md:hidden">Approved</span>
                  <span className="ml-1">({approvedClaims.length})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-4 md:mt-6">
                {pendingClaims.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending claims requiring your approval</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile View - Card Layout */}
                    <div className="md:hidden space-y-4">
                      {pendingClaims.map((claim) => (
                        <Card key={claim.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">{claim.employeeName}</h3>
                                <p className="text-sm text-gray-600 capitalize">{claim.type} • {formatDate(claim.date)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{formatCurrency(claim.amount)}</p>
                                {getStatusBadge(claim.status)}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-700 mb-1">{claim.description}</p>
                              {claim.location && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {claim.location}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveClaim(claim.id)}
                                disabled={approving === claim.id || rejecting === claim.id}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {approving === claim.id ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectClaim(claim.id)}
                                disabled={approving === claim.id || rejecting === claim.id}
                                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {rejecting === claim.id ? 'Rejecting...' : 'Reject'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop View - Table Layout */}
                    <div className="hidden md:block">
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
                              <TableCell>{formatDate(claim.date)}</TableCell>
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
                                    disabled={approving === claim.id || rejecting === claim.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {approving === claim.id ? 'Approving...' : 'Approve'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleRejectClaim(claim.id)}
                                    disabled={approving === claim.id || rejecting === claim.id}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {rejecting === claim.id ? 'Rejecting...' : 'Reject'}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="approved" className="mt-4 md:mt-6">
                {approvedClaims.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No approved claims yet</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile View - Card Layout */}
                    <div className="md:hidden space-y-4">
                      {approvedClaims.map((claim) => (
                        <Card key={claim.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">{claim.employeeName}</h3>
                                <p className="text-sm text-gray-600 capitalize">{claim.type} • {formatDate(claim.date)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{formatCurrency(claim.amount)}</p>
                                {getStatusBadge(claim.status)}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-700 mb-1">{claim.description}</p>
                              {claim.location && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {claim.location}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop View - Table Layout */}
                    <div className="hidden md:block">
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
                              <TableCell>{formatDate(claim.date)}</TableCell>
                              <TableCell className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {claim.location || 'N/A'}
                              </TableCell>
                              <TableCell>{getStatusBadge(claim.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Managed Employees */}
        <Card className="mt-6 md:mt-8">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Your Team</CardTitle>
            <CardDescription>
              Employees under your management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {managedEmployees.map((employee) => (
                <Card key={employee.id} className="p-3 md:p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm md:text-base">{employee.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600">{employee.designation}</p>
                    <p className="text-xs md:text-sm text-gray-600">{employee.department}</p>
                    <Badge variant="outline" className="text-xs">{employee.grade}</Badge>
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
