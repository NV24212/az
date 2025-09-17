import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getAdminProducts } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAdminProducts,
  });

  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;

  // Prepare data for the chart
  const salesData = orders?.map(order => ({
    date: new Date(order.createdAt).toLocaleDateString(),
    sales: order.totalAmount,
  })).reverse();

  if (loadingOrders || loadingProducts) return <p>Loading dashboard data...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Total Products" value={totalProducts} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Sales Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
