import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Activity, DollarSign, Route, Award, TrendingUp, Menu, User, PlusCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="h-5 w-5" /> },
  { key: 'trips', label: 'Trips', icon: <Route className="h-5 w-5" /> },
  { key: 'claims', label: 'Claims', icon: <DollarSign className="h-5 w-5" /> },
  { key: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const summaryStats = [
  { label: "Today's Trips", value: 2, icon: <Activity className="h-5 w-5 text-blue-500" /> },
  { label: "Monthly Distance", value: '120 km', icon: <Route className="h-5 w-5 text-green-500" /> },
  { label: "Monthly Earnings", value: '₹2,500', icon: <DollarSign className="h-5 w-5 text-yellow-500" /> },
  { label: "Active Streak", value: 5, icon: <Award className="h-5 w-5 text-purple-500" /> },
];

const EnhancedEmployeeDashboard = () => {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SEO title="Employee Dashboard - Travel Expense Tracker" description="Track your trips, expenses, and performance metrics" />
      {/* Sidebar */}
      <aside className={`z-30 fixed md:static left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg md:shadow-none flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-2 px-6 py-6 border-b">
          <Menu className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-blue-700">Travel Tracker</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeNav === item.key ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-6">
          <Button className="w-full bg-blue-600 text-white flex items-center gap-2 justify-center">
            <PlusCircle className="h-5 w-5" /> New Claim
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 bg-gray-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-blue-600" />
          </button>
          <span className="font-bold text-lg text-blue-700">Travel Tracker</span>
          <div className="w-6" />
        </div>

        {/* Header */}
        <div className="max-w-5xl mx-auto w-full px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Welcome, {user?.name || user?.email?.split('@')[0]}!</h1>
          <p className="text-gray-600 text-base mb-6">{user?.position || 'Sales Executive'}</p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {summaryStats.map(stat => (
              <Card key={stat.label} className="flex flex-col items-center justify-center py-6 shadow bg-white border border-gray-200">
                <div className="mb-2">{stat.icon}</div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Main sections (replace with real content as needed) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow bg-white border border-gray-200">
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-500 text-sm">No recent trips found.</div>
              </CardContent>
            </Card>
            <Card className="shadow bg-white border border-gray-200">
              <CardHeader>
                <CardTitle>Expense Claim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-500 text-sm">Submit your expense claims here.</div>
                <Button className="mt-4 w-full bg-blue-600 text-white">New Claim</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom nav for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex md:hidden justify-around py-2 shadow-lg">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium ${activeNav === item.key ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveNav(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Floating action button for new claim on mobile */}
        <button className="fixed bottom-16 right-4 z-40 md:hidden bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 hover:bg-blue-700 transition">
          <PlusCircle className="h-6 w-6" />
        </button>
      </main>
    </div>
  );
};

export default EnhancedEmployeeDashboard;
