import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  History,
  BookOpen,
} from 'lucide-react';
import { studentsAPI, issuedBooksAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form State
  const initialForm = {
    enrollmentNo: '',
    name: '',
    department: 'Computer Engineering',
    semester: 5,
    email: '',
    phone: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentsAPI.getAll();
      if (res && res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!searchQuery.trim()) {
        const res = await studentsAPI.getAll();
        setStudents(res.data || []);
      } else {
        const res = await studentsAPI.search(searchQuery.trim());
        setStudents(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      enrollmentNo: student.enrollmentNo,
      name: student.name,
      department: student.department || '',
      semester: student.semester || 1,
      email: student.email || '',
      phone: student.phone || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenHistoryModal = async (student) => {
    setSelectedStudent(student);
    setIsHistoryModalOpen(true);
    try {
      setHistoryLoading(true);
      const res = await issuedBooksAPI.getStudentHistory(student.id);
      if (res && res.success) {
        setStudentHistory(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load borrowing history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.enrollmentNo.trim() || !formData.name.trim()) {
      setFormError('Enrollment number and name are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      const payload = {
        ...formData,
        semester: parseInt(formData.semester, 10),
      };

      if (editingStudent) {
        payload.id = editingStudent.id;
        const res = await studentsAPI.update(payload);
        if (res && res.success) {
          showToast(`Student "${payload.name}" updated successfully!`);
          setIsModalOpen(false);
          loadStudents();
        }
      } else {
        const res = await studentsAPI.create(payload);
        if (res && res.success) {
          showToast(`Student "${payload.name}" registered successfully!`);
          setIsModalOpen(false);
          loadStudents();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setFormSubmitting(true);
      const res = await studentsAPI.delete(studentToDelete.id);
      if (res && res.success) {
        showToast(`Student "${studentToDelete.name}" deleted.`);
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
        loadStudents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
      setIsDeleteModalOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            Students Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage college student memberships, profiles, and borrowing records
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by enrollment no, name, branch, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSpinner message="Loading student records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description={searchQuery ? `No matches for "${searchQuery}".` : 'No students have been registered yet.'}
          actionText="Register Student"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student Name & Enrollment</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Semester</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-sm">{st.name}</p>
                      <p className="font-mono text-indigo-600 font-semibold text-xs">{st.enrollmentNo}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        {st.department || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {st.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {st.email && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{st.email}</span>
                        </div>
                      )}
                      {st.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{st.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenHistoryModal(st)}
                          title="Borrowing History"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          title="Edit Student"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(st);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete Student"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {students.length} registered students</span>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Register New Student'}
        size="md"
      >
        {formError && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Enrollment Number *</label>
            <input
              type="text"
              required
              value={formData.enrollmentNo}
              onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
              placeholder="e.g. 210010116001"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aarav Patel"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department / Branch</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Engineering"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester (1 to 8) *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@college.edu"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 disabled:opacity-70"
            >
              {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingStudent ? 'Update Profile' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Borrowing History: ${selectedStudent?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Enrollment: </span>
              <span className="font-bold text-slate-800 font-mono">{selectedStudent?.enrollmentNo}</span>
            </div>
            <div>
              <span className="text-slate-500">Department: </span>
              <span className="font-bold text-slate-800">{selectedStudent?.department} (Sem {selectedStudent?.semester})</span>
            </div>
          </div>

          {historyLoading ? (
            <LoadingSpinner message="Fetching borrowing logs..." />
          ) : studentHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No book borrowing history found for this student.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-2 px-2">Book Title</th>
                    <th className="pb-2 px-2">Issue Date</th>
                    <th className="pb-2 px-2">Due Date</th>
                    <th className="pb-2 px-2">Return Date</th>
                    <th className="pb-2 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-bold text-slate-800">{tx.bookTitle}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600">{tx.issueDate}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600">{tx.dueDate}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600">{tx.returnDate || '-'}</td>
                      <td className="py-2.5 px-2 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete student{' '}
            <strong className="text-slate-900 font-bold">{studentToDelete?.name}</strong>?
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
            ⚠️ Students with active unreturned books cannot be deleted.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteStudent}
              disabled={formSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30 disabled:opacity-70"
            >
              {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Student
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
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
