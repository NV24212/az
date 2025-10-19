import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { produce } from 'immer';
import { api } from '../../lib/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Loading from '../../components/ui/Loading';
import ImageUploader from '../../components/ui/ImageUploader';
import VariantManager from '../../components/ui/VariantManager';

type ProductImage = { id: number; product_id: number; image_url: string; is_primary: boolean; created_at: string };
type ProductVariant = { id: number; product_id: number; name: string; stock_quantity: number; image_url?: string };
type Category = { id: number; name: string };
type Product = { id: number; name: string; description?: string; price: number; stock_quantity: number | null; category_id: number; category: Category, product_images: ProductImage[]; product_variants: ProductVariant[] };

export default function Products() {
  const qc = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/api/admin/products')).data,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get('/api/admin/categories')).data,
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/products/${id}`)).data,
    onSuccess: (_, id) => {
      qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) => (oldData || []).filter(p => p.id !== id));
      toast.success('Product deleted successfully');
      setConfirmDelete(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete product');
    },
  });

  const handleEdit = (product: Product) => {
    setEditing(product);
    setOpen(true);
  }

  const handleClose = () => {
    setEditing(null);
    setOpen(false);
  }

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="brand-bg text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">Add Product</button>
        </div>
        {isLoadingProducts || isLoadingCategories ? (
          <div className="h-96 flex items-center justify-center"><Loading /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-600">
                <tr>
                  <th className="py-2 pr-4 font-semibold">ID</th>
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Price</th>
                  <th className="py-2 pr-4 font-semibold">Stock</th>
                  <th className="py-2 pr-4 font-semibold">Category</th>
                  <th className="py-2 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? 'bg-slate-50' : ''}>
                    <td className="py-2 pr-4">{p.id}</td>
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4">${p.price}</td>
                    <td className="py-2 pr-4">{p.stock_quantity ?? '-'}</td>
                    <td className="py-2 pr-4">{p.category.name}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(p)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Edit</button>
                        <button onClick={() => setConfirmDelete(p)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} title={editing ? 'Edit Product' : 'Add Product'} onClose={handleClose}>
        <ProductForm product={editing} categories={categories} onClose={handleClose} />
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Product" onCancel={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) deleteMutation(confirmDelete.id); }} message={<span>Are you sure you want to delete <b>{confirmDelete?.name}</b>? This action cannot be undone.</span>} isPending={isDeleting} />
    </div>
  );
}

type LocalImage = { file: File, id: number, image_url: string, is_primary: boolean };
type LocalVariant = Omit<ProductVariant, 'id' | 'product_id'> & { id: number, image_file?: File }

function ProductForm({ product, categories, onClose }: { product: Product | null, categories: Category[], onClose: () => void }) {
  const qc = useQueryClient();
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [localVariants, setLocalVariants] = useState<LocalVariant[]>([]);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: async (payload: Omit<Product, 'id' | 'category' | 'product_images' | 'product_variants'>) => (await api.post('/api/admin/products', payload)).data,
    onSuccess: async (newProduct: Product) => {
      await Promise.all([
        ...localImages.map(img => {
            const formData = new FormData();
            formData.append('file', img.file);
            return api.post(`/api/admin/products/${newProduct.id}/images`, formData)
        }),
        ...localVariants.map(v => api.post(`/api/admin/products/${newProduct.id}/variants`, v).then(res => {
          if (v.image_file) {
            const formData = new FormData();
            formData.append('file', v.image_file);
            return api.post(`/api/admin/products/variants/${res.data.id}/image`, formData);
          }
        }))
      ]);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create product'),
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: Partial<Omit<Product, 'id'>>) => (await api.patch(`/api/admin/products/${product!.id}`, payload)).data,
    onSuccess: (updatedProduct) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const index = draft.findIndex(p => p.id === updatedProduct.id);
                if (index !== -1) draft[index] = { ...draft[index], ...updatedProduct };
            })
        );
        toast.success('Product updated successfully');
        onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to update product'),
  });

  const { mutate: uploadImageMutation } = useMutation({
    mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return (await api.post(`/api/admin/products/${product!.id}/images`, formData)).data
    },
    onSuccess: (newImage) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                p?.product_images.push(newImage);
            })
        );
        toast.success('Image uploaded successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to upload image'),
  });

  const { mutate: deleteImageMutation } = useMutation({
    mutationFn: async (imageId: number) => (await api.delete(`/api/admin/products/images/${imageId}`)).data,
    onSuccess: (_, imageId) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                if(p) p.product_images = p.product_images.filter(img => img.id !== imageId);
            })
        );
        toast.success('Image deleted successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to delete image'),
  });

  const { mutate: setPrimaryImageMutation } = useMutation({
    mutationFn: async (imageId: number) => (await api.post(`/api/admin/products/images/${imageId}/set-primary`)).data,
    onSuccess: (_, imageId) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                if(p) {
                    p.product_images.forEach(img => img.is_primary = img.id === imageId);
                }
            })
        );
        toast.success('Primary image set successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to set primary image'),
  });

  const { mutate: createVariantMutation } = useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'product_id'>) => (await api.post(`/api/admin/products/${product!.id}/variants`, variant)).data,
    onSuccess: (newVariant) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                p?.product_variants.push(newVariant);
            })
        );
        toast.success('Variant created successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create variant'),
  });

  const { mutate: updateVariantMutation } = useMutation({
    mutationFn: async (variant: ProductVariant) => (await api.patch(`/api/admin/products/variants/${variant.id}`, variant)).data,
    onSuccess: (updatedVariant) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                const vIndex = p?.product_variants.findIndex(v => v.id === updatedVariant.id);
                if (p && vIndex !== -1) p.product_variants[vIndex] = updatedVariant;
            })
        );
        toast.success('Variant updated successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to update variant'),
  });

  const { mutate: deleteVariantMutation } = useMutation({
    mutationFn: async (variantId: number) => (await api.delete(`/api/admin/products/variants/${variantId}`)).data,
    onSuccess: (_, variantId) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                if(p) p.product_variants = p.product_variants.filter(v => v.id !== variantId);
            })
        );
        toast.success('Variant deleted successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to delete variant'),
  });

  const { mutate: uploadVariantImageMutation } = useMutation({
    mutationFn: async ({ variantId, file }: { variantId: number, file: File }) => {
        const formData = new FormData();
        formData.append('file', file);
        return (await api.post(`/api/admin/products/variants/${variantId}/image`, formData)).data
    },
    onSuccess: (updatedVariant) => {
        qc.setQueryData(['admin-products'], (oldData: Product[] | undefined) =>
            produce(oldData || [], draft => {
                const p = draft.find(p => p.id === product!.id);
                const vIndex = p?.product_variants.findIndex(v => v.id === updatedVariant.id);
                if (p && vIndex !== -1) p.product_variants[vIndex] = updatedVariant;
            })
        );
        toast.success('Variant image uploaded successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to upload variant image'),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const stockQuantity = formData.get('stockQuantity');
    const payload = {
      name: String(formData.get('name')),
      description: String(formData.get('description') || ''),
      price: parseFloat(String(formData.get('price'))),
      stock_quantity: (product?.product_variants?.length || localVariants.length) > 0 ? undefined : (stockQuantity ? parseInt(String(stockQuantity), 10) : 0),
      category_id: parseInt(String(formData.get('categoryId')), 10),
    };
    if (product) updateMutation(payload);
    else createMutation(payload);
  }

  const isPending = isCreating || isUpdating;

  const handleUpload = (files: File[]) => {
    if(product) {
        files.forEach(file => uploadImageMutation(file))
    } else {
        const newImages = files.map(file => ({ file, id: Date.now() + Math.random(), image_url: URL.createObjectURL(file), is_primary: false }))
        setLocalImages(prev => [...prev, ...newImages])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Field name="name" label="Product Name" defaultValue={product?.name} placeholder="e.g. T-Shirt" />
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea name="description" defaultValue={product?.description} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" placeholder="e.g. A high-quality cotton t-shirt" />
          </div>
          <div className="card">
            <div className="card-padding">
              <ImageUploader
                images={product?.product_images || localImages}
                onUpload={handleUpload}
                onDelete={product ? (id) => deleteImageMutation(id) : (id) => setLocalImages(prev => prev.filter(img => img.id !== id))}
                onSetPrimary={product ? (id) => setPrimaryImageMutation(id) : (id) => setLocalImages(prev => prev.map(img => ({ ...img, is_primary: img.id === id })))}
              />
            </div>
          </div>
          <div className="card">
            <div className="card-padding">
              <VariantManager
                variants={product?.product_variants || localVariants}
                onCreate={product ? (v) => createVariantMutation(v) : (v) => setLocalVariants(prev => [...prev, { ...v, id: Date.now() }])}
                onUpdate={product ? (v) => updateVariantMutation(v) : (v) => setLocalVariants(prev => prev.map(pv => pv.id === v.id ? {...pv, ...v} : pv))}
                onDelete={product ? (id) => deleteVariantMutation(id) : (id) => setLocalVariants(prev => prev.filter(v => v.id !== id))}
                onUpload={product ? (v, file) => uploadVariantImageMutation({ variantId: v.id!, file }) : (v, file) => setLocalVariants(prev => prev.map(pv => pv.id === v.id ? {...pv, image_file: file, image_url: URL.createObjectURL(file)} : pv))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Field name="price" label="Price" type="number" step="0.01" defaultValue={product?.price} placeholder="e.g. 29.99" />
          {(!product?.product_variants?.length && !localVariants.length) && <Field name="stockQuantity" label="Stock" type="number" defaultValue={product?.stock_quantity} placeholder="e.g. 100" />}
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select name="categoryId" defaultValue={product?.category_id} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 rounded-lg brand-bg text-white shadow hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
          {isPending ? <Loading /> : (product ? 'Save Changes' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}

function Field(props: React.ComponentProps<'input'> & { label: string }) {
    const { name, label, type = 'text' } = props;
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (props.onFocus) props.onFocus(e);
      if (type === 'number' && e.target.value === '0') {
        e.target.value = '';
      }
    }
    return (
      <label className="block">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input {...props} name={name} type={type} onFocus={handleFocus} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
      </label>
    );
  }
