
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getAllEmployees, Employee } from '@/lib/unifiedEmployeeService';
import { Skeleton } from '@/components/ui/skeleton';
import UnifiedAddEmployeeDialog from './UnifiedAddEmployeeDialog';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const EmployeeRow: React.FC<{ employee: Employee }> = ({ employee }) => (
  <TableRow>
    <TableCell>
      <div>
        <div className="font-medium">{employee.name}</div>
        <div className="text-sm text-gray-500">{employee.email}</div>
        <div className="text-sm text-gray-500">ID: {employee.employeeId}</div>
      </div>
    </TableCell>
    <TableCell>
      <div>
        <div className="font-medium">{employee.designation || 'Not specified'}</div>
        <div className="text-sm text-gray-500">{employee.department}</div>
        <div className="text-sm text-gray-500">Grade: {employee.grade}</div>
      </div>
    </TableCell>
    <TableCell className="text-center">
      <Badge variant={employee.active ? "default" : "secondary"}>
        {employee.active ? "Active" : "Inactive"}
      </Badge>
    </TableCell>
    <TableCell className="text-right">0</TableCell>
    <TableCell className="text-right">0.00 km</TableCell>
    <TableCell className="text-right">₹0</TableCell>
    <TableCell className="text-right">
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </TableCell>
  </TableRow>
);

const EmployeeCard: React.FC<{ employee: Employee }> = ({ employee }) => (
  <Card>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{employee.name}</h3>
            <p className="text-xs text-gray-500">{employee.email}</p>
            <p className="text-xs text-gray-500">ID: {employee.employeeId}</p>
          </div>
          <Badge variant={employee.active ? "default" : "secondary"} className="text-xs">
            {employee.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs"><span className="font-medium">Position:</span> {employee.designation || 'Not specified'}</p>
          <p className="text-xs"><span className="font-medium">Department:</span> {employee.department}</p>
          <p className="text-xs"><span className="font-medium">Grade:</span> {employee.grade}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
          <div>
            <p className="text-xs font-medium">Trips</p>
            <p className="text-xs text-gray-600">0</p>
          </div>
          <div>
            <p className="text-xs font-medium">Distance</p>
            <p className="text-xs text-gray-600">0.00 km</p>
          </div>
          <div>
            <p className="text-xs font-medium">Expenses</p>
            <p className="text-xs text-gray-600">₹0</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="w-full text-xs">
          Edit Employee
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchEmployees = async () => {
    try {
      console.log('📋 Employees: Fetching employees with unified service...');
      setIsLoading(true);
      const employeeList = await getAllEmployees();
      console.log('✅ Employees: Found', employeeList.length, 'employees');
      setEmployees(employeeList);
      setError(null);
    } catch (err) {
      console.error('💥 Employees: Error fetching employees:', err);
      setError('Failed to fetch employees. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-3 md:p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h2 className="text-base md:text-lg font-semibold">All Employees</h2>
        <Button onClick={() => setShowAddDialog(true)} size="sm" className="w-full md:w-auto">
          Add Employee
        </Button>
      </div>
      <UnifiedAddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={() => {
          // Refresh the employee list
          fetchEmployees();
        }}
      />
      
      {/* Mobile Card Layout */}
      <div className="md:hidden p-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No employees found. Add your first employee!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map(employee => <EmployeeCard key={employee.id} employee={employee} />)}
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Total Trips</TableHead>
              <TableHead className="text-right">Total Distance</TableHead>
              <TableHead className="text-right">Total Expenses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No employees found. Add your first employee!
                </TableCell>
              </TableRow>
            ) : (
              employees.map(employee => <EmployeeRow key={employee.id} employee={employee} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Employees;
