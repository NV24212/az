import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/api'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('admin_token', data.access_token)
      navigate('/admin')
    },
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(password)
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-slate-200">
      <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="password-input" className="block text-sm mb-1 font-medium text-slate-700">Password</label>
          <input
            id="password-input"
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            disabled={mutation.isPending}
          />
        </div>
        {mutation.isError && (
          <div className="text-red-600 text-sm">
            Login failed: {mutation.error.message}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}


