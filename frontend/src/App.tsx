import { Outlet, Link } from 'react-router-dom'
import { useCartStore } from './lib/cartStore'
import './App.css'

function App() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <div>
      <nav className="p-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex gap-4 items-center">
          <Link to="/" className="font-bold text-lg text-purple-700">AzharStore</Link>
          <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900">Admin</Link>
        </div>
        <Link to="/cart" className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default App
