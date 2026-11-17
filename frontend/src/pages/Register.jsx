import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BookOpen,
  Bookmark,
  ShieldCheck,
  Library,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all required credentials.');
      return;
    }

    if (password.length < 4) {
      setError('Security password must contain at least 4 characters.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await register(name.trim(), username.trim(), email.trim(), password);
      setSuccessMsg('Account registered successfully! Transferring to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Username may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-library-ivory selection:bg-library-gold/30 selection:text-library-green-dark">
      {/* ================= LEFT SIDE: Classic Library Atmosphere (Desktop) ================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-library-green-dark via-[#142820] to-[#0c1a14] text-library-ivory p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-library-gold/20 shadow-2xl">
        {/* Classical ambient glows */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-library-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-library-green/30 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-library-green border border-library-gold/60 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-library-gold" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-library-ivory">
              Library Management System
            </h1>
            <p className="font-serif text-xs text-library-gold/90 italic">
              Athenaeum Institutional Archives & Circulation
            </p>
          </div>
        </div>

        {/* Central Editorial Showcase */}
        <div className="relative z-10 my-auto py-10">
          {/* Classic Library Quote */}
          <div className="relative pl-6 border-l-2 border-library-gold/70 mb-10">
            <p className="font-serif text-lg xl:text-xl text-library-ivory/95 italic leading-relaxed">
              "Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers."
            </p>
            <span className="block mt-3 font-serif text-xs uppercase tracking-widest text-library-gold font-bold">
              — Academic Staff Ethos
            </span>
          </div>

          {/* Academic System Highlights */}
          <div className="space-y-5 pt-6 border-t border-library-gold/20">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-library-green/70 border border-library-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bookmark className="w-4 h-4 text-library-gold" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-library-ivory">
                  Curator Privileges & Access
                </h4>
                <p className="font-serif text-xs text-library-cream/70 mt-0.5 leading-relaxed">
                  Full authority to accession new book volumes, classify genres, and monitor inventory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-library-green/70 border border-library-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-library-gold" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-library-ivory">
                  Audited Circulation Desk
                </h4>
                <p className="font-serif text-xs text-library-cream/70 mt-0.5 leading-relaxed">
                  Every book loan, reader borrowing, and returned manuscript is verified in the central ledger.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="relative z-10 pt-6 border-t border-library-gold/20 flex items-center justify-between text-[11px] font-serif text-library-cream/60">
          <span>Academic Library Edition</span>
          <span className="font-mono text-library-gold/90">Staff Enrollment Registry</span>
        </div>
      </div>

      {/* ================= RIGHT SIDE: Registration Form Card ================= */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 min-h-screen">
        {/* Mobile Header Banner (visible on screens smaller than lg) */}
        <div className="lg:hidden text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-library-green border-2 border-library-gold/50 shadow-md mb-3">
            <BookOpen className="w-7 h-7 text-library-gold" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-library-green-dark tracking-tight">
            Library Management System
          </h1>
          <p className="font-serif text-xs italic text-library-charcoal-muted mt-0.5">
            Academic Archives & Circulation Management System
          </p>
        </div>

        {/* Main Card Container */}
        <div className="w-full max-w-md">
          <div className="bg-white border border-library-border shadow-xl rounded-2xl p-7 sm:p-9 relative">
            {/* Subtle gold top ornament line */}
            <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-library-gold/70 to-transparent rounded-full" />

            <div className="mb-6">
              <span className="font-serif text-[11px] font-bold uppercase tracking-widest text-library-gold block mb-1">
                Administrative Staff
              </span>
              <h2 className="font-serif text-2xl font-bold text-library-green-dark tracking-tight">
                Curator Enrollment
              </h2>
              <p className="font-serif text-xs text-library-charcoal-muted mt-1 leading-relaxed">
                Register new administrative credentials into the library catalog & circulation system.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-700 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="block font-serif text-xs font-bold uppercase tracking-wider text-library-charcoal mb-1">
                  Full Name *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-library-walnut">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Henish Patel"
                    className="block w-full rounded-xl border border-library-border bg-library-ivory-light/40 pl-10 pr-3 py-2 text-xs text-library-charcoal placeholder:text-library-charcoal-muted/60 focus:border-library-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-library-green/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif text-xs font-bold uppercase tracking-wider text-library-charcoal mb-1">
                  Staff Username *
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
                    placeholder="e.g. admin_henish"
                    className="block w-full rounded-xl border border-library-border bg-library-ivory-light/40 pl-10 pr-3 py-2 text-xs text-library-charcoal placeholder:text-library-charcoal-muted/60 focus:border-library-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-library-green/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif text-xs font-bold uppercase tracking-wider text-library-charcoal mb-1">
                  Institutional Email
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-library-walnut">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="librarian@institution.edu"
                    className="block w-full rounded-xl border border-library-border bg-library-ivory-light/40 pl-10 pr-3 py-2 text-xs text-library-charcoal placeholder:text-library-charcoal-muted/60 focus:border-library-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-library-green/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif text-xs font-bold uppercase tracking-wider text-library-charcoal mb-1">
                  Security Password *
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
                    placeholder="Minimum 4 characters"
                    className="block w-full rounded-xl border border-library-border bg-library-ivory-light/40 pl-10 pr-3 py-2 text-xs text-library-charcoal placeholder:text-library-charcoal-muted/60 focus:border-library-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-library-green/20 transition-all"
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
                      <span>Registering Credentials...</span>
                    </>
                  ) : (
                    'Complete Staff Enrollment'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-library-border/70 text-center">
              <p className="font-serif text-xs text-library-charcoal-muted">
                Already enrolled as staff?{' '}
                <Link
                  to="/login"
                  className="font-bold text-library-walnut hover:text-library-green-dark underline decoration-library-gold/50 transition-colors"
                >
                  Sign in to system
                </Link>
              </p>
            </div>
          </div>

          {/* Micro Footer */}
          <p className="text-center font-serif text-[11px] text-library-charcoal-muted/60 mt-5">
            Athenaeum Library Repository System • Authorized Staff Access
          </p>
        </div>
      </div>
    </div>
  );
};