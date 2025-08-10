
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Route, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { getAdminStats, AdminStats } from '@/lib/adminService';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, subtitle, icon, isLoading }: {
  title: string;
  value: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const Overview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const adminStats = await getAdminStats();
        setStats(adminStats);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard statistics. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Employees"
          isLoading={isLoading}
          value={stats?.totalEmployees ?? '--'}
          subtitle={`${stats?.activeEmployees ?? '--'} active`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Trips Today"
          isLoading={isLoading}
          value={stats?.totalTripsToday ?? '--'}
          subtitle={`${stats?.totalTripsThisMonth ?? '--'} this month`}
          icon={<Route className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Distance This Month"
          isLoading={isLoading}
          value={`${(stats?.totalDistanceThisMonth ?? 0).toFixed(2)} km`}
          subtitle="Across all trips"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Expenses This Month"
          isLoading={isLoading}
          value={`₹${(stats?.totalExpensesThisMonth ?? 0).toLocaleString('en-IN')}`}
          subtitle="Total reimbursements"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      
      {/* Placeholder for more detailed analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Recent trips will be displayed here.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Top performers will be displayed here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
