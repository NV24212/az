import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product, Category, Variant } from '../../lib/api';
import { createProduct, updateProduct } from '../../lib/api';
import { X, Trash2 } from 'lucide-react';

type EditableProduct = Omit<Product, 'productId' | 'variants' | 'stockQuantity'> & {
  variants: Array<Partial<Variant> & { name: string }>;
};

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
}

const ProductEditModal = ({ isOpen, onClose, product, categories }: ProductEditModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<EditableProduct>>({});
  const [newVariantName, setNewVariantName] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: '',
        price: 0,
        description: '',
        categoryId: categories[0]?.categoryId,
        variants: [],
      });
    }
  }, [product, isOpen, categories]);

  const mutation = useMutation({
    mutationFn: (productData: EditableProduct) => {
      const apiData = {
          ...productData,
          stockQuantity: productData.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0),
          variants: productData.variants.map(v => ({ name: v.name, stock_quantity: v.stockQuantity || 0 })),
      };
      // @ts-expect-error API expects snake_case
      return product ? updateProduct(product.productId, apiData) : createProduct(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      onClose();
    },
    onError: (error) => alert(`Failed to save product: ${error.message}`),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'categoryId' ? parseFloat(value) : value }));
  };

  const handleVariantChange = (index: number, field: 'name' | 'stockQuantity', value: string) => {
    const newVariants = [...(formData.variants || [])];
    const variant = { ...newVariants[index] };
    if (field === 'stockQuantity') variant.stockQuantity = parseInt(value, 10) || 0;
    else variant.name = value;
    newVariants[index] = variant;
    setFormData(prev => ({ ...prev, variants: newVariants as (Partial<Variant> & { name: string; })[] }));
  };

  const handleAddVariant = () => {
    if (newVariantName.trim() && !formData.variants?.some(v => v.name === newVariantName.trim())) {
      const newVariant = { name: newVariantName.trim(), stockQuantity: 0 };
      setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
      setNewVariantName('');
    }
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData as EditableProduct);
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm is-open">
      <div className="modal-content bg-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/50">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
          <h3 className="text-xl font-bold text-gray-800">{product ? 'تعديل منتج' : 'إضافة منتج'}</h3>
          <button className="close-btn text-gray-500 hover:text-gray-800" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
          <div className="p-8 flex-1 overflow-y-auto space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800">اسم المنتج</label>
                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="input-focus bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="مثال: وشاح حريري" required/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-800">السعر</label>
                    <input type="number" step="0.01" id="price" name="price" value={formData.price || ''} onChange={handleInputChange} className="input-focus bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="مثال: 49.99" required/>
                 </div>
                 <div>
                    <label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-800">الفئة</label>
                    <select id="categoryId" name="categoryId" value={formData.categoryId || ''} onChange={handleInputChange} className="input-focus bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" required>
                       {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                    </select>
                 </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-800">وصف المنتج</label>
                <textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={4} className="input-focus block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300" placeholder="اكتب وصفاً مفصلاً للمنتج..."></textarea>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800">المتغيرات (Variants)</h4>
               <div>
                  <label className="block mb-2 text-sm font-medium text-gray-800">إضافة متغير جديد</label>
                  <div className="flex gap-2">
                     <input type="text" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="input-focus bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="اسم المتغير (مثال: أحمر، مقاس L)" />
                     <button type="button" onClick={handleAddVariant} className="btn-hover px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:shadow-lg transition-all duration-300">إضافة</button>
                  </div>
               </div>

              {formData.variants && formData.variants.length > 0 && (
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                  <label className="text-sm font-bold text-gray-800">قيم المتغيرات والمخزون</label>
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-4 items-center">
                      <input type="text" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} className="input-focus bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5" placeholder="اسم القيمة" required />
                      <input type="number" value={variant.stockQuantity || ''} onChange={(e) => handleVariantChange(index, 'stockQuantity', e.target.value)} className="input-focus bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5" placeholder="كمية المخزون" required />
                      <button type="button" onClick={() => handleRemoveVariant(index)} className="delete-btn text-red-500 hover:text-red-700 justify-self-start">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl mt-auto">
            <button type="button" className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-transparent rounded-lg hover:bg-gray-100 transition-all duration-300" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn-hover px-6 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:shadow-lg hover:shadow-brand-primary/30 transition-all duration-300 ml-3" disabled={mutation.isPending}>
              {mutation.isPending ? '...جاري الحفظ' : 'حفظ المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
