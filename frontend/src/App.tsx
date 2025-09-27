import { Outlet } from 'react-router-dom'
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css'

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
