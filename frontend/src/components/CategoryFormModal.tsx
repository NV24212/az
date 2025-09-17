import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Category, createCategory, updateCategory } from '../lib/api';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export default function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    setName(category ? category.name : '');
  }, [category, isOpen]);

  const mutation = useMutation({
    mutationFn: (newCategory: { name: string }) => {
      if (category) {
        return updateCategory(category.categoryId, newCategory);
      } else {
        return createCategory(newCategory);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{category ? 'Edit Category' : 'Create New Category'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Electronics"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Category'}
            </button>
          </div>
          {mutation.isError && <p className="text-red-500 mt-2">Error: {mutation.error.message}</p>}
        </form>
      </div>
    </div>
  );
}
