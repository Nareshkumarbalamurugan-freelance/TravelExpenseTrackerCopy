import SEO from "@/components/SEO";
import StatsCard from "@/components/StatsCard";
import { useTrip } from "@/context/TripContext";
import staticMap from "@/assets/static-map.jpg";

const DailySummary = () => {
  const { totalDistanceToday, visits } = useTrip();
  const totalAmount = Math.round(totalDistanceToday * 20);

  return (
    <>
      <SEO title="Daily Summary" description="View today's distance, amount, and dealer visit timeline." canonical="/summary" />
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Daily Summary</h1>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <StatsCard title="Total Distance" value={`${totalDistanceToday} km`} />
        <StatsCard title="Total Amount" value={`₹ ${totalAmount}`} subtitle="Calculated later" />
      </section>

      <section className="mt-6 animate-fade-in">
        <article>
          <img src={staticMap} alt="Static map with dealer visit pins" loading="lazy" className="w-full rounded-lg" />
        </article>
      </section>

      <section className="mt-6 animate-fade-in">
        <h2 className="text-lg font-medium mb-2">Dealer visits</h2>
        <ul className="space-y-3">
          {visits.length === 0 && (
            <li className="text-muted-foreground text-sm">No visits yet. Punch dealer locations during your journey.</li>
          )}
          {visits.map((v, i) => (
            <li key={i} className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">{v.time}</span>
              <span className="font-medium">{v.locationName}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default DailySummary;
