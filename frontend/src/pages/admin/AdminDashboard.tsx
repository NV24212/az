import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getAdminProducts } from '../../lib/api';
import { useTranslation } from 'react-i18next';

function StatCard({
  title,
  value,
  percentageChange,
}: {
  title: string;
  value: string | number;
  percentageChange: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <p className="text-sm font-medium text-gray-500">{t(title)}</p>
      <p className="text-3xl font-bold mt-2 text-right">{value}</p>
      <p className="text-sm font-medium text-green-500 mt-1 text-right">{percentageChange}</p>
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
  const revenueChange = "+10% عن الشهر الماضي";
  const ordersChange = "+5% عن الشهر الماضي";
  const customersChange = t('adminDashboard.customersChange');

  if (loadingOrders || loadingProducts) return <p>{t('adminDashboard.loading')}</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 font-display">{t('adminDashboard.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="adminDashboard.totalRevenue"
          value={`${totalRevenue.toLocaleString()}$`}
          percentageChange={revenueChange}
        />
        <StatCard
          title="adminDashboard.totalOrders"
          value={totalOrders.toLocaleString()}
          percentageChange={ordersChange}
        />
        <StatCard
          title="adminDashboard.newCustomers"
          value={newCustomers.toLocaleString()}
          percentageChange={customersChange}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold">{t('adminDashboard.salesTrends')}</h3>
          <div className="mt-4 h-80">
            <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 472 320" width="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 240C18.1538 240 18.1538 100 36.3077 100C54.4615 100 54.4615 140 72.6154 140C90.7692 140 90.7692 220 108.923 220C127.077 220 127.077 120 145.231 120C163.385 120 163.385 230 181.538 230C199.692 230 199.692 160 217.846 160C236 160 236 140 254.154 140C272.308 140 272.308 260 290.462 260C308.615 260 308.615 300 326.769 300C344.923 300 344.923 40 363.077 40C381.231 40 381.231 200 399.385 200C417.538 200 417.538 280 435.692 280C453.846 280 453.846 100 472 100V320H0V240Z" fill="url(#paint0_linear_sales)"></path>
              <path d="M0 240C18.1538 240 18.1538 100 36.3077 100C54.4615 100 54.4615 140 72.6154 140C90.7692 140 90.7692 220 108.923 220C127.077 220 127.077 120 145.231 120C163.385 120 163.385 230 181.538 230C199.692 230 199.692 160 217.846 160C236 160 236 140 254.154 140C272.308 140 272.308 260 290.462 260C308.615 260 308.615 300 326.769 300C344.923 300 344.923 40 363.077 40C381.231 40 381.231 200 399.385 200C417.538 200 417.538 280 435.692 280C453.846 280 453.846 100 472 100" stroke="var(--brand-primary)" stroke-linecap="round" stroke-width="3"></path>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sales" x1="236" x2="236" y1="40" y2="320">
                  <stop stopColor="var(--brand-primary)" stopOpacity="0.2"></stop>
                  <stop offset="1" stopColor="var(--brand-primary)" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold">{t('adminDashboard.orderDistribution')}</h3>
          <div className="mt-4 h-80 flex flex-col justify-end gap-4">
            <div className="flex items-end gap-4">
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className="w-full bg-purple-100 rounded-t-md" style={{ height: '100px' }}></div>
                <p className="text-xs font-medium text-gray-500">{t('adminDashboard.electronics')}</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className="w-full bg-purple-100 rounded-t-md" style={{ height: '60px' }}></div>
                <p className="text-xs font-medium text-gray-500">{t('adminDashboard.clothing')}</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className="w-full bg-purple-100 rounded-t-md" style={{ height: '120px' }}></div>
                <p className="text-xs font-medium text-gray-500">{t('adminDashboard.homeware')}</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className="w-full bg-purple-100 rounded-t-md" style={{ height: '80px' }}></div>
                <p className="text-xs font-medium text-gray-500">{t('adminDashboard.accessories')}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
