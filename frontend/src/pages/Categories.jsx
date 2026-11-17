import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { categoriesAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form State
  const initialForm = { name: '', description: '' };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await categoriesAPI.getAll();
      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      if (editingCategory) {
        const payload = { id: editingCategory.id, ...formData };
        const res = await categoriesAPI.update(payload);
        if (res?.success) {
          showToast(`Category "${formData.name}" updated!`);
          setIsModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await categoriesAPI.create(formData);
        if (res?.success) {
          showToast(`Category "${formData.name}" created!`);
          setIsModalOpen(false);
          loadCategories();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setFormSubmitting(true);
      const res = await categoriesAPI.delete(categoryToDelete.id);
      if (res?.success) {
        showToast(`Category "${categoryToDelete.name}" deleted.`);
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        loadCategories();
      }
    } catch (err) {
      showToast(err.message || 'Cannot delete category containing books.', 'error');
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
            Classification & Genres
          </h1>
          <p className="font-serif text-xs italic text-library-charcoal-muted mt-1">
            Organize volumes into academic disciplines, departments, and research subjects
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-library-green hover:bg-library-green-dark text-library-ivory text-xs font-semibold rounded-lg shadow-sm border border-library-gold/30 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 text-library-gold" />
          <span>New Classification</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner message="Loading classification archives..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Classifications Defined"
          description="Create academic categories to organize and index library volumes."
          actionText="Create First Category"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-library-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-library-cream/60 border-b border-library-border text-library-charcoal font-serif font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Ref #</th>
                  <th className="py-3 px-3.5">Classification Name</th>
                  <th className="py-3 px-3.5">Subject Description</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-library-border/50 bg-white">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-library-cream/20 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted font-medium">#{cat.id}</td>
                    <td className="py-3 px-3.5 font-serif font-bold text-library-green-dark text-sm">{cat.name}</td>
                    <td className="py-3 px-3.5 text-library-charcoal font-medium">{cat.description || '-'}</td>
                    <td className="py-3 px-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="px-2.5 py-1 bg-library-cream/70 hover:bg-library-cream text-library-charcoal border border-library-border rounded font-medium text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(cat);
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
            <span>Academic Classification Index</span>
            <span className="font-semibold text-library-charcoal">Total {categories.length} categories indexed</span>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Classification' : 'Add New Classification'}
        size="sm"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Classification Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Scope & Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Machine learning, neural networks, computer vision, algorithms"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
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
              {formSubmitting ? 'Saving...' : editingCategory ? 'Save Updates' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Category Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs text-library-charcoal">
          <p className="font-serif">
            Are you sure you want to remove category <strong className="text-library-green-dark">"{categoryToDelete?.name}"</strong>?
          </p>
          <p className="text-[11px] text-library-charcoal-muted italic">
            Note: If books are currently linked to this category, deletion may be prevented to protect catalog integrity.
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
              onClick={handleDeleteCategory}
              disabled={formSubmitting}
              className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-all disabled:opacity-70"
            >
              {formSubmitting ? 'Deleting...' : 'Delete Category'}
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
