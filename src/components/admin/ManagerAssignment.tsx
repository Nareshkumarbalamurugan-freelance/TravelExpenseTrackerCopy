// 👔 Manager Assignment Interface - Set Approval Chains for Employees
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllEmployees, updateEmployee, Employee } from '@/lib/unifiedEmployeeService';
import { Settings, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const ManagerAssignment = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const allEmployees = await getAllEmployees();
      setEmployees(allEmployees);
      
      // Filter potential managers (grades that can approve)
      const potentialManagers = allEmployees.filter(emp => 
        ['L1', 'L2', 'L3', 'L4', 'Manager', 'Sr. Manager', 'AGM', 'DGM', 'GM', 'Sr. GM', 'Director'].includes(emp.grade) ||
        emp.designation?.toLowerCase().includes('manager') ||
        emp.designation?.toLowerCase().includes('head') ||
        emp.designation?.toLowerCase().includes('director')
      );
      setManagers(potentialManagers);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApprovalChain = async (employeeId: string, level: 'L1' | 'L2' | 'L3', managerId: string) => {
    setUpdating(`${employeeId}-${level}`);
    
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      const manager = managers.find(mgr => mgr.id === managerId);
      if (!manager) return;

      const updatedApprovalChain = {
        ...employee.approvalChain,
        [level]: manager.name
      };

      await updateEmployee(employeeId, {
        approvalChain: updatedApprovalChain
      });

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, approvalChain: updatedApprovalChain }
          : emp
      ));

      toast({
        title: 'Success',
        description: `${level} manager assigned to ${employee.name}`,
      });
    } catch (error) {
      console.error('Error updating approval chain:', error);
      toast({
        title: 'Error',
        description: 'Failed to update approval chain',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  const getApprovalChainStatus = (employee: Employee) => {
    const { L1, L2, L3 } = employee.approvalChain || {};
    const complete = L1 && L2 && L3;
    const partial = L1 || L2 || L3;
    
    if (complete) return { status: 'complete', color: 'default', text: 'Complete' };
    if (partial) return { status: 'partial', color: 'secondary', text: 'Partial' };
    return { status: 'missing', color: 'destructive', text: 'Not Set' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manager Assignment & Approval Chains
          </CardTitle>
          <CardDescription>
            Assign L1, L2, and L3 managers to employees for the approval workflow.
            L1 = Direct Manager, L2 = HR Manager, L3 = Senior Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Complete Chains</p>
                  <p className="text-2xl font-bold text-green-900">
                    {employees.filter(emp => emp.approvalChain?.L1 && emp.approvalChain?.L2 && emp.approvalChain?.L3).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Partial Chains</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {employees.filter(emp => {
                      const chain = emp.approvalChain;
                      const partial = (chain?.L1 || chain?.L2 || chain?.L3) && !(chain?.L1 && chain?.L2 && chain?.L3);
                      return partial;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">No Chains</p>
                  <p className="text-2xl font-bold text-red-900">
                    {employees.filter(emp => !emp.approvalChain?.L1 && !emp.approvalChain?.L2 && !emp.approvalChain?.L3).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Assignment Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>L1 Manager</TableHead>
                  <TableHead>L2 Manager</TableHead>
                  <TableHead>L3 Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const status = getApprovalChainStatus(employee);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.color as any}>{status.text}</Badge>
                      </TableCell>
                      
                      {/* L1 Manager */}
                      <TableCell>
                        <Select
                          value={employee.approvalChain?.L1 || ''}
                          onValueChange={(value) => {
                            const manager = managers.find(m => m.name === value);
                            if (manager) updateApprovalChain(employee.id, 'L1', manager.id);
                          }}
                          disabled={updating === `${employee.id}-L1`}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select L1" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.name}>
                                {manager.name} ({manager.grade})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      {/* L2 Manager */}
                      <TableCell>
                        <Select
                          value={employee.approvalChain?.L2 || ''}
                          onValueChange={(value) => {
                            const manager = managers.find(m => m.name === value);
                            if (manager) updateApprovalChain(employee.id, 'L2', manager.id);
                          }}
                          disabled={updating === `${employee.id}-L2`}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select L2" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.name}>
                                {manager.name} ({manager.grade})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      {/* L3 Manager */}
                      <TableCell>
                        <Select
                          value={employee.approvalChain?.L3 || ''}
                          onValueChange={(value) => {
                            const manager = managers.find(m => m.name === value);
                            if (manager) updateApprovalChain(employee.id, 'L3', manager.id);
                          }}
                          disabled={updating === `${employee.id}-L3`}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select L3" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.name}>
                                {manager.name} ({manager.grade})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadEmployees()}
                          disabled={!!updating}
                        >
                          Refresh
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerAssignment;
