import React, { useState, useEffect } from 'react';
import {
  BookCheck,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  User,
  BookOpen,
  ArrowDownLeft,
} from 'lucide-react';
import { issuedBooksAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';

export const ReturnBook = () => {
  const [issuedList, setIssuedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Return Modal State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const loadIssuedBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await issuedBooksAPI.getAll('ISSUED');
      if (res && res.success) {
        setIssuedList(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssuedBooks();
  }, []);

  const handleOpenReturnModal = (tx) => {
    setSelectedTransaction(tx);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedTransaction || !returnDate) return;

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        issueId: selectedTransaction.id,
        returnDate,
      };

      const res = await issuedBooksAPI.returnBook(payload);
      if (res && res.success) {
        showToast(`Book "${selectedTransaction.bookTitle}" returned successfully!`);
        setIsModalOpen(false);
        setSelectedTransaction(null);
        loadIssuedBooks();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIssued = issuedList.filter((tx) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BookCheck className="w-7 h-7 text-emerald-600" />
            Book Return Desk
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Accept returned books, record return date, and automatically restore shelf inventory
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold self-start sm:self-auto">
          {issuedList.length} Active Borrowed Loans
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, enrollment no, or book title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner message="Fetching currently borrowed books..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIssuedBooks} />
      ) : filteredIssued.length === 0 ? (
        <EmptyState
          icon={BookCheck}
          title="No Active Loans to Return"
          description={
            searchQuery
              ? `No active loans match "${searchQuery}".`
              : 'All borrowed books have been returned! The shelves are fully stocked.'
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Borrowing Student</th>
                  <th className="py-3.5 px-4">Book Details</th>
                  <th className="py-3.5 px-4 font-mono">Issue Date</th>
                  <th className="py-3.5 px-4 font-mono">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssued.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">#{tx.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-sm">{tx.studentName}</p>
                      <p className="text-indigo-600 font-mono text-[11px] font-semibold">{tx.studentEnrollment}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{tx.bookTitle}</p>
                      <p className="text-slate-400 font-mono text-[11px]">ISBN: {tx.bookIsbn}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{tx.issueDate}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{tx.dueDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReturnModal(tx)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-all"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Return Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {filteredIssued.length} unreturned loans</span>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Book Return"
        size="md"
      >
        {formError && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-800">
                {selectedTransaction?.studentName} ({selectedTransaction?.studentEnrollment})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Book Title:</span>
              <span className="font-bold text-slate-800">{selectedTransaction?.bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Borrowed On:</span>
              <span className="font-mono text-slate-600">{selectedTransaction?.issueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due Date:</span>
              <span className="font-mono text-slate-600">{selectedTransaction?.dueDate}</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Actual Return Date *
            </label>
            <input
              type="date"
              required
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
            ✓ Returning will update status to <strong>RETURNED</strong> and increment available quantity by 1.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 disabled:opacity-70"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Complete Return
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};
