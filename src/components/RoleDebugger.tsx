// 🔍 Debug Role Detection Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserRole, UserRole } from '@/lib/roleService';
import { getAllEmployees } from '@/lib/unifiedEmployeeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RoleDebugger: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugRole();
  }, [user]);

  const debugRole = async () => {
    if (!user?.email) return;
    
    console.log('🔍 RoleDebugger: Starting debug for:', user.email);
    setLoading(true);

    try {
      // Get all employees first
      const employees = await getAllEmployees();
      setAllEmployees(employees);
      console.log('📊 RoleDebugger: All employees:', employees);

      // Get user role
      const role = await getUserRole(user.email);
      setUserRole(role);
      console.log('🎯 RoleDebugger: Detected role:', role);

      // Find current user in employees
      const currentEmployee = employees.find(emp => emp.email === user.email);
      console.log('👤 RoleDebugger: Current employee data:', currentEmployee);

    } catch (error) {
      console.error('💥 RoleDebugger: Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading role debug info...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Role Detection Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Current User:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Detected Role:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(userRole, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">All Employees in Database ({allEmployees.length}):</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(allEmployees, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Expected Routing:</h3>
            <p className="p-3 bg-blue-50 rounded">
              {userRole?.type === 'manager' ? '👔 Should route to Manager Dashboard' : 
               userRole?.type === 'admin' ? '👑 Should route to Admin Dashboard' : 
               '👤 Should route to Employee Dashboard'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleDebugger;
