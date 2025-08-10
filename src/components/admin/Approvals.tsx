
import React, { useState, useEffect } from 'react';
import { getAdminStats, updateTripStatus } from '@/lib/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { TripSession } from '@/lib/tripSession';
import { toast } from 'sonner';

const ApprovalRow = ({ trip, onAction }: { trip: TripSession; onAction: (tripId: string, status: 'approved' | 'rejected') => void }) => (
  <TableRow>
    <TableCell>
      <div className="font-medium">{trip.userId}</div>
    </TableCell>
    <TableCell>{new Date(trip.startTime).toLocaleString()}</TableCell>
    <TableCell className="text-right">₹{trip.totalExpense?.toLocaleString('en-IN')}</TableCell>
    <TableCell className="text-center">
      <Badge variant="secondary">{trip.status}</Badge>
    </TableCell>
    <TableCell className="text-right">
        <Button variant="outline" size="sm" className="mr-2" onClick={() => onAction(trip.id!, 'approved')}><Check className="h-4 w-4 mr-1"/>Approve</Button>
        <Button variant="destructive" size="sm" onClick={() => onAction(trip.id!, 'rejected')}><X className="h-4 w-4 mr-1"/>Reject</Button>
    </TableCell>
  </TableRow>
);

const Approvals = () => {
  const [pendingTrips, setPendingTrips] = useState<TripSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingTrips = async () => {
    try {
      setIsLoading(true);
      const adminStats = await getAdminStats();
      const pending = adminStats.recentTrips.filter(trip => trip.status === 'pending');
      setPendingTrips(pending);
      setError(null);
    } catch (err) {
      setError('Failed to fetch approvals. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTrips();
  }, []);

  const handleAction = async (tripId: string, status: 'approved' | 'rejected') => {
    try {
      await updateTripStatus(tripId, status);
      toast.success(`Trip ${status} successfully!`);
      fetchPendingTrips(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${status} trip. Please try again.`);
      console.error(error);
    }
  };


  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Pending Approvals</h2>
        <p className="text-sm text-muted-foreground">Review and approve or reject employee trip expenses.</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              pendingTrips.length > 0 ? (
                pendingTrips.map(trip => <ApprovalRow key={trip.id} trip={trip} onAction={handleAction} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No pending approvals.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Approvals;
