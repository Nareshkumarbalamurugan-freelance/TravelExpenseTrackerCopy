
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { Claim } from '@/lib/database';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const Claims: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchClaims = async () => {
      try {
        const q = query(
          collection(db, 'claims'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Claim[];
        setClaims(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [user]);

  return (
    <>
      <SEO title="Claims" description="View and manage your claims." />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Claims</h1>
        <p className="mb-4">Below is a list of your recent claims. You can add claim status, filters, and actions here.</p>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Claims</h2>
          {loading ? (
            <div>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : claims.length === 0 ? (
            <div className="text-muted-foreground">No claims found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.date ? new Date(claim.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{claim.type || '-'}</TableCell>
                    <TableCell>{claim.amount ? `₹${claim.amount}` : '-'}</TableCell>
                    <TableCell>{claim.status || '-'}</TableCell>
                    <TableCell>{claim.policy || '-'}</TableCell>
                    <TableCell>{claim.remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Showing your last {claims.length} claims</TableCaption>
            </Table>
          )}
        </div>
      </div>
    </>
  );
};

export default Claims;
