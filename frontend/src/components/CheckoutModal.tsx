import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '../lib/cartStore';
import { apiPost } from '../lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, clearCart } = useCartStore();
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', address: '' });

  const mutation = useMutation({
    mutationFn: async (customerData: CustomerData) => {
      // First, create the customer
      const newCustomer = await apiPost<{ customerId: number }>('/api/customers', customerData);

      // Then, create the order with the new customerId and cart items
      const orderData = {
        customerId: newCustomer.customerId,
        items: items.map(item => ({
          productId: item.product.productId,
          quantity: item.quantity,
        })),
      };
      return apiPost('/api/orders', orderData);
    },
    onSuccess: () => {
      alert('Order placed successfully!');
      clearCart();
      onClose();
    },
    onError: (error) => {
      alert(`Order failed: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(customer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Checkout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input type="text" required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input type="tel" required value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <textarea required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full mt-1 p-2 border rounded-md" rows={3}></textarea>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700" disabled={mutation.isPending}>
              {mutation.isPending ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
