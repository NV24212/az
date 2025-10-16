import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function Products() {
  const { data = [] } = useQuery({ queryKey: ['admin-products'], queryFn: async () => {
    const res = await api.get('/api/admin/products/?limit=100')
    return res.data as any[]
  }})

  return (
    <div className="card">
      <div className="card-padding">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.productId} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-4">{p.productId}</td>
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">${p.price}</td>
                  <td className="py-2 pr-4">{p.stockQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
