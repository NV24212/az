import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/types';

// --- Type Definitions ---
type CustomerData = Omit<Customer, 'customerId'>;

// --- API Helper Functions ---

const getAuthToken = () => localStorage.getItem('admin_token');

const fetchCustomers = async (): Promise<Customer[]> => {
  const token = getAuthToken();
  const response = await fetch('/api/admin/customers/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
};

const createCustomer = async (customerData: CustomerData): Promise<Customer> => {
  const token = getAuthToken();
  const response = await fetch('/api/admin/customers/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });
  if (!response.ok) throw new Error('Failed to create customer');
  return response.json();
};

const updateCustomer = async (data: { id: number; customerData: CustomerData }): Promise<Customer> => {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/customers/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data.customerData),
  });
  if (!response.ok) throw new Error('Failed to update customer');
  return response.json();
};

const deleteCustomer = async (id: number): Promise<Customer> => {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/customers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete customer');
  return response.json();
};

// --- Customer Form Component (as a modal) ---

interface CustomerFormProps {
  customer: Customer | null;
  onSuccess: () => void;
  onClose: () => void;
}

const CustomerFormModal = ({ customer, onSuccess, onClose }: CustomerFormProps) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: customer ? (data: CustomerData) => updateCustomer({ id: customer.customerId, customerData: data }) : createCustomer,
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
        <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}/>
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}/>
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input id="address" value={address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} style={{ background: '#333', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>
              {mutation.isPending ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Customers Page Component ---

const CustomersPage = () => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data: customers, isPending, error } = useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
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

  if (isPending) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Customers</h1>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setFormOpen(true);
          }}
          style={{ background: '#333', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
        >
          Add Customer
        </button>
      </div>

      {isFormOpen && (
        <CustomerFormModal
          customer={selectedCustomer}
          onSuccess={() => setFormOpen(false)}
          onClose={() => setFormOpen(false)}
        />
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Phone</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Address</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers?.map((customer) => (
            <tr key={customer.customerId}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{customer.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{customer.phone}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{customer.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setFormOpen(true);
                  }}
                  style={{ marginRight: '8px' }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(customer.customerId)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersPage;