import { useState } from 'react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    alert('Admin login placeholder')
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-slate-200">
      <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
          />
        </div>
        <button className="w-full bg-brand text-white py-2 rounded-lg transition-colors">Login</button>
      </form>
    </div>
  )
}


