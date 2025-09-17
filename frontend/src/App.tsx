import { Outlet, Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div>
      <nav style={{ padding: 16, display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0' }}>
        <Link to="/">Storefront</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default App
