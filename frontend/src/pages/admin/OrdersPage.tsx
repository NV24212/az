import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// --- API Helper Functions ---

const getAuthToken = () => localStorage.getItem('admin_token');

const fetchOrders = async () => {
  const token = getAuthToken();
  const response = await fetch('/api/admin/orders/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

const updateOrderStatus = async ({ orderId, status }) => {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
};

const deleteOrder = async (orderId) => {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete order');
  return response.json();
};

// --- Status Update Form ---

const StatusUpdateForm = ({ order, onSuccess }) => {
  const [status, setStatus] = useState(order.status);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ orderId: order.orderId, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Updating...' : 'Update Status'}
      </Button>
    </form>
  );
};

// --- Main Orders Page Component ---

const OrdersPage = () => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'SHIPPED': return 'default';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <React.Fragment key={order.orderId}>
              <TableRow>
                <TableCell>#{order.orderId}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>{format(new Date(order.createdAt), 'PPpp')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="space-x-2">
                  <Dialog open={isFormOpen && selectedOrder?.orderId === order.orderId} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(order); setFormOpen(true); }}>
                        Update Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Order #{order.orderId}</DialogTitle>
                      </DialogHeader>
                      <StatusUpdateForm order={order} onSuccess={() => { setFormOpen(false); setSelectedOrder(null); }} />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the order.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(order.orderId)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
              {/* Collapsible row for order items */}
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <div className="p-4 bg-slate-50">
                    <h4 className="font-semibold mb-2">Order Items:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price at Purchase</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.orderItemId}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.priceAtPurchase.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersPage;