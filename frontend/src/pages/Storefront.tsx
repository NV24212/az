export default function Storefront() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">AzharStore</h1>
      <p className="text-slate-600">Welcome to the storefront. Products will appear here.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 p-4">Sample Product</div>
      </div>
    </div>
  )
}


