import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#742370', '#10b981', '#f59e0b', '#ef4444']

export default function Analytics() {
  const { data: orders = [] } = useQuery({ queryKey: ['analytics-orders'], queryFn: async () => {
    const res = await api.get('/api/admin/orders/?limit=500')
    return res.data as any[]
  }})

  const revenueByDay = Object.values(
    orders.reduce((acc: any, o: any) => {
      const day = new Date(o.createdAt).toISOString().slice(0,10)
      acc[day] = acc[day] || { day, revenue: 0 }
      acc[day].revenue += o.totalAmount || 0
      return acc
    }, {})
  ).slice(-30)

  const statusCounts = ['PENDING','SHIPPED','DELIVERED','CANCELLED'].map((s) => ({ name: s, value: orders.filter((o:any)=>o.status===s).length }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card">
        <div className="card-padding">
          <div className="mb-3 font-medium">Revenue (last 30 days)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay as any[]}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line dataKey="revenue" stroke="#742370" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-padding">
          <div className="mb-3 font-medium">Orders by Status</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {statusCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
