import SEO from "@/components/SEO";
import TripControls from "@/components/TripControls";
import SystemStatusCard from "@/components/SystemStatusCard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Route } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <SEO title="Dashboard" description="Travel Expense Tracker dashboard: start/end journeys and punch dealer locations." canonical="/" />
      
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Travel Expense Tracker</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-muted-foreground">{user?.name} • {user?.position}</p>
          <Badge variant="outline">Firebase + MapMyIndia</Badge>
        </div>
      </header>

      {/* System Status */}
      <section className="mb-6">
        <SystemStatusCard />
      </section>

      {/* Trip Controls - Main functionality */}
      <section className="mb-6">
        <TripControls />
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Today's Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Trips</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Dealers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">0.0</p>
                <p className="text-xs text-muted-foreground">KM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Route className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <MapPin className="h-4 w-4 text-primary" />
                <span>GPS Tracking</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <Clock className="h-4 w-4 text-primary" />
                <span>Auto Calculation</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Start a trip to begin GPS tracking and automatic expense calculation.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Dashboard;
