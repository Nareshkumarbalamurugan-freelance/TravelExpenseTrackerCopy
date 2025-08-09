import SEO from "@/components/SEO";
import { useTrip } from "@/context/TripContext";

const TripHistory = () => {
  const { history } = useTrip();

  return (
    <>
      <SEO title="Trip History" description="Review your recent trips, distances, and earnings." canonical="/history" />
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Trip History</h1>
      </header>

      <section className="animate-fade-in">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Distance (km)</th>
                <th className="text-right p-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="p-3">{h.date}</td>
                  <td className="p-3 text-right">{h.distanceKm.toFixed(1)}</td>
                  <td className="p-3 text-right">₹ {h.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default TripHistory;
