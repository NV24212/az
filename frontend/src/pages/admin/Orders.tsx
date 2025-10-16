import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function Orders() {
  const { data = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: async () => {
    const res = await api.get('/api/admin/orders/?limit=100')
    return res.data as any[]
  }})

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
              </tr>
            </thead>
            <tbody>
              {data.map((o: any, i: number) => (
                <tr key={o.orderId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{o.orderId}</td>
                  <td className="py-2 pr-4">{o.customer?.name}</td>
                  <td className="py-2 pr-4">{o.status}</td>
                  <td className="py-2 pr-4">${o.totalAmount}</td>
                  <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
