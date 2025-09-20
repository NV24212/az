import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Category } from '../../lib/api';
import { getAdminCategories, deleteCategory } from '../../lib/api';
import CategoryFormModal from '../../components/CategoryFormModal';
import CategoryTableSkeleton from '../../components/CategoryTableSkeleton';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      toast.success('Category deleted successfully!');
    },
    onError: (err) => {
      toast.error(`Error deleting category: ${err.message}`);
    }
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
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(categoryId);
    }
  };

  if (isLoading) return <CategoryTableSkeleton />;
  if (isError) return <p className="text-red-500">Error fetching categories: {error.message}</p>;

  const buttonPrimaryStyle = "px-4 py-2 rounded-md text-white bg-[#742370] hover:bg-opacity-90 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50";
  const buttonSecondaryStyle = "px-3 py-1 text-sm rounded-md bg-slate-200 hover:bg-slate-300 transition-colors";
  const buttonDestructiveStyle = "px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors";

  return (
    <div className="animate-fade-in-scale">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className={buttonPrimaryStyle}
        >
          + New Category
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {categories?.map((category) => (
              <tr key={category.categoryId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenModal(category)} className={buttonSecondaryStyle}>Edit</button>
                  <button onClick={() => handleDelete(category.categoryId)} className={buttonDestructiveStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />
    </div>
  );
}
