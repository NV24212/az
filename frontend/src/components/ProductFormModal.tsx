import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Product, Category } from '../lib/api';
import { createProduct, updateProduct } from '../lib/api';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // Product data for editing, null for creating
  categories: Category[];
}

const emptyProduct: Omit<Product, 'productId'> = {
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  categoryId: 0,
};

export default function ProductFormModal({ isOpen, onClose, product, categories }: ProductFormModalProps) {
  const [formData, setFormData] = useState<Omit<Product, 'productId'>>(emptyProduct);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId,
      });
    } else {
      setFormData(emptyProduct);
    }
  }, [product, isOpen]);

  const mutation = useMutation({
    mutationFn: (newProduct: Omit<Product, 'productId'>) => {
      if (product) {
        return updateProduct(product.productId, newProduct);
      } else {
        return createProduct(newProduct);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (formData.categoryId === 0) {
      toast.error("Please select a category.");
      return;
    }
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  // Define styles based on SRS
  const inputStyle = "w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-[#742370] focus:border-[#742370]";
  const buttonPrimaryStyle = "px-4 py-2 rounded-md text-white bg-[#742370] hover:bg-opacity-90 transition-colors disabled:opacity-50";
  const buttonSecondaryStyle = "px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 transition-colors";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-scale">
        <h2 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'Create New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className={inputStyle}
              >
                <option value={0} disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputStyle}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className={inputStyle}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Image URL</label>
              <input
                type="text"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className={inputStyle}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className={buttonSecondaryStyle}>
              Cancel
            </button>
            <button type="submit" className={buttonPrimaryStyle} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
