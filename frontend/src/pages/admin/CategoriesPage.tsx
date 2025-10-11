import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '@/types';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../lib/api';
import Modal from '../../components/Modal';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

type CategoryData = Omit<Category, 'categoryId'>;

interface CategoryFormProps {
  category: Category | null;
  onSuccess: () => void;
  onClose: () => void;
}

const CategoryForm = ({ category, onSuccess, onClose }: CategoryFormProps) => {
  const [name, setName] = useState(category?.name || '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CategoryData) =>
      category ? updateCategory(category.categoryId, data) : createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData: CategoryData = { name };
    mutation.mutate(categoryData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-2">Category Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-brand-text font-bold py-2.5 px-5 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center w-32">
          {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Category'}
        </button>
      </div>
    </form>
  );
};

const CategoriesPage = () => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isPending, error } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getAdminCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isPending) return <LoadingScreen />;
  if (error) return <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Categories</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Add New Category'}
      >
        <CategoryForm
          category={selectedCategory}
          onSuccess={() => setFormOpen(false)}
          onClose={() => setFormOpen(false)}
        />
      </Modal>

      <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="bg-gray-50 border-b border-brand-border">
            <tr>
              <th scope="col" className="p-4">Category Name</th>
              <th scope="col" className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.categoryId} className="border-b border-brand-border last:border-b-0">
                <td className="p-4 font-medium">{category.name}</td>
                <td className="p-4 flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setFormOpen(true);
                    }}
                    className="text-brand-primary hover:underline"
                  >
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(category.categoryId)} className="text-red-600 hover:underline">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesPage;
