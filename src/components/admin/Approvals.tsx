

import React, { useEffect, useState } from 'react';
import { getPendingClaimsForManager, approveClaim, rejectClaim, Claim, ApprovalLevel } from '@/lib/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// TODO: Replace with real admin/manager ID and level from context/auth
const MANAGER_ID = 'admin';
const MANAGER_LEVEL: ApprovalLevel = 'L1';

const Approvals = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      const { claims, error } = await getPendingClaimsForManager(MANAGER_LEVEL, MANAGER_ID);
      if (error) setError(error);
      else setClaims(claims);
    } catch (err) {
      setError('Failed to fetch claims.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (claimId: string) => {
    setActionLoading(claimId);
    await approveClaim(claimId);
    await fetchClaims();
    setActionLoading(null);
  };

  const handleReject = async (claimId: string) => {
    setActionLoading(claimId);
    await rejectClaim(claimId, 'Rejected by admin');
    await fetchClaims();
    setActionLoading(null);
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error) {
    return <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Pending Claims for Approval</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending claims for approval.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{claim.name}</td>
                      <td className="px-4 py-2">{claim.type}</td>
                      <td className="px-4 py-2 text-right">₹{claim.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2">{new Date(claim.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{claim.status}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="success" disabled={actionLoading === claim.id} onClick={() => handleApprove(claim.id!)}>
                          {actionLoading === claim.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button size="sm" variant="destructive" disabled={actionLoading === claim.id} onClick={() => handleReject(claim.id!)}>
                          {actionLoading === claim.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Approvals;