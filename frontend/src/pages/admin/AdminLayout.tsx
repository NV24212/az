import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart, Package, ShoppingCart, Users, LineChart, Settings, LogOut, PanelLeft } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', text: 'لوحة التحكم', icon: BarChart, end: true },
    { to: '/admin/products', text: 'المنتجات', icon: Package },
    { to: '/admin/orders', text: 'الطلبات', icon: ShoppingCart },
    { to: '/admin/customers', text: 'العملاء', icon: Users },
    { to: '/admin/analytics', text: 'التحليلات', icon: LineChart },
  ];

  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-purple-50 text-brand-primary font-semibold' : 'hover:bg-purple-50 hover:text-brand-primary'
    } ${!isSidebarOpen ? 'justify-center' : ''}`;


  return (
    <div dir="rtl" className="flex h-screen w-full bg-[#f4f0f4] text-gray-800 font-sans">
      <aside className={`flex-shrink-0 bg-white border-l border-gray-200 flex flex-col items-center py-6 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 w-full px-4">
          <h1 className={`text-xl font-bold text-brand-primary font-display transition-opacity duration-200 ${!isSidebarOpen ? 'hidden' : ''}`}>متجر أزهر</h1>
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
            <button onClick={() => navigate('/admin/settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-50 hover:text-brand-primary transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`} title={isSidebarOpen ? '' : 'الإعدادات'}>
                <Settings className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>الإعدادات</span>
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-50 hover:text-brand-primary transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`} title={isSidebarOpen ? '' : 'Toggle sidebar'}>
                <PanelLeft className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>
                    {isSidebarOpen ? 'إخفاء الشريط' : 'إظهار الشريط'}
                </span>
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-50 hover:text-brand-primary transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`} title={isSidebarOpen ? '' : 'تسجيل الخروج'}>
                <LogOut className="h-5 w-5" />
                <span className={`transition-opacity whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'delay-200'}`}>تسجيل الخروج</span>
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
