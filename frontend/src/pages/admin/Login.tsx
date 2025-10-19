import { useState } from 'react'
import { motion } from 'framer-motion'
import { api, API_BASE } from '../../lib/api'
import { setToken } from '../../lib/auth'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Login() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from || '/admin'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/login', { password })
      setToken(res.data.access_token)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md card">
        <div className="card-padding space-y-5">
          <div>
            <h1 className="text-2xl font-semibold brand-text">AzharStore Admin</h1>
            <p className="text-slate-600 mt-1">Enter the admin password to continue.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent placeholder:text-slate-400" placeholder="••••••••" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={loading} className="w-full brand-bg text-white rounded-lg py-3 font-medium shadow hover:opacity-95 active:scale-[0.98] transition-all">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-xs text-slate-500 text-center">API: {API_BASE}</p>
        </div>
      </motion.form>
    </div>
  )
}
