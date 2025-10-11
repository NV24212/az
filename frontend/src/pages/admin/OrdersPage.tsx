import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderStatus } from '@/types';
import { getAdminOrders, updateOrderStatus } from '../../lib/api';
import LoadingScreen from '../../components/LoadingScreen';
import { format } from 'date-fns';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
    {status}
  </span>
);

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const { data: orders, isPending, error } = useQuery<Order[], Error>({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    mutation.mutate({ orderId, status });
  };

  if (isPending) return <LoadingScreen />;
  if (error) return <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Orders</h1>
      <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="bg-gray-50 border-b border-brand-border">
            <tr>
              <th scope="col" className="p-4">Order ID</th>
              <th scope="col" className="p-4">Customer</th>
              <th scope="col" className="p-4">Total</th>
              <th scope="col" className="p-4">Status</th>
              <th scope="col" className="p-4">Date</th>
              <th scope="col" className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.orderId} className="border-b border-brand-border last:border-b-0">
                <td className="p-4 font-medium">#{order.orderId}</td>
                <td className="p-4">{order.customer?.name || 'N/A'}</td>
                <td className="p-4">${order.totalAmount.toFixed(2)}</td>
                <td className="p-4">
                  <StatusBadge status={order.status as OrderStatus} />
                </td>
                <td className="p-4">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                    className="bg-white border border-brand-border text-brand-text p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;