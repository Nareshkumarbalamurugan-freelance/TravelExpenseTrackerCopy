
import React, { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import StatsCard from "@/components/StatsCard";
import { useAuth } from "@/context/AuthContext";
import { getActiveSession, calculateTotalDistance, TripSession } from "@/lib/tripSession";
import { calculateExpenseAmount } from "@/lib/expenseCalculator";
import staticMap from "@/assets/static-map.jpg";


const DailySummary = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<TripSession | null>(null);
  const [distance, setDistance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [dealerVisits, setDealerVisits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { session: activeSession, error } = await getActiveSession(user.uid);
        if (error) {
          setError(error);
          setLoading(false);
          return;
        }
        setSession(activeSession);
        if (activeSession) {
          // Prefer totalDistance if present, else calculate from gpsTrackingPoints
          let dist = 0;
          if (typeof activeSession.totalDistance === 'number') {
            dist = activeSession.totalDistance;
          } else if (activeSession.gpsTrackingPoints && activeSession.gpsTrackingPoints.length > 1) {
            dist = calculateTotalDistance(activeSession.gpsTrackingPoints);
          }
          setDistance(Number(dist.toFixed(2)));
          setDealerVisits(activeSession.dealerVisits || []);
          // Calculate amount using async expense calculator
          const amt = await calculateExpenseAmount(dist, user.position || 'Sales Executive');
          setAmount(amt);
        } else {
          setDistance(0);
          setDealerVisits([]);
          setAmount(0);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [user]);

  return (
    <>
      <SEO title="Daily Summary" description="View today's distance, amount, and dealer visit timeline." canonical="/summary" />
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Daily Summary</h1>
      </header>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4">
            <StatsCard title="Total Distance" value={`${distance} km`} />
            <StatsCard title="Total Amount" value={`₹ ${amount}`} subtitle="Live from admin config" />
          </section>

          <section className="mt-6 animate-fade-in">
            <article>
              <img src={staticMap} alt="Static map with dealer visit pins" loading="lazy" className="w-full rounded-lg" />
            </article>
          </section>

          <section className="mt-6 animate-fade-in">
            <h2 className="text-lg font-medium mb-2">Dealer visits</h2>
            <ul className="space-y-3">
              {dealerVisits.length === 0 && (
                <li className="text-muted-foreground text-sm">No visits yet. Punch dealer locations during your journey.</li>
              )}
              {dealerVisits.map((v, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">{v.timestamp ? new Date(v.timestamp.seconds ? v.timestamp.seconds * 1000 : v.timestamp).toLocaleTimeString() : ''}</span>
                  <span className="font-medium">{v.dealerName || v.location?.name || 'Unknown Dealer'}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
};

export default DailySummary;
