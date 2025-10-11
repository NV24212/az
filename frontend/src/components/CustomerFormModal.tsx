import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/types';
import { createCustomer, updateCustomer } from '../lib/api';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

type CustomerData = Omit<Customer, 'customerId'>;

const CustomerFormModal = ({ isOpen, onClose, customer }: CustomerFormModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setAddress(customer.address);
    } else {
      setName('');
      setPhone('');
      setAddress('');
    }
  }, [customer, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: CustomerData) =>
      customer
        ? updateCustomer(customer.customerId, data)
        : createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData: CustomerData = { name, phone, address };
    mutation.mutate(customerData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? t('customerForm.editTitle') : t('customerForm.createTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-secondary">{t('customerForm.name')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-secondary">{t('customerForm.phone')}</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-secondary">{t('customerForm.address')}</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="bg-brand-border/10 hover:bg-brand-border/20 text-brand-primary font-bold py-2.5 px-5 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="bg-brand-primary hover:bg-opacity-90 text-brand-background font-bold py-2.5 px-5 rounded-lg transition-colors transform active:scale-95 flex items-center justify-center w-32"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : (customer ? t('common.saveChanges') : t('common.create'))}
          </button>
        </div>
        {mutation.isError && <p className="text-red-500 mt-2">Error: {mutation.error.message}</p>}
      </form>
    </Modal>
  );
};

export default CustomerFormModal;
