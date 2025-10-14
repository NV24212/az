import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/types';
import { getAdminCustomers, deleteCustomer } from '../../lib/api';
import LoadingScreen from '../../components/LoadingScreen';
import EntityCard from '../../components/EntityCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import CustomerFormModal from '../../components/CustomerFormModal';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomersPage = () => {
  const { t } = useTranslation();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
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
    setDeletingCustomerId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCustomerId) {
      deleteMutation.mutate(deletingCustomerId);
    }
    setIsConfirmModalOpen(false);
    setDeletingCustomerId(null);
  };

  const handleOpenModal = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  if (isPending) return <LoadingScreen fullScreen={false} />;
  if (error) return <div>{t('common.error', { message: error.message })}</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">{t('customersPage.title')}</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center justify-center gap-2 bg-brand-primary text-brand-background font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('customersPage.newCustomer')}
        </button>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" variants={itemVariants}>
        {customers?.map((customer) => (
          <EntityCard
            key={customer.customerId}
            title={customer.name}
            onEdit={() => handleOpenModal(customer)}
            onDelete={() => handleDelete(customer.customerId)}
          >
            <p className="text-brand-secondary">{t('customersPage.phone')}: {customer.phone}</p>
            <p className="text-brand-secondary">{t('customersPage.address')}: {customer.address}</p>
          </EntityCard>
        ))}
      </motion.div>

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        customer={selectedCustomer}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('customersPage.confirmDeleteTitle')}
        message={t('customersPage.confirmDeleteMessage')}
      />
    </motion.div>
  );
};

export default CustomersPage;
