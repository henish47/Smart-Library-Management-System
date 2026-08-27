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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Students Management</h1>
          <p className="text-xs text-slate-500">Manage registered college students</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Simple Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by enrollment no or name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </form>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner message="Loading students..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description={searchQuery ? `No matches for "${searchQuery}".` : 'No registered students yet.'}
          actionText="Add Student"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Enrollment No</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Semester</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{st.id}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{st.enrollmentNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{st.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{st.department || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{st.semester}</td>
                    <td className="py-2.5 px-3 text-slate-600">{st.email || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{st.phone || '-'}</td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(st)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setStudentToDelete(st);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Total {students.length} students registered
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="sm"
      >
        {formError && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Enrollment Number *</label>
            <input
              type="text"
              required
              value={formData.enrollmentNo}
              onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
              placeholder="e.g. 210010116001"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. CE"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester (1-8)</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
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
              disabled={formSubmitting}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-70"
            >
              {formSubmitting ? 'Saving...' : editingStudent ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Are you sure you want to delete student <strong>{studentToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteStudent}
              disabled={formSubmitting}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-70"
            >
              {formSubmitting ? 'Deleting...' : 'Delete'}
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
