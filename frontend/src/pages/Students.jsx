import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { studentsAPI } from '../services/api';
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

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
      if (res?.success) {
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
        if (res?.success) {
          showToast(`Student "${payload.name}" updated!`);
          setIsModalOpen(false);
          loadStudents();
        }
      } else {
        const res = await studentsAPI.create(payload);
        if (res?.success) {
          showToast(`Student "${payload.name}" registered!`);
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
      if (res?.success) {
        showToast(`Student "${studentToDelete.name}" deleted.`);
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
        loadStudents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete student.', 'error');
      setIsDeleteModalOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-library-border/70">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-library-green-dark tracking-tight">
            Reader Registry
          </h1>
          <p className="font-serif text-xs italic text-library-charcoal-muted mt-1">
            Student memberships, academic departments, and borrowing permissions directory
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-library-green hover:bg-library-green-dark text-library-ivory text-xs font-semibold rounded-lg shadow-sm border border-library-gold/30 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 text-library-gold" />
          <span>Enroll New Reader</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-library-border shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directory by enrollment no, student name, or branch..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal placeholder:text-library-charcoal-muted/70 transition-all"
          />
          <Search className="w-4 h-4 text-library-walnut absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner message="Consulting membership records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Readers Found"
          description={searchQuery ? `No records found matching "${searchQuery}".` : 'No registered students in the library records yet.'}
          actionText="Enroll First Reader"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-library-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-library-cream/60 border-b border-library-border text-library-charcoal font-serif font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Ref #</th>
                  <th className="py-3 px-3.5">Enrollment No</th>
                  <th className="py-3 px-3.5">Reader Name</th>
                  <th className="py-3 px-3.5">Department</th>
                  <th className="py-3 px-3.5 text-center">Semester</th>
                  <th className="py-3 px-3.5">Contact Email</th>
                  <th className="py-3 px-3.5">Phone</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-library-border/50 bg-white">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-library-cream/20 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted font-medium">#{st.id}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-library-green-dark">{st.enrollmentNo}</td>
                    <td className="py-3 px-3.5 font-serif font-bold text-library-charcoal text-sm">{st.name}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2.5 py-0.5 rounded bg-library-cream/80 text-library-walnut-dark border border-library-border/70 font-medium text-[11px]">
                        {st.department || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-semibold text-library-charcoal">Sem {st.semester}</td>
                    <td className="py-3 px-3.5 text-library-charcoal font-mono text-[11px]">{st.email || '-'}</td>
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted">{st.phone || '-'}</td>
                    <td className="py-3 px-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(st)}
                        className="px-2.5 py-1 bg-library-cream/70 hover:bg-library-cream text-library-charcoal border border-library-border rounded font-medium text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setStudentToDelete(st);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-medium text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3.5 bg-library-cream/40 border-t border-library-border text-xs text-library-charcoal-muted font-serif flex items-center justify-between">
            <span>Official Reader Directory Records</span>
            <span className="font-semibold text-library-charcoal">Total {students.length} readers registered</span>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Reader Record' : 'Enroll New Reader'}
        size="sm"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Enrollment Number *</label>
            <input
              type="text"
              required
              value={formData.enrollmentNo}
              onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
              placeholder="e.g. 210010116001"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal font-mono"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aarav Patel"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-serif font-bold text-library-charcoal mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Engineering"
                className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
              />
            </div>

            <div>
              <label className="block font-serif font-bold text-library-charcoal mb-1">Semester (1-8)</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@college.edu"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal font-mono"
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
              disabled={formSubmitting}
              className="px-5 py-2 rounded-lg bg-library-green hover:bg-library-green-dark text-library-ivory font-semibold border border-library-gold/30 shadow-sm transition-all disabled:opacity-70"
            >
              {formSubmitting ? 'Registering...' : editingStudent ? 'Save Updates' : 'Enroll Reader'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Reader De-registration"
        size="sm"
      >
        <div className="space-y-4 text-xs text-library-charcoal">
          <p className="font-serif">
            Are you sure you want to remove reader <strong className="text-library-green-dark">"{studentToDelete?.name}"</strong> ({studentToDelete?.enrollmentNo}) from the directory?
          </p>
          <p className="text-[11px] text-library-charcoal-muted italic">
            This will permanently delete the membership record.
          </p>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-library-border/70">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-library-border text-library-charcoal hover:bg-library-cream transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteStudent}
              disabled={formSubmitting}
              className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-all disabled:opacity-70"
            >
              {formSubmitting ? 'Removing...' : 'Delete Reader'}
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
