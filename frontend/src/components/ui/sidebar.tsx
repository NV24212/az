export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r">
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-2xl font-bold">AzharStore</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <a
          href="/admin"
          className="flex items-center rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          Dashboard
        </a>
        <a
          href="/admin/products"
          className="flex items-center rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          Products
        </a>
        <a
          href="/admin/categories"
          className="flex items-center rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          Categories
        </a>
      </nav>
    </div>
  );
}
