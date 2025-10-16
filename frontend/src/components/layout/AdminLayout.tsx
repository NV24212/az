import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Package, ShoppingCart, Users, BarChart3, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { clearToken } from '../../lib/auth'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  return (
    <div className="h-full flex">
      <aside className="hidden md:flex w-[280px] flex-col border-r border-slate-200 bg-white">
        <div className="px-6 py-5 text-xl font-semibold brand-text">AzharStore</div>
        <nav className="px-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon, disabled }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'brand-text' : 'text-slate-500 group-hover:text-slate-700'} />
                  <span>{label}</span>
                  {isActive && (
                    <motion.span layoutId="active-pill" className="absolute left-0 top-0 h-full w-1 rounded-r-md brand-bg" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-2 pb-4">
          <NavLink to="/admin/settings" className={({ isActive }) => `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
            {({ isActive }) => (
              <>
                <SettingsIcon size={18} className={isActive ? 'brand-text' : 'text-slate-500 group-hover:text-slate-700'} />
                <span>Settings</span>
                {isActive && <motion.span layoutId="active-pill" className="absolute left-0 top-0 h-full w-1 rounded-r-md brand-bg" />}
              </>
            )}
          </NavLink>
          <button onClick={() => { clearToken(); navigate('/admin/login', { replace: true }) }} className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
            <LogOut size={18} className="text-slate-500" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Dashboard</div>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
