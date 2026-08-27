import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
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
      if (res?.success) {
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
    const q = searchQuery.toLowerCase();
    return (
      tx.studentName?.toLowerCase().includes(q) ||
      tx.studentEnrollment?.toLowerCase().includes(q) ||
      tx.bookTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Circulation Transactions</h1>
        <p className="text-xs text-slate-500">History of all issued and returned library books</p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-full sm:w-auto">
          {['ALL', 'ISSUED', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md transition-all flex-1 sm:flex-none ${
                statusFilter === st
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'ISSUED' ? 'Issued' : 'Returned'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSpinner message="Loading transactions..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTransactions} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description={searchQuery ? `No transactions match "${searchQuery}".` : 'No transactions recorded under this filter.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Book Title</th>
                  <th className="py-2.5 px-3 font-mono">Issue Date</th>
                  <th className="py-2.5 px-3 font-mono">Due Date</th>
                  <th className="py-2.5 px-3 font-mono">Return Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{tx.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">{tx.studentName}</span>{' '}
                      <span className="text-slate-400 font-mono">({tx.studentEnrollment})</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{tx.bookTitle}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tx.issueDate}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tx.dueDate}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {tx.returnDate ? (
                        <span className="text-emerald-700 font-semibold">{tx.returnDate}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Showing {filteredTransactions.length} transaction records
          </div>
        </div>
      )}
    </div>
  );
};
