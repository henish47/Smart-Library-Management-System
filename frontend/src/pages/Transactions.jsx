import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
} from 'lucide-react';
import { issuedBooksAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await issuedBooksAPI.getAll(statusFilter);
      if (res && res.success) {
        setTransactions(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [statusFilter]);

  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      tx.studentName?.toLowerCase().includes(query) ||
      tx.studentEnrollment?.toLowerCase().includes(query) ||
      tx.bookTitle?.toLowerCase().includes(query) ||
      tx.bookIsbn?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-indigo-600" />
          Transaction Logs & Circulation History
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Complete audit trail of all library book borrowings and returns
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {['ALL', 'ISSUED', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${
                statusFilter === st
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Transactions' : st === 'ISSUED' ? 'Currently Borrowed' : 'Returned'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by student or book title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Loading circulation history..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTransactions} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Transactions Found"
          description={searchQuery ? `No transactions match "${searchQuery}".` : 'No loan activity recorded under this status.'}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Student Info</th>
                  <th className="py-3.5 px-4">Book Info</th>
                  <th className="py-3.5 px-4 font-mono">Issue Date</th>
                  <th className="py-3.5 px-4 font-mono">Due Date</th>
                  <th className="py-3.5 px-4 font-mono">Return Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">#{tx.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-sm">{tx.studentName}</p>
                      <p className="text-indigo-600 font-mono text-[11px] font-medium">{tx.studentEnrollment}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{tx.bookTitle}</p>
                      <p className="text-slate-400 font-mono text-[11px]">ISBN: {tx.bookIsbn}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{tx.issueDate}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{tx.dueDate}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {tx.returnDate ? (
                        <span className="text-emerald-700 font-semibold">{tx.returnDate}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Returned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {filteredTransactions.length} transaction records</span>
          </div>
        </div>
      )}
    </div>
  );
};
