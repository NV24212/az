import { Outlet, Link } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        {/* Sidebar content will go here */}
        <h2 className="text-xl font-bold mb-4">AzharStore Admin</h2>
        <nav>
          <ul>
            <li><Link to="/admin" className="block py-2">Dashboard</Link></li>
            <li><Link to="/admin/products" className="block py-2">Products</Link></li>
            <ul className="pl-4">
              <li><Link to="/admin/products/categories" className="block py-2">Categories</Link></li>
            </ul>
            <li><Link to="/admin/orders" className="block py-2">Orders</Link></li>
            <li><Link to="/admin/customers" className="block py-2">Customers</Link></li>
            <li><Link to="/admin/settings" className="block py-2">Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;