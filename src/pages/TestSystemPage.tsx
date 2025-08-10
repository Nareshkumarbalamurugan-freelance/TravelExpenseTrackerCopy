
import React, { useState } from 'react';
import { getActiveSession, getCompletedTrips } from '@/lib/tripSession';
import { useAuth } from '@/context/AuthContext';
import { calculateExpenseAmount } from '@/lib/expenseCalculator';
// Placeholder for master data and manager tree (to be replaced with real API/data)
const mockMasterData = {
  employeeId: 'EMP001',
  name: 'Naresh Kumar',
  grade: 'L2',
  policy: 'Standard',
  entitlement: 'Travel, Hotel, Food',
  reportingManager: 'L1 Manager',
  phone: '+91-9876543210',
  email: 'nareshkumarbalamurugan@gmail.com',
};
const mockManagerTree = [
  { level: 'L1', name: 'L1 Manager', status: 'Active' },
  { level: 'L2', name: 'HR Manager', status: 'Active' },
  { level: 'L3', name: 'Director', status: 'Active' },
];

const TestSystemPage = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [expense, setExpense] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Claim creation state
  const [claimType, setClaimType] = useState('Travel');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimReceipt, setClaimReceipt] = useState<File | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  // Approval simulation state
  const [approvalLevel, setApprovalLevel] = useState('L1');
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [managerResigned, setManagerResigned] = useState(false);
  // Password reset simulation
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resetStep, setResetStep] = useState(1);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('Not logged in');
      // 1. Fetch active session
      const { session, error: sessionError } = await getActiveSession(user.uid);
      setActiveSession(session);
      if (sessionError) throw new Error(sessionError);
      // 2. Fetch completed trips
      const { trips, error: tripsError } = await getCompletedTrips(user.uid, 5);
      setCompletedTrips(trips);
      if (tripsError) throw new Error(tripsError);
      // 3. Calculate expense for last trip
      if (trips.length > 0) {
        const lastTrip = trips[0];
        const amt = await calculateExpenseAmount(lastTrip.totalDistance || 0, user.position);
        setExpense(amt);
      } else {
        setExpense(null);
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">A-Z System Integration Test Page</h1>
      {/* 1. Employee Master Data */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Employee Master Data</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(mockMasterData, null, 2)}</pre>
      </section>
      {/* 2. Policy & Entitlement Check */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Policy & Entitlement</h2>
        <div className="bg-gray-100 p-2 rounded text-xs">{mockMasterData.policy} | Entitlement: {mockMasterData.entitlement}</div>
      </section>
      {/* 3. Claim Creation (with receipt required) */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Create Claim (Receipt Required)</h2>
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); setClaimError(''); if (!claimReceipt && claimType !== 'Allowance') { setClaimError('Receipt is mandatory for non-allowance claims'); return; } setClaimError('Simulated: Claim submitted!'); }}>
          <div>
            <label className="block text-xs">Type</label>
            <select value={claimType} onChange={e => setClaimType(e.target.value)} className="border p-1 rounded">
              <option value="Travel">Travel</option>
              <option value="Hotel">Hotel</option>
              <option value="Food">Food</option>
              <option value="Allowance">Allowance</option>
              <option value="Joint Working">Joint Working</option>
            </select>
          </div>
          <div>
            <label className="block text-xs">Amount</label>
            <input type="number" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} className="border p-1 rounded" required />
          </div>
          <div>
            <label className="block text-xs">Description</label>
            <input value={claimDesc} onChange={e => setClaimDesc(e.target.value)} className="border p-1 rounded" required />
          </div>
          <div>
            <label className="block text-xs">Receipt Attachment {claimType !== 'Allowance' && <span className="text-red-500">*</span>}</label>
            <input type="file" accept="image/*,application/pdf" onChange={e => setClaimReceipt(e.target.files?.[0] || null)} className="border p-1 rounded" />
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Submit Claim</button>
          {claimError && <div className="text-red-500 text-xs mt-1">{claimError}</div>}
        </form>
      </section>
      {/* 4. Approval Workflow Simulation */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Approval Workflow Simulation</h2>
        <div className="mb-2">Current Level: <b>{approvalLevel}</b> {managerResigned && approvalLevel === 'L1' && <span className="text-yellow-600">(Manager Resigned, auto-escalated)</span>}</div>
        <div className="flex gap-2 mb-2">
          <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => { setApprovalAction('Approved'); setApprovalLevel(approvalLevel === 'L1' ? 'L2' : approvalLevel === 'L2' ? 'L3' : 'Completed'); }}>Approve</button>
          <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => setApprovalAction('Rejected')}>Reject</button>
          <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => { setManagerResigned(true); setApprovalLevel('L2'); }}>Simulate Manager Resigned</button>
        </div>
        {approvalAction === 'Rejected' && (
          <div className="mb-2">
            <label className="block text-xs">Remarks (required for rejection)</label>
            <input value={approvalRemarks} onChange={e => setApprovalRemarks(e.target.value)} className="border p-1 rounded" required />
          </div>
        )}
        {claimType === 'Joint Working' && (
          <div className="mb-2">
            <label className="block text-xs">Joint Working Remarks</label>
            <input className="border p-1 rounded" placeholder="Enter remarks" />
          </div>
        )}
        <div className="text-xs mt-2">Approval Action: <b>{approvalAction}</b> {approvalAction === 'Rejected' && approvalRemarks && <span> | Remarks: {approvalRemarks}</span>}</div>
      </section>
      {/* 5. Manager Tree (placeholder) */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Manager Tree (L1, L2, L3)</h2>
        <table className="w-full text-xs bg-gray-100 rounded">
          <thead><tr><th>Level</th><th>Name</th><th>Status</th></tr></thead>
          <tbody>{mockManagerTree.map(m => <tr key={m.level}><td>{m.level}</td><td>{m.name}</td><td>{m.status}</td></tr>)}</tbody>
        </table>
      </section>
      {/* 6. Password Reset Simulation */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Password Reset (OTP Simulation)</h2>
        {resetStep === 1 && (
          <form className="space-y-2" onSubmit={e => { e.preventDefault(); setOtpSent(true); setResetStep(2); }}>
            <div>
              <label className="block text-xs">Registered Email</label>
              <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="border p-1 rounded" required />
            </div>
            <div>
              <label className="block text-xs">Registered Phone</label>
              <input value={resetPhone} onChange={e => setResetPhone(e.target.value)} className="border p-1 rounded" required />
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Send OTP</button>
          </form>
        )}
        {resetStep === 2 && (
          <form className="space-y-2" onSubmit={e => { e.preventDefault(); setResetStep(3); }}>
            <div>
              <label className="block text-xs">Enter OTP</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} className="border p-1 rounded" required />
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Verify OTP</button>
          </form>
        )}
        {resetStep === 3 && <div className="text-green-600">OTP Verified! (Simulated)</div>}
      </section>
      {/* 7. Real Data Checks (Session, Trips, Expense) */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Live Data Checks</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded mb-2"
          onClick={runTests}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run All Live Data Tests'}
        </button>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="mb-2">
          <h3 className="font-semibold">Active Session</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{activeSession ? JSON.stringify(activeSession, null, 2) : 'None'}</pre>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Recent Completed Trips</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{completedTrips.length ? JSON.stringify(completedTrips, null, 2) : 'None'}</pre>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Expense Calculation (Last Trip)</h3>
          <div className="bg-gray-100 p-2 rounded text-xs">{expense !== null ? `₹ ${expense}` : 'N/A'}</div>
        </div>
      </section>
      {/* 8. Admin Checks (if user is admin) */}
      {user && user.position && user.position.toLowerCase().includes('admin') && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Admin Checks</h2>
          <div className="bg-gray-100 p-2 rounded text-xs mb-2">Admin dashboard, approvals, system settings, and employee management should be checked via the main UI. (This section can be expanded with more admin API checks as needed.)</div>
        </section>
      )}
    </div>
  );
};

export default TestSystemPage;
