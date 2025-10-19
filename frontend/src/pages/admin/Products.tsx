import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Loading from '../../components/ui/Loading';
import ImageUploader from '../../components/ui/ImageUploader';
import VariantManager from '../../components/ui/VariantManager';

type ProductImage = { id: number; product_id: number; image_url: string; is_primary: boolean; created_at: string };
type ProductVariant = { id: number; product_id: number; name: string; stock_quantity: number; image_url?: string };
type Product = { id: number; name: string; description?: string; price: number; stock_quantity: number | null; category_id: number; product_images: ProductImage[]; product_variants: ProductVariant[] };

export default function Products() {
  const qc = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/api/admin/products');
      return res.data as Product[];
    },
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/api/admin/categories');
      return res.data as { id: number; name: string }[];
    },
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id'>[]>([]);

  useEffect(() => {
    if (open && editing?.product_variants) {
      setVariants(editing.product_variants);
    } else {
      setVariants([]);
    }
  }, [open, editing]);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: async (payload: Omit<Product, 'id'>) => (await api.post('/api/admin/products', payload)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      setEditing(data);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to create product');
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Omit<Product, 'id'>> }) => (await api.patch(`/api/admin/products/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setOpen(false);
      setEditing(null);
      toast.success('Product updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to update product');
    },
  });

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/products/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setConfirmDelete(null);
      toast.success('Product deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete product');
    },
  });

  const { mutate: uploadImageMutation } = useMutation({
    mutationFn: async ({ productId, file }: { productId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return (await api.post(`/api/admin/products/${productId}/images`, formData)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Image uploaded successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to upload image');
    },
  });

  const { mutate: deleteImageMutation } = useMutation({
    mutationFn: async (imageId: number) => (await api.delete(`/api/admin/products/images/${imageId}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Image deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete image');
    },
  });

  const { mutate: setPrimaryImageMutation } = useMutation({
    mutationFn: async (imageId: number) => (await api.post(`/api/admin/products/images/${imageId}/set-primary`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Primary image set successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to set primary image');
    },
  });

  const { mutate: createVariantMutation } = useMutation({
    mutationFn: async ({ productId, variant }: { productId: number; variant: Omit<ProductVariant, 'id' | 'product_id'> }) => (await api.post(`/api/admin/products/${productId}/variants`, variant)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Variant created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to create variant');
    },
  });

  const { mutate: updateVariantMutation } = useMutation({
    mutationFn: async ({ variantId, variant }: { variantId: number; variant: Partial<Omit<ProductVariant, 'id' | 'product_id'>> }) => (await api.patch(`/api/admin/products/variants/${variantId}`, variant)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Variant updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to update variant');
    },
  });

  const { mutate: deleteVariantMutation } = useMutation({
    mutationFn: async (variantId: number) => (await api.delete(`/api/admin/products/variants/${variantId}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Variant deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete variant');
    },
  });

  const { mutate: uploadVariantImageMutation } = useMutation({
    mutationFn: async ({ variantId, file }: { variantId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return (await api.post(`/api/admin/products/variants/${variantId}/image`, formData)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Variant image uploaded successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to upload variant image');
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name')),
      description: String(formData.get('description') || ''),
      price: parseFloat(String(formData.get('price'))),
      stock_quantity: variants.length > 0 ? null : parseInt(String(formData.get('stockQuantity')), 10),
      category_id: parseInt(String(formData.get('categoryId')), 10),
    };

    if (editing) {
      updateMutation({ id: editing.id, payload });
      variants.forEach(variant => {
        if ('id' in variant) {
          updateVariantMutation({ variantId: (variant as any).id, variant });
        } else {
          createVariantMutation({ productId: editing.id, variant });
        }
      });
    } else {
      createMutation(payload);
    }
  }

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="brand-bg text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">Add Product</button>
        </div>
        {isLoadingProducts || isLoadingCategories ? (
          <div className="h-96 flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? 'bg-slate-50' : ''}>
                    <td className="py-2 pr-4">{p.id}</td>
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4">${p.price}</td>
                    <td className="py-2 pr-4">{p.stock_quantity ?? '-'}</td>
                    <td className="py-2 pr-4">{categories.find(c => c.id === p.category_id)?.name || p.category_id}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(p); setOpen(true); }} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Edit</button>
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

      <Modal open={open} title={editing ? 'Edit Product' : 'Add Product'} onClose={() => { setOpen(false); setEditing(null); }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Field name="name" label="Name" defaultValue={editing?.name} />
            <Field name="price" label="Price" type="number" step="0.01" defaultValue={editing?.price} />
            {variants.length === 0 && <Field name="stockQuantity" label="Stock" type="number" defaultValue={editing?.stock_quantity} />}
            <div>
              <label className="text-sm text-slate-700">Category</label>
              <select name="categoryId" defaultValue={editing?.category_id} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-700">Description</label>
              <textarea name="description" defaultValue={editing?.description} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            </div>
          </div>
          <div className="md:col-span-2">
            {editing && (
              <ImageUploader
                images={editing.product_images}
                productId={editing.id}
                onUpload={(file) => uploadImageMutation({ productId: editing.id, file })}
                onDelete={(id) => deleteImageMutation(id)}
                onSetPrimary={(id) => setPrimaryImageMutation(id)}
              />
            )}
          </div>
          <div className="md:col-span-2">
            <VariantManager
              variants={variants}
              onVariantsChange={setVariants}
              onUpload={(variant, file) => {
                if ('id' in variant) {
                  uploadVariantImageMutation({ variantId: (variant as any).id, file });
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button disabled={isCreating || isUpdating} className="px-4 py-2 rounded-lg brand-bg text-white shadow hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              {isCreating || isUpdating ? <Loading /> : (editing ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Product" onCancel={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) deleteMutation(confirmDelete.id); }} message={<span>Are you sure you want to delete <b>{confirmDelete?.name}</b>? This action cannot be undone.</span>} isPending={isDeleting} />
    </div>
  );
}

function Field({ name, label, defaultValue, type = 'text', step }: { name: string; label: string; defaultValue?: any; type?: string; step?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ''} step={step} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
    </label>
  );
}
