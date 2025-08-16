// 📊 Monthly Travel Dashboard - Admin view of travel limits and usage
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllMonthlyTravelData, MonthlyTravelData } from '@/lib/travelLimitService';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, Calendar } from 'lucide-react';

const MonthlyTravelDashboard = () => {
  const [travelData, setTravelData] = useState<MonthlyTravelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadTravelData();
  }, [selectedMonth]);

  const loadTravelData = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMonthlyTravelData(selectedMonth);
      setTravelData(data);
    } catch (error) {
      console.error('Error loading travel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  const calculateSummaryStats = () => {
    const totalEmployees = travelData.length;
    const totalSpent = travelData.reduce((sum, emp) => sum + emp.totalAmount, 0);
    const employeesOverLimit = travelData.filter(emp => emp.exceedsLimit).length;
    const totalLimits = travelData.reduce((sum, emp) => sum + emp.policyLimit, 0);
    const utilizationRate = totalLimits > 0 ? (totalSpent / totalLimits) * 100 : 0;

    return {
      totalEmployees,
      totalSpent,
      employeesOverLimit,
      utilizationRate: Math.round(utilizationRate)
    };
  };

  const stats = calculateSummaryStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Travel Dashboard</h2>
          <p className="text-gray-600">Monitor travel expenses and policy compliance</p>
        </div>
        
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateMonthOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Over Limit</p>
                <p className="text-2xl font-bold text-red-900">{stats.employeesOverLimit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-purple-900">{stats.utilizationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Travel Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employee Travel Summary
          </CardTitle>
          <CardDescription>
            Monthly travel expenses and policy compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {travelData.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No travel data found for {selectedMonth}. Claims will appear here once submitted.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-center p-3 font-medium">Claims</th>
                    <th className="text-right p-3 font-medium">Total Amount</th>
                    <th className="text-right p-3 font-medium">Policy Limit</th>
                    <th className="text-right p-3 font-medium">Remaining</th>
                    <th className="text-right p-3 font-medium">Fuel Claims</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {travelData.map((employee, index) => (
                    <tr key={employee.id || index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{employee.employeeName}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{employee.totalClaims}</Badge>
                      </td>
                      <td className="p-3 text-right font-medium">
                        ₹{employee.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        ₹{employee.policyLimit.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <span className={employee.remainingLimit < 1000 ? 'text-red-600' : 'text-green-600'}>
                          ₹{employee.remainingLimit.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div>
                          <span className="font-medium">{employee.fuelClaims}</span>
                          <div className="text-sm text-gray-500">
                            ₹{employee.fuelAmount.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {employee.exceedsLimit ? (
                          <Badge variant="destructive">Over Limit</Badge>
                        ) : employee.remainingLimit < 1000 ? (
                          <Badge variant="secondary">Near Limit</Badge>
                        ) : (
                          <Badge variant="default">Within Limit</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyTravelDashboard;
