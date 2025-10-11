import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Home, LogOut } from 'lucide-react';
import { logoUrl } from '../../data/site.js';

const MobileAdminSidebar = ({ isOpen, onClose, user, navLinks, handleLogout }) => {
  const { t } = useTranslation();

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-brand-sidebar backdrop-blur-lg border-l border-brand-border z-50 transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform' }} // Animation optimization
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 mb-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-full object-cover" />
              <span className="text-lg font-bold whitespace-nowrap text-brand-primary">{user?.name}</span>
            </div>
            <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-grow px-2">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-brand-text-secondary hover:bg-gray-100 hover:text-brand-text"
                  onClick={handleLinkClick}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span>{t('admin.nav.home')}</span>
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive ? 'bg-brand-primary-light text-brand-primary' : 'text-brand-text-secondary hover:bg-gray-100 hover:text-brand-text'
                      }`
                    }
                    onClick={handleLinkClick}
                  >
                    <link.icon className="h-5 w-5 mr-3" />
                    <span>{link.text}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-2 py-4 mt-auto">
            <div className="border-t border-brand-border pt-4">
              <button
                onClick={() => {
                  handleLinkClick();
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-gray-100 hover:text-brand-text rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>{t('Logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileAdminSidebar;
