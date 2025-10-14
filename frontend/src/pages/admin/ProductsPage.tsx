import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../../lib/api';
import { getAdminProducts, getAdminCategories, deleteProduct } from '../../lib/api';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ProductEditModal from './ProductEditModal';

export default function ProductsPage() {
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
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      deleteMutation.mutate(productId);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(c => c.categoryId === categoryId);
    return category ? category.name : 'غير مصنف';
  };

  if (isLoading || isLoadingCategories) return <LoadingScreen fullScreen={false} />;
  if (isError) return <p className="text-red-500">Error fetching products: {error.message}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-display">المنتجات</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus size={18} />
          <span>إضافة منتج</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">المنتج</th>
              <th scope="col" className="px-6 py-3">الفئة</th>
              <th scope="col" className="px-6 py-3">السعر</th>
              <th scope="col" className="px-6 py-3">المخزون</th>
              <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.productId} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {product.name}
                </td>
                <td className="px-6 py-4">{getCategoryName(product.categoryId)}</td>
                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4">{product.stockQuantity}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-brand-primary">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.productId)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={editingProduct}
          categories={categories || []}
        />
      )}
    </div>
  );
}
