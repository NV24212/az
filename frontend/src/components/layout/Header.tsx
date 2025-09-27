import { Link } from 'react-router-dom';
import { ShoppingBag, Globe } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-6">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          AzharStore
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <Link
          to="/cart"
          className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-brand hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        >
          <ShoppingBag className="transition-colors group-hover:text-white" size={20} />
          <span className="font-sans text-sm font-medium text-gray-900 transition-colors group-hover:text-white">Cart</span>
        </Link>
        <button className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-brand hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
          <Globe className="transition-colors group-hover:text-white" size={20} />
          <span className="font-sans text-sm font-medium text-gray-900 transition-colors group-hover:text-white">EN</span>
        </button>
      </div>
    </header>
  );
}