
import React, { useState, useEffect } from 'react';
import { getAllUsersWithStats, AdminUser } from '@/lib/adminService';
import AddEmployeeDialog from './AddEmployeeDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const EmployeeRow = ({ user }: { user: AdminUser }) => (
  <TableRow>
    <TableCell>
      <div className="font-medium">{user.name}</div>
      <div className="text-sm text-muted-foreground">{user.email}</div>
    </TableCell>
    <TableCell>{user.position}</TableCell>
    <TableCell className="text-center">
      <Badge variant={user.isActive ? 'default' : 'destructive'}>
        {user.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </TableCell>
    <TableCell className="text-right">{user.totalTrips}</TableCell>
    <TableCell className="text-right">{user.totalDistance.toFixed(2)} km</TableCell>
    <TableCell className="text-right">₹{user.totalExpenses.toLocaleString('en-IN')}</TableCell>
    <TableCell className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit User</DropdownMenuItem>
          <DropdownMenuItem>View Trips</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

const Employees = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const userList = await getAllUsersWithStats();
        setUsers(userList);
        setError(null);
      } catch (err) {
        setError('Failed to fetch employees. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
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
      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={() => {
          // Refresh the employee list
          fetchUsers();
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
            ) : (
              users.map(user => <EmployeeRow key={user.id} user={user} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Employees;
