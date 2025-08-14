
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">All Employees</h2>
        <Button onClick={() => setShowAddDialog(true)}>Add Employee</Button>
      </div>
      <UnifiedAddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={() => {
          // Refresh the employee list
          fetchEmployees();
        }}
      />
      <div className="overflow-x-auto">
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
