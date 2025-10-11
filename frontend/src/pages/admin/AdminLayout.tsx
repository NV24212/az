import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, Box, ShoppingCart, Users, BarChart, Settings, LogOut } from 'lucide-react';

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
  { to: '/admin/products', label: 'Products', icon: Box },
  { to: '/admin/categories', label: 'Categories', icon: Box },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart },
];

const SidebarLink = ({ to, label, icon: Icon, exact = false }: (typeof navLinks)[0]) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-brand-primary-light text-brand-primary'
          : 'text-brand-text-secondary hover:bg-gray-100 hover:text-brand-text'
      }`
    }
  >
    <Icon className="h-5 w-5 mr-3" />
    <span>{label}</span>
  </NavLink>
);

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-brand-background text-brand-text">
      <aside className="w-64 flex-shrink-0 bg-brand-sidebar border-r border-brand-border flex flex-col">
        <div className="h-16 flex items-center px-4">
          <h1 className="text-xl font-bold text-brand-primary">AzharStore</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-brand-border">
            <SidebarLink to="/admin/settings" label="Settings" icon={Settings} />
           <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              window.location.href = '/admin/login';
            }}
            className="flex items-center w-full mt-2 px-3 py-2 text-sm font-medium text-brand-text-secondary hover:bg-gray-100 hover:text-brand-text rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
