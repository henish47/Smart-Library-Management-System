import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookPlus,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ArrowRight,
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

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const navigate = useNavigate();

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, booksRes] = await Promise.all([
        studentsAPI.getAll(),
        booksAPI.getAll(),
      ]);

      if (studentsRes && studentsRes.success) {
        setStudents(studentsRes.data || []);
      }
      if (booksRes && booksRes.success) {
        setBooks(booksRes.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const selectedStudent = students.find((s) => s.id === parseInt(selectedStudentId, 10));
  const selectedBook = books.find((b) => b.id === parseInt(selectedBookId, 10));

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId || !issueDate || !dueDate) {
      setFormError('Please select both a student and a book, and confirm dates.');
      return;
    }

    if (new Date(dueDate) < new Date(issueDate)) {
      setFormError('Due date cannot be earlier than Issue date.');
      return;
    }

    if (selectedBook && selectedBook.availableQuantity <= 0) {
      setFormError(`Book "${selectedBook.title}" is currently out of stock.`);
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        studentId: parseInt(selectedStudentId, 10),
        bookId: parseInt(selectedBookId, 10),
        issueDate,
        dueDate,
      };

      const res = await issuedBooksAPI.issueBook(payload);
      if (res && res.success) {
        setSuccessInfo(res.data);
        showToast('Book issued successfully!');
        // Refresh catalog quantities
        loadFormData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to issue book.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedStudentId('');
    setSelectedBookId('');
    setIssueDate(todayStr);
    setDueDate(defaultDue);
    setSuccessInfo(null);
    setFormError('');
  };

  if (loading) {
    return <LoadingSpinner message="Loading students & catalog data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadFormData} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
          <BookPlus className="w-7 h-7 text-indigo-600" />
          Issue / Borrow Book
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Assign available library copies to registered college students
        </p>
      </div>

      {successInfo ? (
        /* Success Card */
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Book Issued Successfully!</h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">Transaction ID #{successInfo.id}</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-800">{successInfo.studentName} ({successInfo.studentEnrollment})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Book:</span>
              <span className="font-bold text-slate-800">{successInfo.bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Issue Date:</span>
              <span className="font-mono font-medium text-slate-700">{successInfo.issueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due Date:</span>
              <span className="font-mono font-bold text-indigo-600">{successInfo.dueDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleResetForm}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Issue Another Book
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              View Transactions
            </button>
          </div>
        </div>
      ) : (
        /* Issue Form Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            {formError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Select Student *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="">-- Choose registered student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.enrollmentNo}) - {st.department || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Book */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Select Book to Loan *
                </label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="">-- Choose book from catalog --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableQuantity <= 0}>
                      {b.title} ({b.author}) — {b.availableQuantity > 0 ? `${b.availableQuantity} available` : 'OUT OF STOCK'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Return Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Standard college loan duration is 14 days.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 disabled:opacity-70 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      Confirm & Issue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Side Summary Info (1 col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Loan Preview</h3>

              {selectedStudent ? (
                <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs space-y-1">
                  <p className="font-bold text-indigo-900">{selectedStudent.name}</p>
                  <p className="font-mono text-indigo-700 text-[11px]">{selectedStudent.enrollmentNo}</p>
                  <p className="text-indigo-600 text-[11px]">{selectedStudent.department} (Sem {selectedStudent.semester})</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No student selected</p>
              )}

              {selectedBook ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">{selectedBook.title}</p>
                  <p className="text-slate-500 text-[11px]">By {selectedBook.author}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 text-[10px]">Shelf: {selectedBook.shelfNo || 'N/A'}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        selectedBook.availableQuantity > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedBook.availableQuantity} available
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No book selected</p>
              )}
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>
                Issuing automatically reduces the available book inventory by 1 copy using an atomic JDBC transaction.
              </span>
            </div>
          </div>
        </div>
      )}

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
