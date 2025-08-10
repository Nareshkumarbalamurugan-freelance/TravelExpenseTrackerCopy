import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAdminStats, getAllUsersWithStats, getAllPositionRates, getSystemSettings } from '@/lib/adminService';
import { getPendingClaimsForManager, approveClaim, rejectClaim } from '@/lib/database';
import { getActiveSession, getCompletedTrips } from '@/lib/tripSession';

const TEST_MANAGER_ID = 'admin';
const TEST_MANAGER_LEVEL = 'L1';
const TEST_USER_ID = 'test-user';

const TestPage = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAllTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminStats = await getAdminStats();
      const users = await getAllUsersWithStats();
      const positions = await getAllPositionRates();
      const settings = await getSystemSettings();
      const claimsRes = await getPendingClaimsForManager(TEST_MANAGER_LEVEL, TEST_MANAGER_ID);
      const activeSession = await getActiveSession(TEST_USER_ID);
      const completedTrips = await getCompletedTrips(TEST_USER_ID);
      setResults({
        adminStats,
        users,
        positions,
        settings,
        claims: claimsRes.claims,
        activeSession,
        completedTrips: completedTrips.trips,
      });
    } catch (err: any) {
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">System Integration Test Page</h1>
      <Button onClick={runAllTests} disabled={loading}>
        {loading ? 'Running Tests...' : 'Run All Tests'}
      </Button>
      {error && <div className="text-red-600">{error}</div>}
      <div className="mt-6 space-y-4">
        {Object.entries(results).map(([key, value]) => (
          <div key={key}>
            <h2 className="font-semibold text-lg mb-1">{key}</h2>
            <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto max-h-64">{JSON.stringify(value, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPage;
