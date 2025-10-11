import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '../lib/api';
import type { Order, OrderStatus } from '@/types';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const StatusUpdateModal = ({ isOpen, onClose, order }: StatusUpdateModalProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (variables: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(variables.orderId, variables.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ orderId: order.orderId, status });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('ordersPage.updateStatusFor')} #${order.orderId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-secondary">{t('ordersPage.status')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="PENDING">Pending</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end gap-4 pt-4">
           <button type="button" onClick={onClose} className="bg-brand-border/10 hover:bg-brand-border/20 text-brand-primary font-bold py-2.5 px-5 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-brand-primary hover:bg-opacity-90 text-brand-background font-bold py-2.5 px-5 rounded-lg transition-colors transform active:scale-95 flex items-center justify-center w-32"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.saveChanges')}
          </button>
        </div>
        {mutation.isError && <p className="text-red-500 mt-2">Error: {mutation.error.message}</p>}
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;
