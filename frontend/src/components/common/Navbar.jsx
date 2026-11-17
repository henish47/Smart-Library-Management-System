import React from 'react';
import { Menu, LogOut, BookMarked } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-library-border bg-library-cream/90 backdrop-blur-md px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-library-charcoal hover:bg-library-cream-dark/60 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-library-green" />
        </button>
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-library-gold hidden sm:inline" />
          <span className="font-serif text-sm tracking-wide text-library-green-dark font-bold hidden sm:inline">
            University Library Circulation & Records
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-library-border hover:border-library-walnut text-library-charcoal hover:bg-library-cream-dark hover:text-library-walnut-dark font-medium transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-library-walnut" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
