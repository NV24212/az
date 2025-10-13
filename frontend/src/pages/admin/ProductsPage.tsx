import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../../lib/api';
import { getAdminProducts, getAdminCategories, deleteProduct } from '../../lib/api';
// We will create this component next
import ProductEditModal from './ProductEditModal';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

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
    <>
      <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-gray-800">المنتجات</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="ابحث عن منتجات..."
              type="text"
            />
          </div>
          <button
            onClick={() => handleOpenModal(null)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus size={18} />
            <span>إضافة منتج</span>
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">المنتج</th>
                <th scope="col" className="px-6 py-4 font-bold">الفئة</th>
                <th scope="col" className="px-6 py-4 font-bold">السعر</th>
                <th scope="col" className="px-6 py-4 font-bold">المخزون</th>
                <th scope="col" className="px-6 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.productId} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        src={product.imageUrl || 'https://placehold.co/100x100'}
                      />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {product.stockQuantity} في المخزون
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-brand-primary"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.productId)}
                      className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <ProductEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={editingProduct}
          categories={categories || []}
        />
      )}
    </>
  );
}
