import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Order } from '@/types';
import { getAdminOrders, deleteOrder } from '../../lib/api';
import LoadingScreen from '../../components/LoadingScreen';
import ConfirmationModal from '../../components/ConfirmationModal';
import StatusUpdateModal from '../../components/StatusUpdateModal';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersPage = () => {
  const { t } = useTranslation();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isPending, error } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: getAdminOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleDelete = (id: number) => {
    setDeletingOrderId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingOrderId) {
      deleteMutation.mutate(deletingOrderId);
    }
    setIsConfirmModalOpen(false);
    setDeletingOrderId(null);
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setFormOpen(true);
  };

  if (isPending) return <LoadingScreen fullScreen={false} />;
  if (error) return <div>Error: {error.message}</div>;

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-500/20 text-green-300';
      case 'SHIPPED':
        return 'bg-blue-500/20 text-blue-300';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300';
      case 'PENDING':
      default:
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-primary mb-8">{t('ordersPage.title')}</h1>

      {isFormOpen && selectedOrder && (
        <StatusUpdateModal
          isOpen={isFormOpen}
          order={selectedOrder}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('ordersPage.confirmDeleteTitle')}
        message={t('ordersPage.confirmDeleteMessage')}
      />

      <div className="bg-black/20 border border-brand-border rounded-20 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-brand-border font-bold text-sm text-brand-secondary">
          <div className="col-span-1"></div>
          <div className="col-span-2">{t('ordersPage.orderId')}</div>
          <div className="col-span-3">{t('ordersPage.customer')}</div>
          <div className="col-span-2">{t('ordersPage.date')}</div>
          <div className="col-span-2">{t('ordersPage.status')}</div>
          <div className="col-span-1 text-right">{t('ordersPage.total')}</div>
          <div className="col-span-1 text-right">{t('ordersPage.actions')}</div>
        </div>
        <div>
          {orders?.map((order) => (
            <React.Fragment key={order.orderId}>
              <div className="grid grid-cols-12 px-6 py-4 items-center border-b border-brand-border last:border-b-0 hover:bg-black/10 transition-colors">
                <div className="col-span-1">
                  <button onClick={() => toggleExpand(order.orderId)} className="text-brand-secondary hover:text-brand-primary">
                    {expandedOrderId === order.orderId ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                <div className="col-span-2 text-brand-primary font-medium">#{order.orderId}</div>
                <div className="col-span-3 text-brand-primary">{order.customer.name}</div>
                <div className="col-span-2 text-brand-secondary text-sm">{format(new Date(order.createdAt), 'PPpp')}</div>
                <div className="col-span-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(order.status)}`}>
                    {t(`ordersPage.statuses.${order.status}`)}
                  </span>
                </div>
                <div className="col-span-1 text-right text-brand-primary font-semibold">${order.totalAmount.toFixed(2)}</div>
                <div className="col-span-1 text-right flex justify-end gap-3">
                   <button onClick={() => handleOpenModal(order)} className="text-brand-secondary hover:text-brand-primary">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(order.orderId)} className="text-brand-secondary hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
              <AnimatePresence>
                {expandedOrderId === order.orderId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/20 overflow-hidden"
                  >
                    <div className="p-6">
                      <h4 className="font-bold text-brand-primary mb-4">{t('ordersPage.items')}:</h4>
                      <div className="border border-brand-border rounded-lg">
                        <div className="grid grid-cols-3 px-4 py-2 bg-black/20 font-semibold text-sm text-brand-secondary">
                          <div>{t('ordersPage.product')}</div>
                          <div className="text-center">{t('ordersPage.quantity')}</div>
                          <div className="text-right">{t('ordersPage.priceAtPurchase')}</div>
                        </div>
                        {order.items.map((item) => (
                          <div key={item.orderItemId} className="grid grid-cols-3 px-4 py-3 border-t border-brand-border text-brand-primary">
                            <div>{item.product.name}</div>
                            <div className="text-center">{item.quantity}</div>
                            <div className="text-right">${item.priceAtPurchase.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
          </div>
        </div>
      </div>
  );
};

export default OrdersPage;
