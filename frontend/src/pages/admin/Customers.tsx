import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

type Customer = { customerId: number; name: string; phone: string; address: string }

export default function Customers() {
  const qc = useQueryClient()
  const { data: customers = [] } = useQuery({ queryKey: ['admin-customers'], queryFn: async () => {
    const res = await api.get('/api/admin/customers/?limit=500')
    return res.data as Customer[]
  }})

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<Customer, 'customerId'>) => (await api.post('/api/admin/customers/', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-customers'] })
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Omit<Customer, 'customerId'> }) => (await api.put(`/api/admin/customers/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-customers'] })
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/customers/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-customers'] })
  })

  const [editing, setEditing] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name')),
      phone: String(formData.get('phone')),
      address: String(formData.get('address')),
    }
    if (editing) updateMutation.mutate({ id: editing.customerId, payload })
    else createMutation.mutate(payload)
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Customers</h2>
          <button onClick={() => { setEditing(null); setOpen(true) }} className="brand-bg text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">Add Customer</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Address</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.customerId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{c.customerId}</td>
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4">{c.phone}</td>
                  <td className="py-2 pr-4">{c.address}</td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(c); setOpen(true) }} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Edit</button>
                      <button onClick={() => setConfirmDelete(c)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => { setOpen(false); setEditing(null) }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field name="name" label="Name" defaultValue={editing?.name} />
          <Field name="phone" label="Phone" defaultValue={editing?.phone} />
          <Field name="address" label="Address" defaultValue={editing?.address} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); setEditing(null) }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button className="px-4 py-2 rounded-lg brand-bg text-white shadow hover:opacity-95 active:scale-[0.98]">{editing ? 'Save Changes' : 'Create Customer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Customer" onCancel={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.customerId); setConfirmDelete(null) }} message={<span>Are you sure you want to delete <b>{confirmDelete?.name}</b>?</span>} />
    </div>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue?: any }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <input name={name} defaultValue={defaultValue ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
    </label>
  )
}
