import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Globe } from 'lucide-react';

export default function StoreLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <NavLink to="/" className="text-xl font-semibold brand-text">
            AzharStore
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink to="/cart" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
              <ShoppingCart size={20} />
              <span>Cart</span>
            </NavLink>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
              <Globe size={20} />
              <span>EN</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        <div className="container mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} AzharStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}