import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../../lib/api';
import { getAdminProducts, getAdminCategories, deleteProduct } from '../../lib/api';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
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
    <>
      <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-md">
        <h2 className="header-title text-2xl font-bold text-gray-800">المنتجات</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="text-gray-400" size={20} />
            </span>
            <input
              className="search-input w-full py-2 pr-10 pl-4 text-gray-700 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="ابحث عن منتجات..."
              type="text"
            />
          </div>
          <button
            onClick={() => handleOpenModal(null)}
            className="btn-hover flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:shadow-lg hover:shadow-brand-primary/30 transition-all duration-300"
          >
            <Plus size={18} />
            <span>إضافة منتج</span>
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-500 uppercase bg-gradient-to-r from-gray-50 to-gray-100">
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
                <tr key={product.productId} className="table-row bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="image-preview relative w-12 h-12 rounded-lg overflow-hidden">
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover"
                          src={product.imageUrl || 'https://placehold.co/100x100'}
                        />
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full inline-block">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`stock-indicator font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stockQuantity}
                    </span>
                    <span className="text-gray-500"> في المخزون</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="edit-btn p-2 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.productId)}
                        className="delete-btn p-2 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
