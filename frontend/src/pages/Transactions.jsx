import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-library-border/70">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-library-green-dark tracking-tight">
            Circulation Ledger & Audit Records
          </h1>
          <p className="font-serif text-xs italic text-library-charcoal-muted mt-1">
            Historical register of book loans, reader borrowings, and returned volumes
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-library-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-library-cream/60 p-1 rounded-lg text-xs font-serif font-semibold border border-library-border/60 w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'All Records' },
            { key: 'ISSUED', label: 'Active Loans' },
            { key: 'RETURNED', label: 'Returned Archive' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3.5 py-1.5 rounded-md transition-all flex-1 sm:flex-none text-xs font-serif ${
                statusFilter === key
                  ? 'bg-library-green text-library-ivory shadow-sm font-bold'
                  : 'text-library-charcoal hover:text-library-green-dark'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reader, enrollment, or title..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal placeholder:text-library-charcoal-muted/70 transition-all"
          />
          <Search className="w-4 h-4 text-library-walnut absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSpinner message="Consulting circulation ledger..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTransactions} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Circulation Records Found"
          description={
            searchQuery
              ? `No transactions match your search query "${searchQuery}".`
              : 'No transaction entries recorded under this register filter.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-library-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-library-cream/60 border-b border-library-border text-library-charcoal font-serif font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Slip #</th>
                  <th className="py-3 px-3.5">Reader / Patron</th>
                  <th className="py-3 px-3.5">Volume Title</th>
                  <th className="py-3 px-3.5 font-mono">Date Issued</th>
                  <th className="py-3 px-3.5 font-mono">Due Date</th>
                  <th className="py-3 px-3.5 font-mono">Date Returned</th>
                  <th className="py-3 px-3.5 text-right">Circulation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-library-border/50 bg-white">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-library-cream/20 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted font-medium">#{tx.id}</td>
                    <td className="py-3 px-3.5">
                      <span className="font-serif font-bold text-library-green-dark">{tx.studentName}</span>{' '}
                      <span className="text-library-charcoal-muted font-mono text-[11px]">({tx.studentEnrollment})</span>
                    </td>
                    <td className="py-3 px-3.5 font-serif font-semibold text-library-charcoal">{tx.bookTitle}</td>
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted">{tx.issueDate}</td>
                    <td className="py-3 px-3.5 font-mono text-library-walnut font-medium">{tx.dueDate}</td>
                    <td className="py-3 px-3.5 font-mono">
                      {tx.returnDate ? (
                        <span className="text-library-green font-semibold">{tx.returnDate}</span>
                      ) : (
                        <span className="text-library-charcoal-muted/50 italic font-sans">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {tx.status === 'ISSUED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-serif font-bold tracking-wider uppercase bg-library-gold/20 text-library-walnut border border-library-gold/40">
                          <Clock className="w-3 h-3 text-library-gold" />
                          On Loan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-serif font-bold tracking-wider uppercase bg-library-green/10 text-library-green border border-library-green/30">
                          <CheckCircle2 className="w-3 h-3 text-library-green" />
                          Returned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3.5 bg-library-cream/40 border-t border-library-border font-serif text-xs text-library-charcoal-muted flex justify-between items-center">
            <span>Showing {filteredTransactions.length} circulation ledger entries</span>
            <span className="font-mono text-[11px] text-library-walnut">Archive Log Verified</span>
          </div>
        </div>
      )}
    </div>
  );
};