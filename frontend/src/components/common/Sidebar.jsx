import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Layers,
  BookPlus,
  BookCheck,
  History,
  LogOut,
  Library,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Books', path: '/books', icon: BookOpen },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Categories', path: '/categories', icon: Layers },
    { label: 'Issue Book', path: '/issue-book', icon: BookPlus },
    { label: 'Return Book', path: '/return-book', icon: BookCheck },
    { label: 'Transactions', path: '/transactions', icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-library-charcoal/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-library-green-dark text-library-cream transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between border-r border-library-green/70 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-5 py-5 border-b border-library-green/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-library-green border border-library-gold/40 flex items-center justify-center text-library-gold shadow-md">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-base font-bold text-library-ivory tracking-wide leading-tight">
                  Athenaeum
                </h1>
                <p className="text-[10px] font-sans uppercase tracking-widest text-library-gold font-medium">
                  Library System
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded text-library-cream/60 hover:text-library-ivory hover:bg-library-green transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section Title */}
          <div className="px-5 pt-4 pb-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-gold/70">
              Circulation & Catalog
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-library-green text-library-ivory font-semibold shadow-inner border-l-4 border-library-gold pl-2.5'
                        : 'text-library-cream/80 hover:bg-library-green/60 hover:text-library-ivory hover:translate-x-0.5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-library-gold' : 'text-library-cream/70'}`} />
                      <span className="tracking-wide">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout Bar */}
        <div className="p-4 border-t border-library-green/70 bg-library-green-dark/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-library-cream/80 hover:bg-library-green hover:text-library-gold border border-library-green transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4 text-library-gold" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
