import React, { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { getCompletedTrips } from "@/lib/tripSession";


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
        const tripHistory = trips.map((trip) => ({
          date: getDate(trip.startTime).toLocaleDateString(),
          distanceKm: trip.totalDistance || 0,
          amount: trip.totalExpense || 0,
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
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Trip History</h1>
      </header>

      <section className="animate-fade-in">
        <div className="rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <table className="w-full text-sm">
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
          )}
        </div>
      </section>
    </>
  );
};

export default TripHistory;
