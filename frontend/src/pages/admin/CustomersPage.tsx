import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/types';
import { getAdminCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../lib/api';
import Modal from '../../components/Modal';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

type CustomerData = Omit<Customer, 'customerId'>;

interface CustomerFormProps {
  customer: Customer | null;
  onSuccess: () => void;
  onClose: () => void;
}

const CustomerForm = ({ customer, onSuccess, onClose }: CustomerFormProps) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CustomerData) =>
      customer ? updateCustomer(customer.customerId, data) : createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData: CustomerData = { name, phone, address };
    mutation.mutate(customerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-2">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-text-secondary mb-2">Phone</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-brand-text-secondary mb-2">Address</label>
        <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-brand-text font-bold py-2.5 px-5 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center w-32">
          {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Customer'}
        </button>
      </div>
    </form>
  );
};

const CustomersPage = () => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data: customers, isPending, error } = useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: getAdminCustomers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isPending) return <LoadingScreen />;
  if (error) return <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Customers</h1>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={() => setFormOpen(false)}
          onClose={() => setFormOpen(false)}
        />
      </Modal>

      <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="bg-gray-50 border-b border-brand-border">
            <tr>
              <th scope="col" className="p-4">Name</th>
              <th scope="col" className="p-4">Phone</th>
              <th scope="col" className="p-4">Address</th>
              <th scope="col" className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((customer) => (
              <tr key={customer.customerId} className="border-b border-brand-border last:border-b-0">
                <td className="p-4">{customer.name}</td>
                <td className="p-4">{customer.phone}</td>
                <td className="p-4">{customer.address}</td>
                <td className="p-4 flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setFormOpen(true);
                    }}
                    className="text-brand-primary hover:underline"
                  >
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(customer.customerId)} className="text-red-600 hover:underline">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersPage;