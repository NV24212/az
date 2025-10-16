import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: async () => {
    const res = await api.get('/api/admin/orders/?limit=100')
    return res.data as { orderId: number; totalAmount: number; createdAt: string }[]
  }})
}

function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: async () => {
    const res = await api.get('/api/admin/customers/?limit=100')
    return res.data as any[]
  }})
}

export default function Dashboard() {
  const { data: orders = [] } = useOrders()
  const { data: customers = [] } = useCustomers()

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const ordersCount = orders.length
  const newCustomers = customers.length

  const salesTrend = orders.slice(-12).map((o, i) => ({ name: i + 1, value: o.totalAmount }))
  const distribution = [
    { name: 'Electronics', value: 120 },
    { name: 'Clothing', value: 90 },
    { name: 'Home Goods', value: 150 },
    { name: 'Accessories', value: 60 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div layout className="card">
          <div className="card-padding">
            <div className="text-slate-600 text-sm">Total Revenue</div>
            <div className="text-3xl font-semibold mt-1">${totalRevenue.toLocaleString()}</div>
            <div className="text-emerald-600 text-xs mt-1">+10% from last month</div>
          </div>
        </motion.div>
        <motion.div layout className="card">
          <div className="card-padding">
            <div className="text-slate-600 text-sm">Orders</div>
            <div className="text-3xl font-semibold mt-1">{ordersCount.toLocaleString()}</div>
            <div className="text-emerald-600 text-xs mt-1">+5% from last month</div>
          </div>
        </motion.div>
        <motion.div layout className="card">
          <div className="card-padding">
            <div className="text-slate-600 text-sm">New Customers</div>
            <div className="text-3xl font-semibold mt-1">{newCustomers.toLocaleString()}</div>
            <div className="text-emerald-600 text-xs mt-1">+3% from last month</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div layout className="card lg:col-span-2">
          <div className="card-padding">
            <div className="mb-3 font-medium">Sales Trends</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="brand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#742370" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#742370" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#742370" fillOpacity={1} fill="url(#brand)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
        <motion.div layout className="card">
          <div className="card-padding">
            <div className="mb-3 font-medium">Order Distribution</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#742370" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
