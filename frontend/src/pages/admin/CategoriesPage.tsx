import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '../../lib/api';
import { getAdminCategories, deleteCategory } from '../../lib/api';
import CategoryFormModal from '../../components/CategoryFormModal';
import LoadingScreen from '../../components/LoadingScreen';
import EntityCard from '../../components/EntityCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    },
  });

  const handleOpenModal = (category: Category | null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleDelete = (categoryId: number) => {
    setDeletingCategoryId(categoryId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCategoryId) {
      deleteMutation.mutate(deletingCategoryId);
    }
    setIsConfirmModalOpen(false);
    setDeletingCategoryId(null);
  };

  if (isLoading) return <LoadingScreen fullScreen={false} />;
  if (isError) return <p className="text-red-500">Error fetching categories: {error.message}</p>;

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
        <h1 className="text-3xl font-bold text-brand-primary">{t('categoriesPage.title')}</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center justify-center gap-2 bg-brand-primary text-brand-background font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('categoriesPage.newCategory')}
        </button>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" variants={itemVariants}>
        {categories?.map((category) => (
          <EntityCard
            key={category.categoryId}
            title={category.name}
            onEdit={() => handleOpenModal(category)}
            onDelete={() => handleDelete(category.categoryId)}
          >
          </EntityCard>
        ))}
      </motion.div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('categoriesPage.confirmDeleteTitle')}
        message={t('categoriesPage.confirmDeleteMessage')}
      />
    </motion.div>
  );
}
