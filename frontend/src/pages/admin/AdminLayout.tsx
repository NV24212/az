import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { toast } from 'sonner';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  // { to: '/admin/customers', label: 'Customers' }, // Assuming this page doesn't exist yet
  { to: '/admin/settings', label: 'Settings' },
];

function SidebarNav() {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/admin'}
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
  );
}

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success("You have been logged out.");
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Static Sidebar for larger screens */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 text-white flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center text-xl font-bold" style={{ color: '#742370' }}>
          AzharStore
        </div>
        <SidebarNav />
      </aside>

      {/* Mobile Sidebar (Overlay) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex flex-col z-40 transform transition-transform ease-in-out duration-300 md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-center text-xl font-bold" style={{ color: '#742370' }}>
          AzharStore
        </div>
        <SidebarNav />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between md:justify-end px-6">
          <button
            className="md:hidden text-slate-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
