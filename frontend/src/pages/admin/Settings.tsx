import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useState } from 'react'

export default function Settings() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['settings'], queryFn: async () => {
    const res = await api.get('/api/admin/settings/')
    return res.data as any
  }})

  const [form, setForm] = useState<any>({})

  const m = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/api/admin/settings/', payload)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings']})
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    m.mutate(form)
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="card-padding space-y-4">
        <h2 className="text-lg font-semibold">Store Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Store Name" defaultValue={data?.storeName} onChange={(v) => setForm((s: any) => ({...s, storeName: v}))} />
          <Field label="Currency" defaultValue={data?.currency} onChange={(v) => setForm((s: any) => ({...s, currency: v}))} />
          <Field label="Admin Email" defaultValue={data?.adminEmail} onChange={(v) => setForm((s: any) => ({...s, adminEmail: v}))} />
          <Field label="Delivery Fee" type="number" defaultValue={data?.deliveryFee} onChange={(v) => setForm((s: any) => ({...s, deliveryFee: parseFloat(v)}))} />
          <Field label="Free Delivery Minimum" type="number" defaultValue={data?.freeDeliveryMinimum} onChange={(v) => setForm((s: any) => ({...s, freeDeliveryMinimum: parseFloat(v)}))} />
          <Field label="New Admin Password" type="password" onChange={(v) => setForm((s: any) => ({...s, password: v}))} />
        </div>
        <div className="pt-2">
          <button disabled={m.isPending} className="brand-bg text-white rounded-lg px-4 py-2 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">
            {m.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, defaultValue, onChange, type = 'text' }: { label: string; defaultValue?: any; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <input type={type} defaultValue={defaultValue ?? ''} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent placeholder:text-slate-400" />
    </label>
  )
}
