import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart, Package, ShoppingCart, Users, LineChart, Settings, LogOut, PanelLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', text: t('admin.nav.dashboard'), icon: BarChart, end: true },
    { to: '/admin/products', text: t('admin.nav.products'), icon: Package },
    { to: '/admin/orders', text: t('admin.nav.orders'), icon: ShoppingCart },
    { to: '/admin/customers', text: t('admin.nav.customers'), icon: Users },
    { to: '/admin/analytics', text: t('admin.nav.analytics'), icon: LineChart },
  ];

  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-purple-50 text-brand-primary font-semibold' : 'hover:bg-purple-50 hover:text-brand-primary'
    } ${!isSidebarOpen ? 'justify-center' : ''}`;


  return (
    <div dir="rtl" className="flex h-screen w-full bg-[#f4f0f4] text-gray-800">
      <aside className={`flex-shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-6 transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 w-full px-4">
          <h1 className={`text-xl font-bold text-brand-primary font-display transition-opacity duration-200 ${!isSidebarOpen ? 'hidden' : ''}`}>{t('admin.storeName')}</h1>
          <h1 className={`text-2xl font-bold text-brand-primary font-display transition-opacity duration-200 ${isSidebarOpen ? 'hidden' : ''}`}>A</h1>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-2 w-full">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={getNavLinkClasses} title={isSidebarOpen ? '' : link.text}>
                <link.icon className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>{link.text}</span>
              </NavLink>
            ))}
        </nav>
        <div className="px-2 py-6 mt-auto border-t border-gray-200 space-y-2 w-full">
            <button onClick={() => navigate('/admin/settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-50 hover:text-brand-primary transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`} title={isSidebarOpen ? '' : t('admin.settings')}>
                <Settings className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>{t('admin.settings')}</span>
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-50 hover:text-brand-primary transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`} title={isSidebarOpen ? '' : t('admin.toggleSidebar.title')}>
                <PanelLeft className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>
                    {isSidebarOpen ? t('admin.toggleSidebar.hide') : t('admin.toggleSidebar.show')}
                </span>
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-50 hover:text-brand-primary transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`} title={isSidebarOpen ? '' : t('admin.logout')}>
                <LogOut className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>{t('admin.logout')}</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="px-10 py-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
