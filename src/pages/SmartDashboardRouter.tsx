// 🎯 Smart Dashboard Router - Routes users to appropriate dashboard based on role
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserRole, UserRole } from '@/lib/roleService';
import NewEmployeeDashboard from './NewEmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import { useNavigate } from 'react-router-dom';

const SmartDashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    determineUserRole();
  }, [user]);

  const determineUserRole = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    console.log('🎯 SmartDashboardRouter: Determining role for:', user.email);
    setLoading(true);

    try {
      // Add timeout for role determination to prevent infinite loading
      const rolePromise = getUserRole(user.email);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role determination timeout')), 8000)
      );

      const role = await Promise.race([rolePromise, timeoutPromise]) as UserRole;
      setUserRole(role);
      console.log('🎯 SmartDashboardRouter: Role determined:', role.type, role.level);

      // If admin, redirect to admin dashboard
      if (role.type === 'admin') {
        console.log('👑 SmartDashboardRouter: Admin detected, redirecting to admin dashboard');
        navigate('/admin');
        return;
      }

    } catch (error) {
      console.error('💥 SmartDashboardRouter: Error determining role:', error);
      
      // Check if this is an admin user by email pattern
      if (user.email.includes('admin')) {
        console.log('🔑 SmartDashboardRouter: Admin email detected, routing to admin');
        navigate('/admin');
        return;
      }
      
      // For other users, default to employee dashboard
      console.log('🎯 SmartDashboardRouter: Defaulting to employee role due to error');
      setUserRole({ type: 'employee' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your dashboard...</h2>
          <p className="text-gray-600 mb-4">Determining your role and permissions</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">This may take a few seconds for first-time setup</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to determine user role</h2>
          <p className="text-gray-600">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Route based on user role
  console.log('🎯 SmartDashboardRouter: Rendering dashboard for role:', userRole.type);
  console.log('🎯 SmartDashboardRouter: User details:', { 
    email: user?.email, 
    name: user?.name, 
    role: userRole 
  });
  
  switch (userRole.type) {
    case 'manager':
      console.log('👔 SmartDashboardRouter: Routing to Manager Dashboard');
      return <ManagerDashboard />;
    case 'employee':
    default:
      console.log('👤 SmartDashboardRouter: Routing to Employee Dashboard');
      return <NewEmployeeDashboard />;
  }
};

export default SmartDashboardRouter;
