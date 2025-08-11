
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { getPendingClaimsForManager, approveClaim, rejectClaim, escalateClaim } from '@/lib/database';
import { getEmployeeByIdOrEmail } from '@/lib/employeeService';

const ClaimApprovals = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [action, setAction] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Determine approval level and managerId for current user
  const [level, setLevel] = useState(null);
  const [managerId, setManagerId] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Find if user is L1, L2, or L3 for any employees
    getEmployeeByIdOrEmail(user.email).then(emp => {
      if (!emp) return;
      // For demo, assume user can be L1, L2, or L3
      // In real app, fetch claims for all levels where user is in approvalChain
      (['L1', 'L2', 'L3'] as ('L1' | 'L2' | 'L3')[]).forEach(async (lvl, idx) => {
        const { claims: found, error } = await getPendingClaimsForManager(lvl, emp.id);
        if (error) setError(error);
        if (found && found.length > 0) {
          setLevel(lvl);
          setManagerId(emp.id);
          setClaims(found);
        }
      });
      setLoading(false);
    });
  }, [user]);

  const handleApprove = async (claimId) => {
    setError('');
    const { error } = await approveClaim(claimId);
    if (error) setError(error);
    setClaims(claims => claims.filter(c => c.id !== claimId));
  };

  const handleReject = async (claimId) => {
    setError('');
    if (!action[claimId]?.remarks) return;
    const { error } = await rejectClaim(claimId, action[claimId].remarks);
    if (error) setError(error);
    setClaims(claims => claims.filter(c => c.id !== claimId));
  };

  // Auto-escalate if manager is resigned (not shown in UI, but backend ready)

  return (
    <>
      <SEO title="Claim Approvals" description="Approve or reject employee claims." />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Claim Approvals</h1>
        {loading ? <div>Loading claims...</div> : null}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="space-y-6">
          {claims.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-12">
              <div className="text-lg font-semibold mb-2">No pending claims for your approval.</div>
              <div className="text-xs">(User: {user?.email || user?.uid})</div>
              <div className="text-xs">(ManagerId checked: {managerId || 'N/A'}, Level: {level || 'N/A'})</div>
            </div>
          )}
          {claims.map(claim => (
            <div key={claim.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium">{claim.name}</div>
                  <div className="text-sm text-muted-foreground">Claim ID: {claim.id} | Type: {claim.type} | Amount: ₹{claim.amount}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${claim.status === 'Rejected' ? 'bg-red-100 text-red-700' : claim.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{claim.status}</div>
              </div>
              <div className="mb-2">
                <div className="font-semibold mb-1">Approval Chain</div>
                <ol className="list-decimal pl-6">
                  {claim.managerChain?.map((mgr, idx) => (
                    <li key={mgr} className="mb-1">
                      <span className="font-medium">{['L1','L2','L3'][idx]}: </span>
                      <span>{mgr}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {claim.status === 'Pending' && (
                <div className="mt-4 flex flex-col gap-2">
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    placeholder="Remarks (required for rejection)"
                    value={action[claim.id]?.remarks || ''}
                    onChange={e => setAction(a => ({ ...a, [claim.id]: { ...a[claim.id], remarks: e.target.value } }))}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => handleApprove(claim.id)}
                    >Approve</button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded"
                      disabled={!action[claim.id]?.remarks}
                      onClick={() => handleReject(claim.id)}
                    >Reject</button>
                  </div>
                  <div className="text-xs text-muted-foreground">Rejection requires remarks. Approval will escalate if manager is resigned (handled in backend).</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClaimApprovals;

// ...existing code...
