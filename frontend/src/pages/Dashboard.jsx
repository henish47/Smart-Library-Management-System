import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookCheck,
  BookPlus,
  Users,
  Layers,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      } else {
        throw new Error(res?.message || 'Failed to fetch dashboard metrics');
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
    return <LoadingSpinner message="Gathering library statistics and analytics..." size="large" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load dashboard metrics"
        message={error}
        onRetry={fetchStats}
      />
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Administrator'}! 👋
          </h1>
          <p className="mt-1 text-sm text-indigo-200 max-w-xl">
            Here is the live real-time inventory and circulation status of the Smart Library.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/issue-book')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <BookPlus className="w-4 h-4" />
            Issue Book
          </button>
          <button
            onClick={() => navigate('/return-book')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all shadow-md"
          >
            <BookCheck className="w-4 h-4 text-emerald-600" />
            Return Book
          </button>
        </div>

        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Books"
          value={stats?.totalBooks}
          subtitle={`${stats?.totalTitles || 0} unique titles`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Available Stock"
          value={stats?.availableBooks}
          subtitle="Ready to borrow"
          icon={BookCheck}
          color="emerald"
        />
        <StatCard
          title="Currently Issued"
          value={stats?.issuedBooks}
          subtitle="Active student loans"
          icon={ArrowUpRight}
          color="amber"
        />
        <StatCard
          title="Returned Books"
          value={stats?.returnedBooks}
          subtitle="Completed loans"
          icon={ArrowDownLeft}
          color="blue"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents}
          subtitle="Registered members"
          icon={Users}
          color="violet"
        />
        <StatCard
          title="Categories"
          value={stats?.totalCategories}
          subtitle="Subject genres"
          icon={Layers}
          color="rose"
        />
      </div>

      {/* Main Grid: Recent Transactions & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Recent Transactions</h2>
                <p className="text-xs text-slate-500">Latest book borrowing and return activity</p>
              </div>
              <button
                onClick={() => navigate('/transactions')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-2">ID</th>
                    <th className="pb-3 px-2">Student</th>
                    <th className="pb-3 px-2">Book Title</th>
                    <th className="pb-3 px-2">Issue Date</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    stats.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-2 font-mono font-medium text-slate-500">#{tx.id}</td>
                        <td className="py-3 px-2">
                          <p className="font-bold text-slate-800">{tx.studentName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{tx.studentEnrollment}</p>
                        </td>
                        <td className="py-3 px-2 max-w-[200px] truncate font-medium text-slate-700" title={tx.bookTitle}>
                          {tx.bookTitle}
                        </td>
                        <td className="py-3 px-2 text-slate-500 font-mono">{tx.issueDate}</td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              tx.status === 'ISSUED'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top 5 latest operations</span>
            <button
              onClick={() => navigate('/issue-book')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              + Create New Loan
            </button>
          </div>
        </div>

        {/* Category Breakdown (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Category Distribution</h2>
                <p className="text-xs text-slate-500">Stock distribution by subject discipline</p>
              </div>
              <button
                onClick={() => navigate('/categories')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
                stats.categoryDistribution.slice(0, 6).map((cat, idx) => {
                  const percentage = stats.totalBooks > 0 ? Math.round((cat.bookCount / stats.totalBooks) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 truncate max-w-[180px]">{cat.name}</span>
                        <span className="text-slate-500 font-mono">
                          {cat.bookCount} copies ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No categories created yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              View Full Analytics Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
