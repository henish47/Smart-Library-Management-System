import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Library, Lock, User, ArrowRight, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-library-green-dark via-[#142820] to-[#0e1c16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle classical ambient glows */}
      <div className="absolute top-0 -left-32 w-96 h-96 bg-library-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-library-green/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-library-green border-2 border-library-gold/50 shadow-xl mb-4">
          <BookOpen className="w-8 h-8 text-library-gold" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-library-ivory tracking-tight">
          Library Management System
        </h2>
        <p className="font-serif text-xs italic text-library-cream/70 mt-1">
          Academic Archives & Circulation Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-library-ivory border border-library-border shadow-2xl rounded-2xl p-6 sm:p-9 relative">
          {/* Subtle gold top trim */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-library-gold/60 to-transparent rounded-full" />

          <div className="mb-6 text-center">
            <h3 className="font-serif text-lg font-bold text-library-green-dark">
              Curator Authentication
            </h3>
            <p className="font-serif text-xs text-library-charcoal-muted mt-0.5">
              Sign in to access library catalog, readers, and loans
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-serif text-xs font-bold uppercase tracking-wider text-library-charcoal mb-1.5">
                Staff Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-library-walnut">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="block w-full rounded-xl border border-library-border bg-white pl-10 pr-3 py-2.5 text-xs text-library-charcoal placeholder:text-library-charcoal-muted/60 focus:border-library-green focus:outline-none focus:ring-2 focus:ring-library-green/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-serif text-xs font-bold uppercase tracking-wider text-library-charcoal mb-1.5">
                Security Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-library-walnut">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-library-border bg-white pl-10 pr-3 py-2.5 text-xs text-library-charcoal placeholder:text-library-charcoal-muted/60 focus:border-library-green focus:outline-none focus:ring-2 focus:ring-library-green/20 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-library-gold/40 rounded-xl font-serif text-xs font-bold text-library-ivory bg-library-green hover:bg-library-green-dark shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-library-gold" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Circulation</span>
                    <ArrowRight className="w-4 h-4 text-library-gold" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-library-border/60 text-center">
            <p className="font-serif text-xs text-library-charcoal-muted">
              Need new staff enrollment?{' '}
              <Link
                to="/register"
                className="font-bold text-library-walnut hover:text-library-green-dark underline decoration-library-gold/50 transition-colors"
              >
                Register credentials
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center font-serif text-[11px] text-library-cream/50 mt-5">
          Athenaeum Library Repository System • Authorized Staff Access
        </p>
      </div>
    </div>
  );
};