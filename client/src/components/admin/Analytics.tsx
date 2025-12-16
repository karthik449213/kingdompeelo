import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useOrderUpdates, useDashboardSocket } from '@/hooks/useSocket';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const COLORS = ['#0ea5e9', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444'];

interface OrderAnalytics {
  totalOrders: number;
  successfulOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  paymentMethods: {
    phonepe: { count: number; amount: number };
    cod: { count: number; amount: number };
  };
  orderTypes: {
    delivery: { count: number; amount: number };
    dineIn: { count: number; amount: number };
  };
  peakHours: Array<{ hour: number; orders: number; revenue: number }>;
  topDishes: Array<{ dishName: string; count: number; revenue: number }>;
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

  const { socket, isConnected } = useDashboardSocket();

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

    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewOrder = () => {
      // Refresh analytics when new order arrives
      fetchAnalytics();
    };

    const handleStatusUpdate = () => {
      // Refresh analytics when order status changes
      fetchAnalytics();
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket, isConnected]);

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Order Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAnalytics?.peakHours && todayAnalytics.peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={todayAnalytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    formatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => value}
                    labelFormatter={(label) => `${label}:00`}
                  />
                  <Bar dataKey="orders" fill="#0ea5e9" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAnalytics?.paymentMethods && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'PhonePe', value: todayAnalytics.paymentMethods.phonepe.count },
                      { name: 'COD', value: todayAnalytics.paymentMethods.cod.count }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Dishes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Dishes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAnalytics?.topDishes && todayAnalytics.topDishes.slice(0, 5).map((dish, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{dish.dishName}</p>
                    <p className="text-xs text-muted-foreground">{dish.count} sold</p>
                  </div>
                  <p className="font-semibold">₹{dish.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Order Types</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAnalytics?.orderTypes && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Delivery', value: todayAnalytics.orderTypes.delivery.count },
                      { name: 'Dine In', value: todayAnalytics.orderTypes.dineIn.count }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
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
