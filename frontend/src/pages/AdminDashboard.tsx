export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 p-4">Revenue: $0</div>
        <div className="rounded-lg border border-slate-200 p-4">Orders: 0</div>
        <div className="rounded-lg border border-slate-200 p-4">Customers: 0</div>
      </div>
    </div>
  )
}


