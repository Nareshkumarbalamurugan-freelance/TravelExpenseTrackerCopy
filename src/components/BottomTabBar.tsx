import { NavLink } from "react-router-dom";
import { Home, MapPin, History, User, Map, FileText, Plus, CheckSquare, Users, BarChart3 } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUserRole, UserRole } from '../lib/roleService';

const TabItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs min-h-[60px] ${
        isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
      } transition-all duration-200 active:bg-gray-100`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

const BottomTabBar = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user?.email) {
      getUserRole(user.email).then(setUserRole);
    }
  }, [user?.email]);

  if (!user || !userRole) return null;

  // Define tabs based on actual role service results
  const getTabsForRole = () => {
    if (userRole.type === 'admin') {
      return [
        { 
          to: '/admin', 
          icon: BarChart3, 
          label: 'Admin',
          key: 'admin'
        },
        { 
          to: '/claims', 
          icon: FileText, 
          label: 'Claims',
          key: 'claims'
        },
        { 
          to: '/new-claim', 
          icon: Plus, 
          label: 'New',
          key: 'new'
        },
        { 
          to: '/profile', 
          icon: User, 
          label: 'Profile',
          key: 'profile'
        }
      ];
    }
    
    if (userRole.type === 'manager') {
      return [
        { 
          to: '/manager-dashboard', 
          icon: Home, 
          label: 'Dashboard',
          key: 'dashboard'
        },
        { 
          to: '/manager-dashboard', 
          icon: CheckSquare, 
          label: 'Approvals',
          key: 'approvals',
          onClick: () => {
            // Scroll to approvals section or switch to approvals tab
            setTimeout(() => {
              const approvalsTab = document.querySelector('[data-value="pending"]');
              if (approvalsTab) {
                (approvalsTab as HTMLElement).click();
              }
            }, 100);
          }
        },
        { 
          to: '/new-claim', 
          icon: Plus, 
          label: 'New',
          key: 'new'
        },
        { 
          to: '/profile', 
          icon: User, 
          label: 'Profile',
          key: 'profile'
        }
      ];
    }
    
    // Default employee tabs
    return [
      { 
        to: '/employee-dashboard', 
        icon: Home, 
        label: 'Home',
        key: 'home'
      },
      { 
        to: '/claims', 
        icon: FileText, 
        label: 'Claims',
        key: 'claims'
      },
      { 
        to: '/new-claim', 
        icon: Plus, 
        label: 'New',
        key: 'new'
      },
      { 
        to: '/profile', 
        icon: User, 
        label: 'Profile',
        key: 'profile'
      }
    ];
  };

  const tabs = getTabsForRole();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {tabs.map((tab) => (
          <TabItem 
            key={tab.key} 
            to={tab.to} 
            icon={tab.icon} 
            label={tab.label} 
            onClick={tab.onClick}
          />
        ))}
      </div>
      <div className="h-[calc(env(safe-area-inset-bottom))] bg-white" />
    </nav>
  );
};

export default BottomTabBar;
