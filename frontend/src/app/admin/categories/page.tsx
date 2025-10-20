'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Loading from '@/components/ui/Loading';
import QueryProvider from '@/components/QueryProvider';

type Category = {
  id: number;
  name: string;
};

function CategoriesPage() {
  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/api/admin/categories');
      return res.data;
    },
  });

  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: async (payload: Omit<Category, 'id'>) => (await api.post('/api/admin/categories', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setOpen(false);
      setEditing(null);
      toast.success('Category created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to create category');
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Omit<Category, 'id'> }) => (await api.patch(`/api/admin/categories/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setOpen(false);
      setEditing(null);
      toast.success('Category updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to update category');
    },
  });

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/categories/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setConfirmDelete(null);
      toast.success('Category deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete category');
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name')),
    };
    if (editing) {
      updateMutation({ id: editing.id, payload });
    } else {
      createMutation(payload);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="bg-brand text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">Add Category</button>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4 font-semibold">ID</th>
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, i) => (
                  <tr key={c.id} className={i % 2 ? 'bg-gray-50' : ''}>
                    <td className="py-2 pr-4">{c.id}</td>
                    <td className="py-2 pr-4">{c.name}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(c); setOpen(true); }} className="px-3 py-1.5 rounded-lg border border-border text-text hover:bg-gray-100">Edit</button>
                        <button onClick={() => setConfirmDelete(c)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} title={editing ? 'Edit Category' : 'Add Category'} onClose={() => { setOpen(false); setEditing(null); }}>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <Field name="name" label="Name" defaultValue={editing?.name} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="px-4 py-2 rounded-lg border border-border text-text hover:bg-gray-100">Cancel</button>
            <button disabled={isCreating || isUpdating} className="px-4 py-2 rounded-lg bg-brand text-white shadow hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              {isCreating || isUpdating ? <Loading /> : (editing ? 'Save Changes' : 'Create Category')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Category" onCancel={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) deleteMutation(confirmDelete.id); }} message={<span>Are you sure you want to delete <b>{confirmDelete?.name}</b>? This action cannot be undone.</span>} isPending={isDeleting} />
    </div>
  );
}

function Field({ name, label, defaultValue, type = 'text' }: { name: string; label: string; defaultValue?: any; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-text">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ''} className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" />
    </label>
  );
}

export default function Categories() {
    return (
        <QueryProvider>
            <CategoriesPage />
        </QueryProvider>
    )
}
