import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BookPlus,
  BookCheck,
  History,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      } else {
        throw new Error(res?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard statistics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-library-border/70">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-library-green-dark tracking-tight">
            Curator's Dashboard
          </h1>
          <p className="text-xs text-library-charcoal-muted mt-1 font-serif italic">
            Catalog inventory ledger & active borrowing overview
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/issue-book')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-library-green hover:bg-library-green-dark text-library-ivory text-xs font-semibold rounded-lg shadow-sm border border-library-gold/30 transition-all hover:shadow"
          >
            <BookPlus className="w-3.5 h-3.5 text-library-gold" />
            <span>Issue Volume</span>
          </button>
          <button
            onClick={() => navigate('/return-book')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-library-walnut hover:bg-library-walnut-dark text-library-ivory text-xs font-semibold rounded-lg shadow-sm border border-library-border/60 transition-all hover:shadow"
          >
            <BookCheck className="w-3.5 h-3.5 text-library-gold" />
            <span>Accept Return</span>
          </button>
        </div>
      </div>

      {/* 4 Classic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Books */}
        <div className="bg-white rounded-xl p-5 border border-library-border border-l-4 border-l-library-green shadow-sm card-hover flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-library-charcoal-muted uppercase tracking-wider">Catalog Titles</p>
            <h3 className="font-serif text-3xl font-bold text-library-green-dark mt-1">
              {stats?.totalBooks !== undefined ? stats.totalBooks : 0}
            </h3>
            <span className="text-[10px] text-library-charcoal-muted">Volumes in repository</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-library-green/10 text-library-green border border-library-green/20 flex items-center justify-center shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-xl p-5 border border-library-border border-l-4 border-l-library-gold shadow-sm card-hover flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-library-charcoal-muted uppercase tracking-wider">Enrolled Readers</p>
            <h3 className="font-serif text-3xl font-bold text-library-charcoal mt-1">
              {stats?.totalStudents !== undefined ? stats.totalStudents : 0}
            </h3>
            <span className="text-[10px] text-library-charcoal-muted">Registered memberships</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-library-gold/15 text-library-walnut border border-library-gold/30 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Issued Books */}
        <div className="bg-white rounded-xl p-5 border border-library-border border-l-4 border-l-library-walnut shadow-sm card-hover flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-library-charcoal-muted uppercase tracking-wider">Active Loans</p>
            <h3 className="font-serif text-3xl font-bold text-library-walnut mt-1">
              {stats?.issuedBooks !== undefined ? stats.issuedBooks : 0}
            </h3>
            <span className="text-[10px] text-library-walnut">Currently circulated</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-library-walnut/15 text-library-walnut border border-library-walnut/30 flex items-center justify-center shadow-inner">
            <BookPlus className="w-5 h-5" />
          </div>
        </div>

        {/* Available Books */}
        <div className="bg-white rounded-xl p-5 border border-library-border border-l-4 border-l-library-green-dark shadow-sm card-hover flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-library-charcoal-muted uppercase tracking-wider">On Shelf Stock</p>
            <h3 className="font-serif text-3xl font-bold text-library-green-dark mt-1">
              {stats?.availableBooks !== undefined ? stats.availableBooks : 0}
            </h3>
            <span className="text-[10px] text-library-green">Ready for checkout</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-library-green-subtle text-library-green-dark border border-library-green/20 flex items-center justify-center shadow-inner">
            <BookCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-library-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-library-border/60 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-library-green-dark">Circulation Ledger</h2>
            <p className="text-xs text-library-charcoal-muted">Recent loan checkouts and returns recorded in the archive</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="font-serif text-xs font-semibold text-library-walnut hover:text-library-green flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Complete Audit Records</span>
            <History className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-library-border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-library-cream/60 border-b border-library-border text-library-charcoal font-serif font-bold uppercase tracking-wider">
                <th className="py-3 px-3.5">Ref #</th>
                <th className="py-3 px-3.5">Reader</th>
                <th className="py-3 px-3.5">Volume Title</th>
                <th className="py-3 px-3.5">Issued Date</th>
                <th className="py-3 px-3.5">Due Date</th>
                <th className="py-3 px-3.5 text-right">Circulation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-library-border/50 bg-white">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-library-cream/20 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted font-medium">#{tx.id}</td>
                    <td className="py-3 px-3.5">
                      <span className="font-semibold text-library-charcoal">{tx.studentName}</span>{' '}
                      <span className="text-library-charcoal-muted text-[11px]">({tx.studentEnrollment})</span>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-library-green-dark">{tx.bookTitle}</td>
                    <td className="py-3 px-3.5 text-library-charcoal font-mono">{tx.issueDate}</td>
                    <td className="py-3 px-3.5 text-library-charcoal font-mono">{tx.dueDate}</td>
                    <td className="py-3 px-3.5 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          tx.status === 'ISSUED'
                            ? 'bg-library-gold-subtle text-library-walnut border-library-gold/40'
                            : 'bg-library-green-subtle text-library-green-dark border-library-green/40'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-library-charcoal-muted italic font-serif">
                    No recent circulation transactions recorded in the ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
