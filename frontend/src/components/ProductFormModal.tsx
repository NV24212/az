import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product, Category } from '../lib/api';
import { createProduct, updateProduct } from '../lib/api';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
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
  const { t } = useTranslation();
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
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? t('productForm.editTitle') : t('productForm.createTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('productForm.name')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('productForm.category')}</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            >
              <option value={0} disabled>{t('productForm.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-brand-secondary">{t('productForm.description')}</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('productForm.price')}</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('productForm.stock')}</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
              className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-brand-secondary">{t('productForm.imageUrl')}</label>
            <input
              type="text"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="bg-brand-border/10 hover:bg-brand-border/20 text-brand-primary font-bold py-2.5 px-5 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="bg-brand-primary hover:bg-opacity-90 text-brand-background font-bold py-2.5 px-5 rounded-lg transition-colors transform active:scale-95 flex items-center justify-center w-32"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : (product ? t('common.saveChanges') : t('common.create'))}
          </button>
        </div>
        {mutation.isError && <p className="text-red-500 mt-2">Error: {mutation.error.message}</p>}
      </form>
    </Modal>
  );
}
