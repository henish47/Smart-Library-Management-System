import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { booksAPI, studentsAPI, issuedBooksAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';

export const IssueBook = () => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, booksRes] = await Promise.all([
        studentsAPI.getAll(),
        booksAPI.getAll(),
      ]);

      if (studentsRes?.success) setStudents(studentsRes.data || []);
      if (booksRes?.success) setBooks(booksRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!studentId || !bookId || !issueDate || !dueDate) {
      setFormError('Please select student, book, and due date.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      setSuccessMessage('');

      const payload = {
        studentId: parseInt(studentId, 10),
        bookId: parseInt(bookId, 10),
        issueDate,
        dueDate,
      };

      const res = await issuedBooksAPI.issueBook(payload);
      if (res?.success) {
        setSuccessMessage('Book issued successfully!');
        showToast('Book issued successfully!');
        setStudentId('');
        setBookId('');
        loadData(); // reload available quantities
      }
    } catch (err) {
      setFormError(err.message || 'Failed to issue book.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading students and books..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="pb-2 border-b border-library-border/70">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-library-green-dark tracking-tight">
          Circulation Desk: Issue Volume
        </h1>
        <p className="font-serif text-xs italic text-library-charcoal-muted mt-1">
          Record student book borrowing and generate official loan due date
        </p>
      </div>

      <div className="bg-white rounded-xl p-7 border border-library-border border-t-4 border-t-library-green shadow-sm space-y-5">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-library-green-subtle border border-library-green/40 rounded-lg text-library-green-dark text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-library-green flex-shrink-0" />
              <span className="font-serif font-semibold">{successMessage}</span>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-serif font-bold text-library-walnut hover:underline"
            >
              View Circulation Ledger →
            </button>
          </div>
        )}

        {/* Academic Slip Notice */}
        <div className="bg-library-cream/50 border border-library-border p-3.5 rounded-lg text-[11px] text-library-charcoal flex items-start gap-2.5">
          <BookPlus className="w-4 h-4 text-library-walnut flex-shrink-0 mt-0.5" />
          <p>
            Standard library loan policy grants <strong>14 days</strong> circulation. Verified volume available count will be adjusted on the shelf automatically.
          </p>
        </div>

        <form onSubmit={handleIssue} className="space-y-4 text-xs">
          {/* Select Student */}
          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1.5">Select Enrolled Reader *</label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            >
              <option value="">-- Choose Reader from Directory --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.enrollmentNo}) - {st.department || 'General'}
                </option>
              ))}
            </select>
          </div>

          {/* Select Book */}
          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1.5">Select Catalog Volume *</label>
            <select
              required
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            >
              <option value="">-- Choose Volume from Catalog --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableQuantity <= 0}>
                  {b.title} by {b.author} ({b.availableQuantity > 0 ? `${b.availableQuantity} available` : 'OUT OF STOCK'})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-serif font-bold text-library-charcoal mb-1.5">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal font-mono"
              />
            </div>

            <div>
              <label className="block font-serif font-bold text-library-charcoal mb-1.5">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-library-border/70 flex items-center justify-end gap-2.5">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-library-green hover:bg-library-green-dark text-library-ivory font-semibold text-xs border border-library-gold/30 shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm & Issue Book</span>
            </button>
          </div>
        </form>
      </div>

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
