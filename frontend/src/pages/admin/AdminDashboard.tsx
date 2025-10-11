import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getAdminProducts } from '../../lib/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

function StatCard({
  title,
  value,
  percentageChange,
  isPositive,
}: {
  title: string;
  value: string | number;
  percentageChange: string;
  isPositive: boolean;
}) {
  return (
    <div className="bg-brand-card p-6 rounded-20 shadow-card">
      <h3 className="text-sm font-medium text-brand-text-secondary">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-brand-text">{value}</p>
      <p className={`text-sm mt-2 ${isPositive ? 'text-brand-accent' : 'text-red-500'}`}>
        {percentageChange}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  const { isLoading: loadingProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAdminProducts,
  });

  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;
  const totalOrders = orders?.length || 0;

  // Mock data for "New Customers" and percentage changes as the API doesn't provide this
  const newCustomers = 300;
  const revenueChange = "+10% from last month";
  const ordersChange = "+5% from last month";
  const customersChange = "+15% from last month";

  // Prepare data for the charts
  const salesData = orders?.map(order => ({
    name: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: order.totalAmount,
  })).slice(0, 15).reverse() || [];

  const orderDistributionData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 250 },
    { name: 'Home Goods', value: 600 },
    { name: 'Accessories', value: 350 },
  ];


  if (loadingOrders || loadingProducts) return <p>Loading dashboard data...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-text">{t('admin.dashboard.title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.totalRevenue')}
          value={`$${totalRevenue.toLocaleString()}`}
          percentageChange={revenueChange}
          isPositive={true}
        />
        <StatCard
          title={t('admin.dashboard.orders')}
          value={totalOrders.toLocaleString()}
          percentageChange={ordersChange}
          isPositive={true}
        />
        <StatCard
          title={t('admin.dashboard.newCustomers')}
          value={newCustomers.toLocaleString()}
          percentageChange={customersChange}
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-card p-6 rounded-20 shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-brand-text">{t('admin.dashboard.salesTrends')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Area type="monotone" dataKey="sales" stroke="#7C3AED" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-brand-card p-6 rounded-20 shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-brand-text">{t('admin.dashboard.orderDistribution')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
