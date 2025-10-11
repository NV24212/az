import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getAdminProducts } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingScreen from '../../components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-black/20 border border-brand-border rounded-20 p-6">
      <h3 className="text-sm font-medium text-brand-secondary">{title}</h3>
      <p className="text-3xl font-bold mt-1 text-brand-primary">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
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

  if (loadingOrders || loadingProducts) return <LoadingScreen fullScreen={false} />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-3xl font-bold text-brand-primary">{t('adminDashboard.title')}</h1>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
        <StatCard title={t('adminDashboard.totalRevenue')} value={`$${totalRevenue.toFixed(2)}`} />
        <StatCard title={t('adminDashboard.totalOrders')} value={totalOrders} />
        <StatCard title={t('adminDashboard.totalProducts')} value={totalProducts} />
      </motion.div>

      <motion.div className="bg-black/20 border border-brand-border rounded-20 p-6" variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4 text-brand-primary">{t('adminDashboard.salesOverTime')}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#a0a0a0' }} />
            <YAxis tick={{ fill: '#a0a0a0' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            />
            <Legend wrapperStyle={{ color: '#ffffff' }} />
            <Bar dataKey="sales" fill="#742370" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}
