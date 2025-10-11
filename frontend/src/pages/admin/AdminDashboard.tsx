import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getAdminProducts } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import LoadingScreen from '../../components/LoadingScreen';

function StatCard({ title, value, change }: { title: string; value: string | number, change: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-brand-border shadow-card">
      <h3 className="text-sm font-medium text-brand-text-secondary">{title}</h3>
      <p className="text-3xl font-bold mt-1 text-brand-text">{value}</p>
      <p className="text-sm text-green-500 mt-1">{change}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  const { isLoading: loadingProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAdminProducts,
  });

  // In a real app, you'd also fetch customer data
  const totalCustomers = 300;

  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;
  const totalOrders = orders?.length || 0;

  // Prepare data for the charts
  const salesData = orders?.map(order => ({
    date: new Date(order.createdAt).toLocaleDateString(),
    sales: order.totalAmount,
  })).reverse();

  const orderDistributionData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Home Goods', value: 600 },
    { name: 'Accessories', value: 200 },
  ];

  if (loadingOrders || loadingProducts) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-text">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+10% from last month" />
        <StatCard title="Orders" value={totalOrders.toLocaleString()} change="+5% from last month" />
        <StatCard title="New Customers" value={totalCustomers.toLocaleString()} change="+15% from last month" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-brand-border shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-brand-text">Sales Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#742370" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl border border-brand-border shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-brand-text">Order Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#c4b5fd" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
