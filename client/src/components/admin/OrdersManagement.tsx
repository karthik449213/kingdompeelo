import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useOrderUpdates, useDashboardSocket, playNotificationSound } from '@/hooks/useSocket';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface OrderItem {
  dishName: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryType: string;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const statusFlow = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const { socket, isConnected } = useDashboardSocket();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/payments/orders`, {
        params: {
          status: statusFilter || undefined,
          limit: 50
        }
      });

      setOrders(response.data.orders);
      applyFilters(response.data.orders);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (ordersList: Order[]) => {
    let filtered = ordersList;

    if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (searchPhone) {
      filtered = filtered.filter(o => 
        o.customerPhone.includes(searchPhone) || 
        o.orderId.includes(searchPhone)
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    applyFilters(orders);
  }, [searchPhone]);

  // Listen for real-time order updates
  useOrderUpdates(
    (newOrder) => {
      // Play notification sound when new order arrives
      playNotificationSound();
      
      // Add new order to list
      setOrders(prev => [newOrder as Order, ...prev]);
      setFilteredOrders(prev => [newOrder as Order, ...prev]);
    },
    (data) => {
      // Update order status
      setOrders(prev => 
        prev.map(order => 
          order.orderId === data.orderId 
            ? { ...order, status: data.status }
            : order
        )
      );
      applyFilters(orders);
    }
  );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);

      await axios.put(
        `${API_URL}/api/payments/orders/${orderId}/status`,
        { status: newStatus }
      );

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      applyFilters(orders);

      setSelectedOrder(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by phone or order ID..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {statusFlow.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Items</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Payment</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{order.orderId}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{order.items.length} items</td>
                      <td className="py-3 px-4 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {order.payment.method} ({order.payment.status})
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.deliveryType}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedOrder && selectedOrder._id === order._id && (
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - {selectedOrder.orderId}</DialogTitle>
                                <DialogDescription>
                                  Manage order status and view details
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-semibold">{selectedOrder.customerName}</p>
                                    <p className="text-sm">{selectedOrder.customerPhone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Order Type</p>
                                    <p className="font-semibold">{selectedOrder.deliveryType}</p>
                                  </div>
                                </div>

                                {/* Items */}
                                <div className="border rounded p-3">
                                  <p className="text-sm font-semibold mb-2">Items</p>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                      <div key={idx} className="text-sm flex justify-between">
                                        <span>{item.dishName} x{item.quantity}</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="border rounded p-3">
                                  <div className="flex justify-between font-semibold">
                                    <span>Total Amount</span>
                                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>

                                {/* Status Update */}
                                <div className="border rounded p-3">
                                  <p className="text-sm font-semibold mb-2">Update Status</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {statusFlow.filter(s => 
                                      statusFlow.indexOf(s) >= statusFlow.indexOf(selectedOrder.status)
                                    ).map(status => (
                                      <Button
                                        key={status}
                                        size="sm"
                                        variant={selectedOrder.status === status ? "default" : "outline"}
                                        onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                                        disabled={updatingOrder === selectedOrder._id}
                                      >
                                        {updatingOrder === selectedOrder._id ? (
                                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        ) : null}
                                        {status.replace(/_/g, ' ')}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
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
}

export default OrdersManagement;
