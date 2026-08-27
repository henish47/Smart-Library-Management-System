import React, { useState, useEffect } from 'react';
import {
  BookCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { issuedBooksAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';

export const ReturnBook = () => {
  const [issuedList, setIssuedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Return Modal
  const [selectedTx, setSelectedTx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const loadIssuedBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await issuedBooksAPI.getAll('ISSUED');
      if (res?.success) {
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
    setSelectedTx(tx);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedTx || !returnDate) return;

    try {
      setSubmitting(true);
      const payload = {
        issueId: selectedTx.id,
        returnDate,
      };

      const res = await issuedBooksAPI.returnBook(payload);
      if (res?.success) {
        showToast(`Book "${selectedTx.bookTitle}" returned successfully!`);
        setIsModalOpen(false);
        setSelectedTx(null);
        loadIssuedBooks();
      }
    } catch (err) {
      showToast(err.message || 'Failed to return book.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIssued = issuedList.filter((tx) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Return Book</h1>
          <p className="text-xs text-slate-500">Process returned books and restore shelf stock</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold self-start sm:self-auto">
          {issuedList.length} Currently Issued
        </span>
      </div>

      {/* Simple Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or book title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSpinner message="Loading issued books..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIssuedBooks} />
      ) : filteredIssued.length === 0 ? (
        <EmptyState
          title="No Books to Return"
          description={searchQuery ? `No matches for "${searchQuery}".` : 'All issued books have been returned.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Enrollment</th>
                  <th className="py-2.5 px-3">Book Title</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssued.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{tx.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{tx.studentName}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-600 font-medium">{tx.studentEnrollment}</td>
                    <td className="py-2.5 px-3 text-slate-800">{tx.bookTitle}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tx.issueDate}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-semibold">{tx.dueDate}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenReturnModal(tx)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Showing {filteredIssued.length} unreturned books
          </div>
        </div>
      )}

      {/* Return Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Return"
        size="sm"
      >
        <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-200">
            <p><strong>Student:</strong> {selectedTx?.studentName} ({selectedTx?.studentEnrollment})</p>
            <p><strong>Book:</strong> {selectedTx?.bookTitle}</p>
            <p><strong>Issue Date:</strong> {selectedTx?.issueDate}</p>
            <p><strong>Due Date:</strong> {selectedTx?.dueDate}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Actual Return Date *</label>
            <input
              type="date"
              required
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-70 flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Return
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
