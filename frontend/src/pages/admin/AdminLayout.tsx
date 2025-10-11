import { NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-slate-700">
          AzharStore
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'} // `end` prop for the dashboard link to not match all child routes
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6">
          {/* Header content like user menu, notifications can go here */}
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              window.location.href = '/admin/login';
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
