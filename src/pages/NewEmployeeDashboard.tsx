import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Activity, DollarSign, Route, Award, TrendingUp, Menu, User, PlusCircle, History, FilePlus, FileText } from 'lucide-react';
import TripControls from '@/components/TripControls';
import { useTrip } from '@/context/TripContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef } from 'react';
import { createClaim } from '@/lib/database';
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


const NewEmployeeDashboard = () => {
  const { user } = useAuth();
  const { history } = useTrip();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimType, setClaimType] = useState('Travel');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimReceipt, setClaimReceipt] = useState<File|null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's claims (status)
  useEffect(() => {
    // TODO: Replace with real backend call for user's claims
    // setClaimStatus([]);
  }, []);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    // TODO: Upload receipt to storage and get URL
    let receiptUrl = '';
    if (claimReceipt) {
      // Simulate upload
      receiptUrl = URL.createObjectURL(claimReceipt);
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
                  {history.length === 0 ? (
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
                <Dialog open={claimModalOpen} onOpenChange={setClaimModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-2 w-full bg-blue-600 text-white">
                      <PlusCircle className="h-5 w-5" /> New Claim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Expense Claim</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleClaimSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="claim-type">Type</Label>
                        <Input id="claim-type" value={claimType} onChange={e => setClaimType(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="claim-amount">Amount</Label>
                        <Input id="claim-amount" type="number" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} required min={1} />
                      </div>
                      <div>
                        <Label htmlFor="claim-desc">Description</Label>
                        <Input id="claim-desc" value={claimDesc} onChange={e => setClaimDesc(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="claim-receipt">Receipt (optional)</Label>
                        <Input id="claim-receipt" type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={e => setClaimReceipt(e.target.files?.[0] || null)} />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full bg-blue-600 text-white" disabled={claimLoading}>
                          {claimLoading ? 'Submitting...' : 'Submit Claim'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                {/* Claim status list */}
                <div className="mt-6">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-sm"><FileText className="h-4 w-4" /> My Claims</div>
                  {claimStatus.length === 0 ? (
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
                          </tr>
                        </thead>
                        <tbody>
                          {claimStatus.map((c, idx) => (
                            <tr key={idx} className="border-t border-border">
                              <td className="p-2">{c.type}</td>
                              <td className="p-2 text-right">₹ {c.amount}</td>
                              <td className="p-2">{c.status}</td>
                              <td className="p-2">{c.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
