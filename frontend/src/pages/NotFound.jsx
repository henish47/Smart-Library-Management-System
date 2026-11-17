import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-library-ivory">
      <div className="w-20 h-20 bg-library-cream border border-library-border rounded-3xl flex items-center justify-center mb-5 shadow-sm">
        <Compass className="w-10 h-10 text-library-gold" />
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-library-green-dark mb-2">
        404 • Uncataloged Page
      </h1>
      <p className="font-serif text-sm text-library-charcoal-muted max-w-md mb-6 leading-relaxed">
        The archive volume, index page, or record entry you are searching for does not exist in our library catalog or has been archived elsewhere.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-library-green hover:bg-library-green-dark text-library-ivory font-serif font-bold text-xs rounded-xl border border-library-gold/40 shadow-sm transition-all"
      >
        <Home className="w-4 h-4 text-library-gold" />
        Return to Curator Dashboard
      </Link>
    </div>
  );
};