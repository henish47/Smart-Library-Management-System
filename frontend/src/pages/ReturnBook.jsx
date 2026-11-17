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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-library-border/70">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-library-green-dark tracking-tight">
            Circulation Desk: Return Processing
          </h1>
          <p className="font-serif text-xs italic text-library-charcoal-muted mt-1">
            Accept borrowed volumes back into repository custody and replenish shelf stock
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-library-gold-subtle text-library-walnut border border-library-gold/40 rounded-lg text-xs font-serif font-bold self-start sm:self-auto shadow-sm">
          {issuedList.length} Volumes Currently Circulated
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-library-border shadow-sm">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active loans by reader name, enrollment, or volume title..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal placeholder:text-library-charcoal-muted/70 transition-all"
          />
          <Search className="w-4 h-4 text-library-walnut absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSpinner message="Consulting active circulation logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIssuedBooks} />
      ) : filteredIssued.length === 0 ? (
        <EmptyState
          title="All Volumes Shelved"
          description={searchQuery ? `No active loans match "${searchQuery}".` : 'All issued library volumes have been safely returned to the stacks.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-library-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-library-cream/60 border-b border-library-border text-library-charcoal font-serif font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Loan Ref</th>
                  <th className="py-3 px-3.5">Reader Name</th>
                  <th className="py-3 px-3.5">Enrollment No</th>
                  <th className="py-3 px-3.5">Volume Title</th>
                  <th className="py-3 px-3.5">Issued Date</th>
                  <th className="py-3 px-3.5">Expected Due</th>
                  <th className="py-3 px-3.5 text-right">Circulation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-library-border/50 bg-white">
                {filteredIssued.map((tx) => (
                  <tr key={tx.id} className="hover:bg-library-cream/20 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted font-medium">#{tx.id}</td>
                    <td className="py-3 px-3.5 font-serif font-bold text-library-charcoal">{tx.studentName}</td>
                    <td className="py-3 px-3.5 font-mono text-library-green-dark font-medium">{tx.studentEnrollment}</td>
                    <td className="py-3 px-3.5 font-medium text-library-green-dark">{tx.bookTitle}</td>
                    <td className="py-3 px-3.5 font-mono text-library-charcoal">{tx.issueDate}</td>
                    <td className="py-3 px-3.5 font-mono text-library-walnut font-bold">{tx.dueDate}</td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => handleOpenReturnModal(tx)}
                        className="px-3 py-1.5 bg-library-green hover:bg-library-green-dark text-library-ivory font-semibold rounded-lg text-xs border border-library-gold/30 shadow-sm transition-all"
                      >
                        Accept Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3.5 bg-library-cream/40 border-t border-library-border text-xs text-library-charcoal-muted font-serif flex items-center justify-between">
            <span>Outstanding Circulation Register</span>
            <span className="font-semibold text-library-charcoal">Showing {filteredIssued.length} active loans</span>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Volume Return"
        size="sm"
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
          <div className="p-4 bg-library-cream/50 rounded-xl space-y-2 border border-library-border text-library-charcoal font-serif">
            <p><strong>Enrolled Reader:</strong> <span className="font-sans font-medium">{selectedTx?.studentName} ({selectedTx?.studentEnrollment})</span></p>
            <p><strong>Volume:</strong> <span className="text-library-green-dark font-bold">{selectedTx?.bookTitle}</span></p>
            <p><strong>Issue Date:</strong> <span className="font-mono text-xs">{selectedTx?.issueDate}</span></p>
            <p><strong>Due Date:</strong> <span className="font-mono text-xs text-library-walnut font-bold">{selectedTx?.dueDate}</span></p>
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1.5">Official Return Date *</label>
            <input
              type="date"
              required
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal font-mono"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-library-border/70">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-library-border text-library-charcoal hover:bg-library-cream transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-library-green hover:bg-library-green-dark text-library-ivory font-semibold border border-library-gold/30 shadow-sm transition-all disabled:opacity-70 flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Restore to Stacks</span>
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
