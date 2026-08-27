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
      <div>
        <h1 className="text-xl font-bold text-slate-800">Issue Book</h1>
        <p className="text-xs text-slate-500">Issue an available book to a student</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold text-emerald-800 underline"
            >
              View Transactions
            </button>
          </div>
        )}

        <form onSubmit={handleIssue} className="space-y-4 text-xs">
          {/* Select Student */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.enrollmentNo}) - {st.department || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Select Book */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Book *</label>
            <select
              required
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- Choose Book --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableQuantity <= 0}>
                  {b.title} by {b.author} ({b.availableQuantity > 0 ? `${b.availableQuantity} available` : 'OUT OF STOCK'})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-70 flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Issue Book
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
