
import React, { useState, useEffect } from 'react';
import { getAdminStats, AdminStats } from '@/lib/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TripSession } from '@/lib/tripSession';

const TripRow = ({ trip }: { trip: TripSession }) => (
  <TableRow>
    <TableCell>
      <div className="font-medium">{trip.userId}</div>
    </TableCell>
    <TableCell>{new Date(trip.startTime).toLocaleString()}</TableCell>
    <TableCell>{trip.endTime ? new Date(trip.endTime).toLocaleString() : 'Ongoing'}</TableCell>
    <TableCell className="text-center">
      <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
        {trip.status}
      </Badge>
    </TableCell>
    <TableCell className="text-right">{trip.totalDistance?.toFixed(2)} km</TableCell>
    <TableCell className="text-right">₹{trip.totalExpense?.toLocaleString('en-IN')}</TableCell>
    <TableCell className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Approve</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

const Trips = () => {
  const [trips, setTrips] = useState<TripSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        const adminStats = await getAdminStats();
        setTrips(adminStats.recentTrips);
        setError(null);
      } catch (err) {
        setError('Failed to fetch trips. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Trips</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Expense</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              trips.map(trip => <TripRow key={trip.id} trip={trip} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Trips;
