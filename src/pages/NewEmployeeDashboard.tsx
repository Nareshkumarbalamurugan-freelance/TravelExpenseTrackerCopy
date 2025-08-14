import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Activity, DollarSign, Route, Award, TrendingUp, Menu, User, PlusCircle, History, FilePlus, FileText } from 'lucide-react';
import TripControls from '@/components/TripControls';
import { getCompletedTrips, TripSession } from '@/lib/tripSession';
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef } from 'react';
import { createClaim } from '@/lib/database';
import { uploadClaimReceipt } from '@/lib/adminService';
import { getClaimsForEmployee, ClaimStatus } from '@/lib/claimsService';
import SEO from '@/components/SEO';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="h-5 w-5" />, path: '/dashboard' },
  { key: 'trips', label: 'Trips', icon: <Route className="h-5 w-5" />, path: '/trips' },
  { key: 'claims', label: 'Claims', icon: <DollarSign className="h-5 w-5" />, path: '/claims' },
  { key: 'profile', label: 'Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
];

const summaryStats = [
  { label: "Today's Trips", value: 2, icon: <Activity className="h-5 w-5 text-blue-500" /> },
  { label: "Monthly Distance", value: '120 km', icon: <Route className="h-5 w-5 text-green-500" /> },
  { label: "Monthly Earnings", value: '₹2,500', icon: <DollarSign className="h-5 w-5 text-yellow-500" /> },
  { label: "Active Streak", value: 5, icon: <Award className="h-5 w-5 text-purple-500" /> },
];


const NewEmployeeDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<{
    date: string;
    distanceKm: number;
    amount: number;
  }[]>([]);
  const [summaryStats, setSummaryStats] = useState([
    { label: "Today's Trips", value: 0, icon: <Activity className="h-5 w-5 text-blue-500" /> },
    { label: "Monthly Distance", value: '0 km', icon: <Route className="h-5 w-5 text-green-500" /> },
    { label: "Monthly Earnings", value: '₹0', icon: <DollarSign className="h-5 w-5 text-yellow-500" /> },
    { label: "Active Streak", value: 0, icon: <Award className="h-5 w-5 text-purple-500" /> },
  ]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimType, setClaimType] = useState('Travel');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimReceipt, setClaimReceipt] = useState<File|null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<any[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Load real trip history and summary stats from Firestore
  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { trips, error } = await getCompletedTrips(user.uid, 30);
        if (error) {
          setLoading(false);
          return;
        }
        // Map trips to history rows
        // Helper to get JS Date from Firestore Timestamp or Date
        const getDate = (d: any): Date => {
          if (!d) return new Date(0);
          if (d instanceof Date) return d;
          if (typeof d.toDate === 'function') return d.toDate();
          return new Date(d);
        };
        const tripHistory = trips.map((trip) => ({
          date: getDate(trip.startTime).toLocaleDateString(),
          distanceKm: trip.totalDistance || 0,
          amount: trip.totalExpense || 0,
        }));
        setHistory(tripHistory);

        // Calculate summary stats
        const today = new Date();
        const isSameDay = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        const isSameMonth = (d: Date) => d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        let todaysTrips = 0, monthlyDistance = 0, monthlyEarnings = 0;
        let streak = 0;
        let lastDate: string | null = null;
        // Sort trips by date descending
        const sortedTrips = [...trips].sort((a, b) => {
          const da = getDate(a.startTime);
          const db = getDate(b.startTime);
          return db.getTime() - da.getTime();
        });
        for (const trip of sortedTrips) {
          const d = getDate(trip.startTime);
          if (isSameDay(d)) todaysTrips++;
          if (isSameMonth(d)) {
            monthlyDistance += trip.totalDistance || 0;
            monthlyEarnings += trip.totalExpense || 0;
          }
        }
        // Calculate active streak (consecutive days with trips)
        for (const trip of sortedTrips) {
          const d = getDate(trip.startTime);
          const dateStr = d.toDateString();
          if (lastDate === null) {
            lastDate = dateStr;
            streak = 1;
          } else {
            const prev = new Date(lastDate);
            const diff = (prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              streak++;
              lastDate = dateStr;
            } else if (diff > 1) {
              break;
            }
          }
        }
        setSummaryStats([
          { label: "Today's Trips", value: todaysTrips, icon: <Activity className="h-5 w-5 text-blue-500" /> },
          { label: "Monthly Distance", value: `${monthlyDistance.toFixed(1)} km`, icon: <Route className="h-5 w-5 text-green-500" /> },
          { label: "Monthly Earnings", value: `₹${monthlyEarnings}`, icon: <DollarSign className="h-5 w-5 text-yellow-500" /> },
          { label: "Active Streak", value: streak, icon: <Award className="h-5 w-5 text-purple-500" /> },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  // Load claims for employee
  useEffect(() => {
    const fetchClaims = async () => {
      if (!user?.email) return;
      
      setClaimsLoading(true);
      try {
        const claims = await getClaimsForEmployee(user.email);
        setMyClaims(claims);
        console.log('📋 Employee claims loaded:', claims.length);
      } catch (error) {
        console.error('💥 Error loading claims:', error);
      } finally {
        setClaimsLoading(false);
      }
    };

    fetchClaims();
  }, [user]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    let receiptUrl = '';
    try {
      if (claimReceipt) {
        // Upload to Firebase Storage and get URL
        receiptUrl = await uploadClaimReceipt(user?.uid + '-' + Date.now(), claimReceipt);
      }
      const { id, error } = await createClaim({
        userId: user?.uid,
        employeeId: user?.uid || '',
        name: user?.name || '',
        grade: user?.position || '',
        policy: 'Standard',
        type: claimType,
        amount: Number(claimAmount),
        date: new Date(),
        description: claimDesc,
        receipt: receiptUrl,
        remarks: '',
        managerChain: [],
      });
      setClaimLoading(false);
      if (!error) {
        setClaimModalOpen(false);
        setClaimType('Travel');
        setClaimAmount('');
        setClaimDesc('');
        setClaimReceipt(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // TODO: Refresh claim status list
      } else {
        alert('Failed to submit claim: ' + error);
      }
    } catch (err: any) {
      setClaimLoading(false);
      alert('Failed to submit claim: ' + (err?.message || 'Unknown error'));
    }
  };

  // Send claim to manager (stub)
  const handleSendToManager = async (claim: any) => {
    // TODO: Implement actual email/notification logic here
    alert(`Claim sent to manager for claim ID: ${claim.id || claim.type}`);
  };

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
              onClick={() => {
                setActiveNav(item.key);
                setSidebarOpen(false);
                navigate(item.path);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-6">
          <Button className="w-full bg-blue-600 text-white flex items-center gap-2 justify-center" onClick={() => navigate('/new-claim')}>
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

        {/* Desktop header and grid layout */}
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Welcome, {user?.name || user?.email?.split('@')[0]}!</h1>
              <p className="text-gray-600 text-base">{user?.position || 'Sales Executive'}</p>
            </div>
            <div className="hidden md:flex gap-4">
              <Button className="bg-blue-600 text-white flex items-center gap-2"><PlusCircle className="h-5 w-5" /> New Claim</Button>
            </div>
          </div>

          {/* Summary cards - improved for desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {summaryStats.map(stat => (
              <Card key={stat.label} className="flex flex-col items-center justify-center py-8 shadow bg-white border border-gray-200 hover:shadow-lg transition">
                <div className="mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Main sections - desktop grid, feature-rich */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Trip Controls (Live Trip, GPS, Expense) */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
              <Card className="shadow bg-white border border-gray-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" /> Live Trip Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TripControls />
                </CardContent>
              </Card>
              {/* Trip History Section */}
              <Card className="shadow bg-white border border-gray-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Recent Trip History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-gray-500 text-sm">Loading...</div>
                  ) : history.length === 0 ? (
                    <div className="text-gray-500 text-sm">No trips found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2 font-medium">Date</th>
                            <th className="text-right p-2 font-medium">Distance (km)</th>
                            <th className="text-right p-2 font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.slice(0, 5).map((h, idx) => (
                            <tr key={idx} className="border-t border-border">
                              <td className="p-2">{h.date}</td>
                              <td className="p-2 text-right">{h.distanceKm.toFixed(1)}</td>
                              <td className="p-2 text-right">₹ {h.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 text-right">
                        <a href="/history" className="text-blue-600 text-xs hover:underline">View all</a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Expense Claim (to be replaced with modal/feature) */}
            <Card className="shadow bg-white border border-gray-200 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePlus className="h-5 w-5" /> Expense Claim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-500 text-sm mb-2">Submit your expense claims here.</div>
                <Button 
                  className="mt-2 w-full bg-blue-600 text-white"
                  onClick={() => navigate('/new-claim')}
                >
                  <PlusCircle className="h-5 w-5" /> New Claim
                </Button>
                {/* My Claims section with real data */}
                <div className="mt-6">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" /> My Claims
                  </div>
                  {claimsLoading ? (
                    <div className="text-xs text-gray-400">Loading claims...</div>
                  ) : myClaims.length === 0 ? (
                    <div className="text-xs text-gray-400">No claims submitted yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2 font-medium">Type</th>
                            <th className="text-right p-2 font-medium">Amount</th>
                            <th className="text-left p-2 font-medium">Status</th>
                            <th className="text-left p-2 font-medium">Date</th>
                            <th className="text-left p-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myClaims.slice(0, 5).map((claim, idx) => (
                            <tr key={claim.id || idx} className="border-t border-border">
                              <td className="p-2 capitalize">{claim.type}</td>
                              <td className="p-2 text-right">₹{claim.amount?.toLocaleString()}</td>
                              <td className="p-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  claim.status === 'pending_l1' || claim.status === 'pending_l2' || claim.status === 'pending_l3' 
                                    ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {claim.status === 'pending_l1' ? 'Pending L1' :
                                   claim.status === 'pending_l2' ? 'Pending L2' :
                                   claim.status === 'pending_l3' ? 'Pending L3' :
                                   claim.status}
                                </span>
                              </td>
                              <td className="p-2">
                                {claim.createdAt ? new Date(claim.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-2 truncate max-w-20" title={claim.description}>
                                {claim.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {myClaims.length > 5 && (
                        <div className="mt-2 text-right">
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate('/claims')}
                            className="text-blue-600 text-xs hover:underline p-0"
                          >
                            View all claims
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

export default NewEmployeeDashboard;
