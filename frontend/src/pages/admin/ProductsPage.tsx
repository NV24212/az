import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../../lib/api';
import { getAdminProducts, getAdminCategories, deleteProduct } from '../../lib/api';
import ProductFormModal from '../../components/ProductFormModal';
import LoadingScreen from '../../components/LoadingScreen';
import EntityCard from '../../components/EntityCard';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAdminProducts,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });

  const handleOpenModal = (product: Product | null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleDelete = (productId: number) => {
    if (window.confirm(t('productsPage.confirmDelete'))) {
      deleteMutation.mutate(productId);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.categoryId === categoryId)?.name || '...';
  };

  if (isLoading || isLoadingCategories) return <LoadingScreen fullScreen={false} />;
  if (isError) return <p className="text-red-500">Error fetching products: {error.message}</p>;

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
        <h1 className="text-3xl font-bold text-brand-primary">{t('productsPage.title')}</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center justify-center gap-2 bg-brand-primary text-brand-background font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('productsPage.newProduct')}
        </button>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" variants={itemVariants}>
        {products?.map((product) => (
          <EntityCard
            key={product.productId}
            title={product.name}
            onEdit={() => handleOpenModal(product)}
            onDelete={() => handleDelete(product.productId)}
          >
            <p className="text-brand-secondary">{t('productsPage.category')}: {getCategoryName(product.categoryId)}</p>
            <p className="text-brand-secondary">{t('productsPage.price')}: ${product.price.toFixed(2)}</p>
            <p className="text-brand-secondary">{t('productsPage.stock')}: {product.stockQuantity}</p>
          </EntityCard>
        ))}
      </motion.div>

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={editingProduct}
          categories={categories || []}
        />
      )}
    </motion.div>
  );
}
