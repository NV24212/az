import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '../lib/api';
import { createCategory, updateCategory } from '../lib/api';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export default function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const { t } = useTranslation();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? t('categoryForm.editTitle') : t('categoryForm.createTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-secondary">{t('categoryForm.name')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            placeholder={t('categoryForm.placeholder')}
          />
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
            {mutation.isPending ? <Loader2 className="animate-spin" /> : (category ? t('common.saveChanges') : t('common.create'))}
          </button>
        </div>
        {mutation.isError && <p className="text-red-500 mt-2">Error: {mutation.error.message}</p>}
      </form>
    </Modal>
  );
}
