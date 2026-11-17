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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-library-border/70">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-library-green-dark tracking-tight">
            Catalog Management
          </h1>
          <p className="font-serif text-xs italic text-library-charcoal-muted mt-1">
            Browse, catalog, and manage volumes, authors, and circulation shelf inventory
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-library-green hover:bg-library-green-dark text-library-ivory text-xs font-semibold rounded-lg shadow-sm border border-library-gold/30 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 text-library-gold" />
          <span>Add New Volume</span>
        </button>
      </div>

      {/* Classic Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-library-border shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by title, author, or ISBN..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal placeholder:text-library-charcoal-muted/70 transition-all"
          />
          <Search className="w-4 h-4 text-library-walnut absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Books Table */}
      {loading ? (
        <LoadingSpinner message="Consulting library archives..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : books.length === 0 ? (
        <EmptyState
          title="No Volumes Found"
          description={searchQuery ? `No archived volumes match "${searchQuery}".` : 'No books cataloged in the library repository yet.'}
          actionText="Add First Volume"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-library-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-library-cream/60 border-b border-library-border text-library-charcoal font-serif font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Ref #</th>
                  <th className="py-3 px-3.5">Book Title</th>
                  <th className="py-3 px-3.5">Author</th>
                  <th className="py-3 px-3.5">ISBN</th>
                  <th className="py-3 px-3.5">Classification</th>
                  <th className="py-3 px-3.5 text-center">Total Stock</th>
                  <th className="py-3 px-3.5 text-center">Available</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-library-border/50 bg-white">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-library-cream/20 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted font-medium">#{book.id}</td>
                    <td className="py-3 px-3.5 font-serif font-bold text-library-green-dark text-sm">{book.title}</td>
                    <td className="py-3 px-3.5 text-library-charcoal font-medium">{book.author}</td>
                    <td className="py-3 px-3.5 font-mono text-library-charcoal-muted">{book.isbn}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2.5 py-0.5 rounded bg-library-cream/80 text-library-walnut-dark border border-library-border/70 font-medium text-[11px]">
                        {book.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-semibold text-library-charcoal">{book.quantity}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          book.availableQuantity > 0
                            ? 'bg-library-green-subtle text-library-green-dark border-library-green/40'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {book.availableQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="px-2.5 py-1 bg-library-cream/70 hover:bg-library-cream text-library-charcoal border border-library-border rounded font-medium text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setBookToDelete(book);
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
            <span>Showing archive repository records</span>
            <span className="font-semibold text-library-charcoal">Total {books.length} volumes in catalog</span>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Volume Details' : 'Catalog New Volume'}
        size="md"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Java: The Complete Reference"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Author *</label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Herbert Schildt"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">ISBN Number *</label>
            <input
              type="text"
              required
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="e.g. 978-0071809252"
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal font-mono"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-library-charcoal mb-1">Classification / Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-library-border bg-white focus:outline-none focus:border-library-green text-library-charcoal"
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
              <label className="block font-serif font-bold text-library-charcoal mb-1">Total Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
              />
            </div>

            <div>
              <label className="block font-serif font-bold text-library-charcoal mb-1">Available on Shelf *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-library-border bg-library-ivory-light/40 focus:outline-none focus:border-library-green focus:bg-white text-library-charcoal"
              />
            </div>
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
              {formSubmitting ? 'Recording...' : editingBook ? 'Save Updates' : 'Catalog Volume'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Archive Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs text-library-charcoal">
          <p className="font-serif">
            Are you certain you wish to delete volume <strong className="text-library-green-dark">"{bookToDelete?.title}"</strong> from the repository?
          </p>
          <p className="text-[11px] text-library-charcoal-muted italic">
            This action will remove the catalog entry and all inventory counts permanently.
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
              onClick={handleDeleteBook}
              disabled={formSubmitting}
              className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-all disabled:opacity-70"
            >
              {formSubmitting ? 'Removing...' : 'Delete Volume'}
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
