
import React, { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { getCompletedTrips } from "@/lib/tripSession";
import { calculateExpenseAmount } from "@/lib/expenseCalculator";

const TripHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<{ date: string; distanceKm: number; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { trips, error } = await getCompletedTrips(user.uid, 100);
        if (error) {
          setError(error);
          setLoading(false);
          return;
        }
        const getDate = (d: any): Date => {
          if (!d) return new Date(0);
          if (d instanceof Date) return d;
          if (typeof d.toDate === 'function') return d.toDate();
          return new Date(d);
        };
        // Recalculate amount for each trip using latest rates
        const tripHistory = await Promise.all(trips.map(async (trip) => {
          const distanceKm = trip.totalDistance || 0;
          const amount = await calculateExpenseAmount(distanceKm, user.position || 'Sales Executive');
          return {
            date: getDate(trip.startTime).toLocaleDateString(),
            distanceKm,
            amount,
          };
        }));
        setHistory(tripHistory);
      } catch (e: any) {
        setError(e.message || 'Failed to load trip history');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  return (
    <>
      <SEO title="Trip History" description="Review your recent trips, distances, and earnings." canonical="/history" />
      <header className="mb-4 sm:mb-6 animate-fade-in px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold">Trip History</h1>
      </header>

      <section className="animate-fade-in px-2 sm:px-0">
        <div className="rounded-lg border border-border overflow-hidden bg-white">
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Distance (km)</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={3} className="p-3 text-center text-muted-foreground">No trips found.</td></tr>
                  ) : history.map((h, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="p-3">{h.date}</td>
                      <td className="p-3 text-right">{h.distanceKm.toFixed(1)}</td>
                      <td className="p-3 text-right">₹ {h.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default TripHistory;
