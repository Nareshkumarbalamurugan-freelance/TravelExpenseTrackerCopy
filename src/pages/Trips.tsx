
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { getCompletedTrips, TripSession } from '@/lib/tripSession';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const Trips: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getCompletedTrips(user.uid, 20)
      .then(({ trips, error }) => {
        if (error) setError(error);
        setTrips(trips);
      })
      .catch((err) => setError(err.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <SEO title="Trips" description="View and manage your trips." />
      <div className="p-4 sm:p-6 max-w-full">
        <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Trips</h1>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base">Below is a list of your recent trips. You can add filters, sorting, and trip details here.</p>
        <div className="bg-white rounded shadow p-2 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Recent Trips</h2>
          {loading ? (
            <div>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : trips.length === 0 ? (
            <div className="text-muted-foreground">No trips found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Expense (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>{trip.startTime ? new Date(trip.startTime).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{trip.startLocation ? `${trip.startLocation.latitude?.toFixed(3)}, ${trip.startLocation.longitude?.toFixed(3)}` : '-'}</TableCell>
                      <TableCell>{trip.endLocation ? `${trip.endLocation.latitude?.toFixed(3)}, ${trip.endLocation.longitude?.toFixed(3)}` : '-'}</TableCell>
                      <TableCell>{trip.totalDistance ? trip.totalDistance.toFixed(1) : '-'}</TableCell>
                      <TableCell>{trip.totalExpense ? `₹${trip.totalExpense.toFixed(0)}` : '-'}</TableCell>
                      <TableCell>{trip.status || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>Showing your last {trips.length} trips</TableCaption>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Trips;
