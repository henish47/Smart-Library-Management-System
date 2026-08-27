import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { booksAPI, categoriesAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';

export const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    author: '',
    isbn: '',
    categoryId: '',
    quantity: 5,
    availableQuantity: 5,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [booksRes, catsRes] = await Promise.all([
        booksAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      if (booksRes?.success) setBooks(booksRes.data || []);
      if (catsRes?.success) setCategories(catsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!searchQuery.trim()) {
        const res = await booksAPI.getAll();
        setBooks(res.data || []);
      } else {
        const res = await booksAPI.search(searchQuery.trim());
        setBooks(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBook(null);
    setFormData({
      ...initialForm,
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: book.categoryId,
      quantity: book.quantity,
      availableQuantity: book.availableQuantity,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim() || !formData.categoryId) {
      setFormError('Title, Author, ISBN, and Category are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        quantity: parseInt(formData.quantity, 10),
        availableQuantity: parseInt(formData.availableQuantity, 10),
      };

      if (editingBook) {
        payload.id = editingBook.id;
        const res = await booksAPI.update(payload);
        if (res?.success) {
          showToast(`Book "${payload.title}" updated successfully!`);
          setIsModalOpen(false);
          loadData();
        }
      } else {
        const res = await booksAPI.create(payload);
        if (res?.success) {
          showToast(`Book "${payload.title}" added successfully!`);
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save book.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      setFormSubmitting(true);
      const res = await booksAPI.delete(bookToDelete.id);
      if (res?.success) {
        showToast(`Book "${bookToDelete.title}" deleted.`);
        setIsDeleteModalOpen(false);
        setBookToDelete(null);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete book.', 'error');
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
          <h1 className="text-xl font-bold text-slate-800">Books Management</h1>
          <p className="text-xs text-slate-500">Manage library books catalog and stock counts</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      {/* Simple Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </form>
      </div>

      {/* Books Table */}
      {loading ? (
        <LoadingSpinner message="Loading books..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : books.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description={searchQuery ? `No results for "${searchQuery}".` : 'No books in the library catalog yet.'}
          actionText="Add Book"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">ISBN</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Quantity</th>
                  <th className="py-2.5 px-3 text-center">Available</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{book.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{book.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{book.author}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{book.isbn}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {book.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{book.quantity}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          book.availableQuantity > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {book.availableQuantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setBookToDelete(book);
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
            Total {books.length} books in catalog
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
        size="md"
      >
        {formError && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Java: The Complete Reference"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Author *</label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Herbert Schildt"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ISBN *</label>
            <input
              type="text"
              required
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="e.g. 978-0071809252"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Available Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>
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
              {formSubmitting ? 'Saving...' : editingBook ? 'Update' : 'Add'}
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
            Are you sure you want to delete book <strong>{bookToDelete?.title}</strong>?
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
              onClick={handleDeleteBook}
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
