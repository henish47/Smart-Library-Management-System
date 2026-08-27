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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Library Dashboard</h1>
          <p className="text-xs text-slate-500">Summary overview of library stock and active student borrowings</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/issue-book')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            + Issue Book
          </button>
          <button
            onClick={() => navigate('/return-book')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Return Book
          </button>
        </div>
      </div>

      {/* 4 Simple Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Books */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Books</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {stats?.totalBooks !== undefined ? stats.totalBooks : 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {stats?.totalStudents !== undefined ? stats.totalStudents : 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Issued Books */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issued Books</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats?.issuedBooks !== undefined ? stats.issuedBooks : 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookPlus className="w-5 h-5" />
          </div>
        </div>

        {/* Available Books */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Books</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats?.availableBooks !== undefined ? stats.availableBooks : 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Latest book borrowing and return records</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            View All Transactions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Book</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{tx.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">{tx.studentName}</span>{' '}
                      <span className="text-slate-400">({tx.studentEnrollment})</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{tx.bookTitle}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{tx.issueDate}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{tx.dueDate}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'ISSUED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    No recent transactions recorded.
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
