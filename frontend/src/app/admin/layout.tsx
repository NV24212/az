'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, BarChart3, Settings as SettingsIcon, LogOut, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { clearToken } from '@/lib/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="h-screen flex bg-background">
      <aside className="hidden md:flex w-[280px] flex-col border-r border-border bg-white">
        <div className="px-6 py-5 text-xl font-semibold text-brand">AzharStore</div>
        <nav className="px-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand-light text-brand' : 'text-text hover:bg-gray-100'}`}>
                <Icon size={18} className={isActive ? 'text-brand' : 'text-gray-500 group-hover:text-gray-700'} />
                <span>{label}</span>
                {isActive && (
                  <motion.span layoutId="active-pill" className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-brand" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pb-4">
          <Link href="/admin/settings" className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin/settings' ? 'bg-brand-light text-brand' : 'text-text hover:bg-gray-100'}`}>
            <SettingsIcon size={18} className={pathname === '/admin/settings' ? 'text-brand' : 'text-gray-500 group-hover:text-gray-700'} />
            <span>Settings</span>
            {pathname === '/admin/settings' && <motion.span layoutId="active-pill" className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-brand" />}
          </Link>
          <button onClick={() => { clearToken(); router.replace('/admin/login') }} className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-text hover:bg-gray-100">
            <LogOut size={18} className="text-gray-500" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="px-4 md:px-6 py-4">
            <h1 className="text-xl font-semibold capitalize">{pathname.split('/').pop()}</h1>
          </div>
        </header>
        <div className="p-4 md:p-6 overflow-auto">
          {children}
        </div>
        <Toaster position="top-right" richColors />
      </main>
    </div>
  );
}
