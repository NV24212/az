import Link from 'next/link';
import { ShoppingCart, Globe } from 'lucide-react';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand">
            AzharStore
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-text hover:text-brand transition-colors">
              <ShoppingCart size={20} />
              <span>Cart</span>
            </Link>
            <button className="flex items-center gap-2 text-sm font-medium text-text hover:text-brand transition-colors">
              <Globe size={20} />
              <span>EN</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-border">
        <div className="container mx-auto px-4 md:px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AzharStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
