import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4';
import { AuthContext } from './context/AuthContext';
import { CacheBusterProvider } from './context/CacheBusterContext.jsx';
import Home from './pages/Home.jsx';
import Weeks from './pages/Weeks.jsx';
import WeekDetail from './pages/WeekDetail.jsx';
import Login from './pages/Login.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import ProductsPage from './pages/admin/ProductsPage.tsx';
import CategoriesPage from './pages/admin/CategoriesPage.tsx';
import OrdersPage from './pages/admin/OrdersPage.tsx';
import CustomersPage from './pages/admin/CustomersPage.tsx';
import SettingsPage from './pages/admin/SettingsPage.tsx';
import StudentLayout from './pages/student/StudentLayout.jsx';
import StudentPoints from './pages/student/StudentPoints.jsx';
import { logoUrl } from './data/site.js';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const mobileNavLinks = (
    <div className="px-6 py-4">
      <Link to="/weeks" onClick={closeMenu} className="text-brand-text-secondary hover:text-brand-text transition-colors block py-2">{t('Weeks')}</Link>
      <Link to="/leaderboard" onClick={closeMenu} className="text-brand-text-secondary hover:text-brand-text transition-colors block py-2">{t('Leaderboard')}</Link>
      <div className="border-t border-brand-border my-4"></div>
      {user ? (
        <>
          {user.role === 'student' && <Link to="/dashboard" onClick={closeMenu} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors block text-center">{t('Dashboard')}</Link>}
          {user.role === 'admin' && <Link to="/admin" onClick={closeMenu} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors block text-center">{t('Admin Panel')}</Link>}
          <button onClick={handleLogout} className="text-brand-text-secondary hover:text-brand-text transition-colors w-full text-right mt-4 block py-2">{t('Logout')}</button>
        </>
      ) : (
        <Link to="/login" onClick={closeMenu} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors block text-center mt-2">{t('Login')}</Link>
      )}
    </div>
  );

  const desktopNavLinks = (
    <div className="flex items-center gap-5 text-sm font-medium">
      <Link to="/weeks" className="text-brand-text-secondary hover:text-brand-text transition-colors">{t('Weeks')}</Link>
      <Link to="/leaderboard" className="text-brand-text-secondary hover:text-brand-text transition-colors">{t('Leaderboard')}</Link>
      {user ? (
        <>
          {user.role === 'student' && <Link to="/dashboard" className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">{t('Dashboard')}</Link>}
          {user.role === 'admin' && <Link to="/admin" className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">{t('Admin Panel')}</Link>}
          <button onClick={handleLogout} className="text-brand-text-secondary hover:text-brand-text transition-colors">{t('Logout')}</button>
        </>
      ) : (
        <Link to="/login" className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">{t('Login')}</Link>
      )}
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-40 bg-brand-sidebar/80 backdrop-blur-lg border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
              <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-full object-cover" />
              <span className="text-brand-primary text-xl font-bold">{t('Ghars')}</span>
            </Link>

            <div className="hidden md:flex">
              {desktopNavLinks}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-text">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden fixed top-16 right-0 left-0 bottom-0 z-30 bg-brand-sidebar/95 backdrop-blur-xl animate-fade-in-down">
          {mobileNavLinks}
        </div>
      )}
    </>
  );
};

const Footer = () => (
  <footer className="border-t border-brand-border bg-brand-sidebar">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-brand-text-secondary text-sm text-center">
      <p>جميع الحقوق محفوظة، مدرسة أوال الإعدادية للبنين <span className="font-sans" aria-hidden="true">&copy;</span> {new Date().getFullYear()}</p>
    </div>
  </footer>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const isAppPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const path = location.pathname;
    let title;

    const keyMap = {
      '/login': 'Login',
      '/weeks': 'Weeks',
      '/leaderboard': 'Leaderboard',
      '/dashboard': 'Dashboard',
      '/admin': 'Admin Panel',
    };

    if (path === '/') {
      title = 'مشروع غرس';
    } else {
      const pageKey = Object.keys(keyMap).find(key => path.startsWith(key));
      const pageName = pageKey ? t(keyMap[pageKey]) : t('Ghars');
      title = `غرس - ${pageName}`;
    }

    document.title = title;
  }, [location, t]);

  return (
    <div className="min-h-screen bg-brand-background text-brand-text flex flex-col font-arabic">
      {!isAppPage && <Navigation />}
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAppPage && <Footer />}
    </div>
  );
};

const App = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaMeasurementId) {
      ReactGA.initialize(gaMeasurementId);
    }
  }, []);

  return (
    <CacheBusterProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
          <Route path="/weeks" element={<Weeks />} />
          <Route path="/weeks/:id" element={<WeekDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Protected Routes for Students */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/dashboard" element={<StudentLayout />}>
              <Route index element={<Navigate to="points" />} />
              <Route path="points" element={<StudentPoints />} />
            </Route>
          </Route>

          {/* Protected Routes for Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </CacheBusterProvider>
  );
};

export default App;
