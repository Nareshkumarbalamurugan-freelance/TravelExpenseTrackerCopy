
import React, { useState, useEffect } from 'react';
import { Menu, Users, TrendingUp, Route, DollarSign, Settings, Shield, X } from 'lucide-react';
import SEO from '@/components/SEO';
import Overview from '@/components/admin/Overview';
import Employees from '@/components/admin/Employees';
import Trips from '@/components/admin/Trips';
import Approvals from '@/components/admin/Approvals';
import AdminSettings from '@/components/admin/Settings';
import { Button } from '@/components/ui/button';

const navItems = [
  { key: 'overview', label: 'Overview', icon: <TrendingUp className="h-5 w-5" /> },
  { key: 'employees', label: 'Employees', icon: <Users className="h-5 w-5" /> },
  { key: 'trips', label: 'Trips', icon: <Route className="h-5 w-5" /> },
  { key: 'approvals', label: 'Approvals', icon: <Shield className="h-5 w-5" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'employees':
        return <Employees />;
      case 'trips':
        return <Trips />;
      case 'approvals':
        return <Approvals />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <Overview />;
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex bg-gray-50 relative">
      <SEO 
        title="Admin Dashboard"
        description="Admin panel for managing employees, trips, and system settings"
      />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`z-40 fixed md:static left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg md:shadow-none flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <span className="font-bold text-xl text-blue-700">Admin Panel</span>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.key ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false); // Close sidebar on mobile after selection
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-blue-600" />
          </Button>
          <span className="font-bold text-lg text-blue-700 capitalize">{activeTab}</span>
        </header>
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                <p className="text-gray-600 text-base">Manage your system from here.</p>
              </div>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
