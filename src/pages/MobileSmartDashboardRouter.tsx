// 📱 Mobile Smart Dashboard Router - Routes mobile users to appropriate dashboard based on role
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserRole, UserRole } from '@/lib/roleService';
import MobileDashboard from './MobileDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';
import { useNavigate } from 'react-router-dom';

const MobileSmartDashboardRouter: React.FC = () => {
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

    console.log('📱 MobileSmartDashboardRouter: Determining role for:', user.email);
    setLoading(true);

    try {
      // Add timeout for role determination to prevent infinite loading
      const rolePromise = getUserRole(user.email);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role determination timeout')), 8000)
      );

      const role = await Promise.race([rolePromise, timeoutPromise]) as UserRole;
      setUserRole(role);
      console.log('📱 MobileSmartDashboardRouter: Role determined:', role.type, role.level);

    } catch (error) {
      console.error('💥 MobileSmartDashboardRouter: Error determining role:', error);
      
      // Fallback role determination by email pattern
      if (user.email.includes('admin')) {
        console.log('📱 MobileSmartDashboardRouter: Admin pattern detected in email');
        setUserRole({ type: 'admin' });
      } else if (user.email.includes('mgr') || user.email.includes('manager')) {
        console.log('📱 MobileSmartDashboardRouter: Manager pattern detected in email');
        setUserRole({ type: 'manager', level: 'L1' });
      } else if (user.email.includes('hr')) {
        console.log('📱 MobileSmartDashboardRouter: HR pattern detected in email');
        setUserRole({ type: 'manager', level: 'L2' }); // HR treated as manager
      } else {
        console.log('📱 MobileSmartDashboardRouter: Defaulting to employee role');
        setUserRole({ type: 'employee' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mobile-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Determining user role</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to determine user role</p>
          <button 
            onClick={() => navigate('/mobile-login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  console.log('📱 MobileSmartDashboardRouter: Rendering dashboard for role:', userRole.type);

  // Route to appropriate mobile dashboard based on role
  switch (userRole.type) {
    case 'admin':
      console.log('👑 MobileSmartDashboardRouter: Rendering Admin Dashboard (mobile-optimized)');
      return <AdminDashboard />;
      
    case 'manager':
      console.log('👔 MobileSmartDashboardRouter: Rendering Manager Dashboard (mobile-optimized)');
      return <ManagerDashboard />;
      
    case 'employee':
    default:
      console.log('👤 MobileSmartDashboardRouter: Rendering Employee Dashboard (mobile-optimized)');
      return <MobileDashboard />;
  }
};

export default MobileSmartDashboardRouter;
