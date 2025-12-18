import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/utils';

const API_URL = API_BASE_URL;

interface OrderAnalytics {
  totalOrders: number;
  successfulOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface GrowthMetrics {
  dayWiseGrowth: number;
  weekGrowth: number;
  monthGrowth: number;
  repeatCustomers: number;
}

export function Analytics() {
  const [todayAnalytics, setTodayAnalytics] = useState<OrderAnalytics | null>(null);
  const [weekAnalytics, setWeekAnalytics] = useState<any>(null);
  const [monthAnalytics, setMonthAnalytics] = useState<any>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [todayRes, weekRes, monthRes, growthRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/today`),
        axios.get(`${API_URL}/api/analytics/week`),
        axios.get(`${API_URL}/api/analytics/month`),
        axios.get(`${API_URL}/api/analytics/growth`)
      ]);

      setTodayAnalytics(todayRes.data.analytics);
      setWeekAnalytics(weekRes.data.analytics);
      setMonthAnalytics(monthRes.data.analytics);
      setGrowthMetrics(growthRes.data.metrics);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 mb-6">
        <CardContent className="pt-6 text-red-800">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders (Today)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAnalytics?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayAnalytics?.successfulOrders || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Today)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(todayAnalytics?.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ₹{(todayAnalytics?.averageOrderValue || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthMetrics?.dayWiseGrowth || 0}%</div>
            <p className="text-xs text-muted-foreground">vs yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthMetrics?.repeatCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly & Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{weekAnalytics?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">₹{(weekAnalytics?.totalRevenue || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-semibold">₹{(weekAnalytics?.averageOrderValue || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-muted-foreground">Weekly Growth</span>
                <span className="font-semibold text-green-600">{growthMetrics?.weekGrowth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{monthAnalytics?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">₹{(monthAnalytics?.totalRevenue || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-semibold">₹{(monthAnalytics?.averageOrderValue || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-muted-foreground">Monthly Growth</span>
                <span className="font-semibold text-green-600">{growthMetrics?.monthGrowth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
