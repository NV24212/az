import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Product } from '../../lib/api';
import { getAdminProducts, getAdminCategories, deleteProduct } from '../../lib/api';
import ProductFormModal from '../../components/ProductFormModal';
import ProductTableSkeleton from '../../components/ProductTableSkeleton';

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
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error.message}`);
    }
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.categoryId === categoryId)?.name || '...';
  };

  if (isLoading || isLoadingCategories) return <ProductTableSkeleton />;
  if (isError) return <p className="text-red-500">Error fetching products: {error.message}</p>;

  const buttonPrimaryStyle = "px-4 py-2 rounded-md text-white bg-[#742370] hover:bg-opacity-90 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50";
  const buttonSecondaryStyle = "px-3 py-1 text-sm rounded-md bg-slate-200 hover:bg-slate-300 transition-colors";
  const buttonDestructiveStyle = "px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors";

  return (
    <div className="animate-fade-in-scale">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className={buttonPrimaryStyle}
        >
          + New Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {products?.map((product) => (
              <tr key={product.productId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getCategoryName(product.categoryId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{product.stockQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenModal(product)} className={buttonSecondaryStyle}>Edit</button>
                  <button onClick={() => handleDelete(product.productId)} className={buttonDestructiveStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={editingProduct}
          categories={categories || []}
        />
      )}
    </div>
  );
}
