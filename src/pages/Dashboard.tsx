import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { useTrip } from "@/context/TripContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { status, dealersVisitedToday, totalDistanceToday, startJourney, punchDealer, endJourney } = useTrip();

  const onMouseDownRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--ripple-x", `${x}%`);
    e.currentTarget.style.setProperty("--ripple-y", `${y}%`);
  };

  return (
    <>
      <SEO title="Dashboard" description="Travel Expense Tracker dashboard: start/end journeys and punch dealer locations." canonical="/" />
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Travel Expense Tracker Dashboard</h1>
        <p className="text-muted-foreground mt-1">{user?.name} • {user?.position}</p>
      </header>

      <section className="grid gap-4">
        <Button size="xl" variant="success" className="w-full btn-ripple" onMouseDown={onMouseDownRipple} onClick={startJourney} disabled={status === 'in_progress'}>
          Start Journey
        </Button>
        <Button size="xl" variant="info" className="w-full btn-ripple" onMouseDown={onMouseDownRipple} onClick={punchDealer} disabled={status !== 'in_progress'}>
          Punch Dealer Location
        </Button>
        <Button size="xl" variant="destructive" className="w-full btn-ripple" onMouseDown={onMouseDownRipple} onClick={endJourney} disabled={status !== 'in_progress'}>
          End Journey
        </Button>
      </section>

      <section className="mt-6 animate-fade-in">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Current status</div>
              <div className="text-lg font-medium">{status === 'in_progress' ? 'In Progress' : 'Not started'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Dealers visited today</div>
              <div className="text-lg font-medium">{dealersVisitedToday} • {totalDistanceToday} km</div>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
};

export default Dashboard;
