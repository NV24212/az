import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '../../lib/api';
import { getAdminOrders, updateOrderStatus, deleteOrder } from '../../lib/api';
import OrderTableSkeleton from '../../components/OrderTableSkeleton';

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isError, error } = useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated!');
    },
    onError: (error) => {
      toast.error(`Error updating status: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting order: ${error.message}`);
    }
  });

  const handleDelete = (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteMutation.mutate(orderId);
    }
  };

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  if (isLoading) return <OrderTableSkeleton />;
  if (isError) return <p className="text-red-500">Error fetching orders: {error.message}</p>;

  const buttonDestructiveStyle = "px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors";

  return (
    <div className="animate-fade-in-scale">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {orders?.map((order) => (
              <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{order.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.customerId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                    className="p-1 rounded-md border-slate-300 focus:ring-2 focus:ring-[#742370]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(order.orderId)} className={buttonDestructiveStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
