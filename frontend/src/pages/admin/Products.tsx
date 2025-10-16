import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

type Product = { productId: number; name: string; description?: string; price: number; stockQuantity: number; imageUrl?: string; categoryId: number }

export default function Products() {
  const qc = useQueryClient()

  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: async () => {
    const res = await api.get('/api/admin/products/?limit=500')
    return res.data as Product[]
  }})

  const { data: categories = [] } = useQuery({ queryKey: ['admin-categories'], queryFn: async () => {
    const res = await api.get('/api/admin/categories/?limit=500')
    return res.data as { categoryId: number; name: string }[]
  }})

  const [editing, setEditing] = useState<Product | null>(null)
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<Product, 'productId'>) => (await api.post('/api/admin/products/', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] })
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Omit<Product, 'productId'> }) => (await api.put(`/api/admin/products/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] })
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/products/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] })
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name')),
      description: String(formData.get('description') || ''),
      price: parseFloat(String(formData.get('price'))),
      stockQuantity: parseInt(String(formData.get('stockQuantity')), 10),
      imageUrl: String(formData.get('imageUrl') || ''),
      categoryId: parseInt(String(formData.get('categoryId')), 10),
    }
    if (editing) updateMutation.mutate({ id: editing.productId, payload })
    else createMutation.mutate(payload)
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <button onClick={() => { setEditing(null); setOpen(true) }} className="brand-bg text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">Add Product</button>
        </div>
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
                <tr key={p.productId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{p.productId}</td>
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">${p.price}</td>
                  <td className="py-2 pr-4">{p.stockQuantity}</td>
                  <td className="py-2 pr-4">{categories.find(c=>c.categoryId===p.categoryId)?.name || p.categoryId}</td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(p); setOpen(true) }} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Edit</button>
                      <button onClick={() => setConfirmDelete(p)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title={editing ? 'Edit Product' : 'Add Product'} onClose={() => { setOpen(false); setEditing(null) }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Field name="name" label="Name" defaultValue={editing?.name} />
            <Field name="price" label="Price" type="number" step="0.01" defaultValue={editing?.price} />
            <Field name="stockQuantity" label="Stock" type="number" defaultValue={editing?.stockQuantity} />
            <Field name="imageUrl" label="Image URL" defaultValue={editing?.imageUrl} />
            <div>
              <label className="text-sm text-slate-700">Category</label>
              <select name="categoryId" defaultValue={editing?.categoryId} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-700">Description</label>
              <textarea name="description" defaultValue={editing?.description} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); setEditing(null) }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button className="px-4 py-2 rounded-lg brand-bg text-white shadow hover:opacity-95 active:scale-[0.98]">{editing ? 'Save Changes' : 'Create Product'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Product" onCancel={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.productId); setConfirmDelete(null) }} message={<span>Are you sure you want to delete <b>{confirmDelete?.name}</b>? This action cannot be undone.</span>} />
    </div>
  )
}

function Field({ name, label, defaultValue, type = 'text', step }: { name: string; label: string; defaultValue?: any; type?: string; step?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ''} step={step} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
    </label>
  )
}
