import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Order, OrderStatus } from '@/types';

// --- API Helper Functions ---

const getAuthToken = () => localStorage.getItem('admin_token');

const fetchOrders = async (): Promise<Order[]> => {
  const token = getAuthToken();
  const response = await fetch('/api/admin/orders/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

const updateOrderStatus = async ({ orderId, status }: { orderId: number; status: OrderStatus }): Promise<Order> => {
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

const deleteOrder = async (orderId: number): Promise<Order> => {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete order');
  return response.json();
};

// --- Status Update Form (as a modal) ---

interface StatusUpdateFormProps {
  order: Order;
  onSuccess: () => void;
  onClose: () => void;
}

const StatusUpdateModal = ({ order, onSuccess, onClose }: StatusUpdateFormProps) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ orderId: order.orderId, status });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
        <h2>Update Order #{order.orderId}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
            <option value="PENDING">Pending</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
             <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} style={{ background: '#333', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>
              {mutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Orders Page Component ---

const OrdersPage = () => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isPending, error } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isPending) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Orders</h1>
      {isFormOpen && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onSuccess={() => setFormOpen(false)}
          onClose={() => setFormOpen(false)}
        />
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}></th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Order ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Customer</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Total</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <React.Fragment key={order.orderId}>
              <tr >
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => toggleExpand(order.orderId)}>
                    {expandedOrderId === order.orderId ? '-' : '+'}
                  </button>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>#{order.orderId}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.customer.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{format(new Date(order.createdAt), 'PPpp')}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#eee' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${order.totalAmount.toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                   <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setFormOpen(true);
                      }}
                      style={{ marginRight: '8px' }}
                    >
                      Update Status
                    </button>
                    <button onClick={() => handleDelete(order.orderId)}>
                      Delete
                    </button>
                </td>
              </tr>
              {expandedOrderId === order.orderId && (
                <tr>
                  <td colSpan={7} style={{ padding: '16px', background: '#f9f9f9' }}>
                    <h4>Order Items:</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                       <thead>
                          <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Product</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantity</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Price at Purchase</th>
                          </tr>
                        </thead>
                       <tbody>
                        {order.items.map((item) => (
                          <tr key={item.orderItemId}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.product.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>${item.priceAtPurchase.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;