import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  LogOut,
  PanelLeft,
  Menu,
  Home,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  LineChart,
  Settings,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.jsx';
import MobileAdminSidebar from './MobileAdminSidebar.jsx';
import { logoUrl } from '../../data/site.js';

const AdminLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change as a fail-safe
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin', text: t('admin.nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/products', text: t('admin.nav.products'), icon: ShoppingBag },
    { to: '/admin/orders', text: t('admin.nav.orders'), icon: ClipboardList },
    { to: '/admin/customers', text: t('admin.nav.customers'), icon: Users },
    { to: '/admin/analytics', text: t('admin.nav.analytics'), icon: LineChart },
  ];

  const getNavLinkClasses = (isOpen) => (to, isExact = false) => {
    const isActive = isExact ? location.pathname === to : location.pathname.startsWith(to);
    return `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary-light text-brand-primary'
        : 'text-brand-text-secondary hover:bg-brand-primary-light/60 hover:text-brand-primary'
    } ${!isOpen ? 'justify-center' : ''}`;
  };

  const getHomeLinkClasses = (isOpen) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-brand-text-secondary hover:bg-gray-100 hover:text-brand-text ${!isOpen ? 'justify-center' : ''}`;

  const DesktopSidebarContent = () => {
    const isOpen = isDesktopSidebarOpen;

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 mb-4">
          <h1 className="text-2xl font-bold text-brand-primary pt-2">AzharStore</h1>
        </div>
        <nav className="flex-grow px-2">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={getNavLinkClasses(isOpen)(link.to, link.to === '/admin')}
                  title={isOpen ? '' : link.text}
                >
                  <link.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
                  <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>
                    {link.text}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-2 py-4 mt-auto">
          <div className="border-t border-brand-border pt-4 space-y-2">
            <Link
              to="/admin/settings"
              className={getNavLinkClasses(isOpen)('/admin/settings')}
              title={isOpen ? '' : t('admin.nav.settings')}
            >
              <Settings className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>
                {t('admin.nav.settings')}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-primary-light/60 hover:text-brand-primary rounded-lg transition-colors duration-200 ${
                !isOpen ? 'justify-center' : ''
              }`}
              title={isOpen ? '' : t('Logout')}
            >
              <LogOut className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>
                {t('Logout')}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div dir="rtl" className="flex h-screen bg-brand-background text-brand-text font-arabic">
      <MobileAdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        user={user}
        navLinks={navLinks}
        handleLogout={handleLogout}
      />

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-shrink-0 bg-brand-sidebar border-l border-brand-border transition-all duration-300 ${isDesktopSidebarOpen ? 'w-64' : 'w-20'}`}>
        <DesktopSidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 bg-brand-sidebar/80 backdrop-blur-lg p-4 flex items-center justify-between md:justify-end">
          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileSidebarOpen(true)} className="text-brand-text md:hidden">
            <Menu size={24} />
          </button>
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-brand-text-secondary hover:bg-gray-100"
          >
            <PanelLeft size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto bg-brand-background">
          <div className="p-4 md:p-8 animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
