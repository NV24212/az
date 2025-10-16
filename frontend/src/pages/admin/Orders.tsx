import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

const STATUSES = ['PENDING','SHIPPED','DELIVERED','CANCELLED'] as const

type Order = { orderId: number; customer?: { name: string }; status: typeof STATUSES[number]; totalAmount: number; createdAt: string }

export default function Orders() {
  const qc = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: async () => {
    const res = await api.get('/api/admin/orders/?limit=1000')
    return res.data as Order[]
  }})

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Order['status'] }) => {
      return (await api.put(`/api/admin/orders/${id}`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  })

  const deleteOrder = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/orders/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  })

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o: Order, i: number) => (
                <tr key={o.orderId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{o.orderId}</td>
                  <td className="py-2 pr-4">{o.customer?.name}</td>
                  <td className="py-2 pr-4">
                    <select value={o.status} onChange={(e) => updateStatus.mutate({ id: o.orderId, status: e.target.value as Order['status'] })} className="rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-4">${o.totalAmount}</td>
                  <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <button onClick={() => deleteOrder.mutate(o.orderId)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
