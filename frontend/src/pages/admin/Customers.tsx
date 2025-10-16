import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function Customers() {
  const { data = [] } = useQuery({ queryKey: ['admin-customers'], queryFn: async () => {
    const res = await api.get('/api/admin/customers/?limit=100')
    return res.data as any[]
  }})

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Address</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c: any, i: number) => (
                <tr key={c.customerId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{c.customerId}</td>
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4">{c.phone}</td>
                  <td className="py-2 pr-4">{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
