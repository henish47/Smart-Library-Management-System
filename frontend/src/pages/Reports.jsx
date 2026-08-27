import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { booksAPI, studentsAPI, issuedBooksAPI, categoriesAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('BOOKS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [booksData, setBooksData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const loadAllReportsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [booksRes, studentsRes, txRes, catsRes] = await Promise.all([
        booksAPI.getAll(),
        studentsAPI.getAll(),
        issuedBooksAPI.getAll('ALL'),
        categoriesAPI.getAll(),
      ]);

      if (booksRes?.success) setBooksData(booksRes.data || []);
      if (studentsRes?.success) setStudentsData(studentsRes.data || []);
      if (txRes?.success) setTransactionsData(txRes.data || []);
      if (catsRes?.success) setCategoriesData(catsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReportsData();
  }, []);

  // Client-Side CSV Export Functionality (Free & Lightweight)
  const exportToCSV = (data, filename, headers) => {
    if (!data || data.length === 0) {
      showToast('No data available to export.', 'warning');
      return;
    }

    const csvRows = [];
    // Header row
    csvRows.push(headers.map((h) => `"${h.label}"`).join(','));

    // Data rows
    data.forEach((row) => {
      const values = headers.map((h) => {
        let val = row[h.key];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filename}.csv successfully!`);
  };

  // Export handlers for each tab
  const handleExport = () => {
    if (activeTab === 'BOOKS') {
      const headers = [
        { label: 'Book ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Author', key: 'author' },
        { label: 'ISBN', key: 'isbn' },
        { label: 'Category', key: 'categoryName' },
        { label: 'Total Copies', key: 'quantity' },
        { label: 'Available Copies', key: 'availableQuantity' },
        { label: 'Shelf No', key: 'shelfNo' },
      ];
      exportToCSV(booksData, 'Books_Catalog_Report', headers);
    } else if (activeTab === 'ISSUED') {
      const activeLoans = transactionsData.filter((t) => t.status === 'ISSUED');
      const headers = [
        { label: 'Tx ID', key: 'id' },
        { label: 'Student Name', key: 'studentName' },
        { label: 'Enrollment No', key: 'studentEnrollment' },
        { label: 'Book Title', key: 'bookTitle' },
        { label: 'ISBN', key: 'bookIsbn' },
        { label: 'Issue Date', key: 'issueDate' },
        { label: 'Due Date', key: 'dueDate' },
        { label: 'Status', key: 'status' },
      ];
      exportToCSV(activeLoans, 'Active_Borrowed_Books_Report', headers);
    } else if (activeTab === 'STUDENTS') {
      const headers = [
        { label: 'Student ID', key: 'id' },
        { label: 'Enrollment No', key: 'enrollmentNo' },
        { label: 'Full Name', key: 'name' },
        { label: 'Department', key: 'department' },
        { label: 'Semester', key: 'semester' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
      ];
      exportToCSV(studentsData, 'Registered_Students_Report', headers);
    } else if (activeTab === 'ALL_TX') {
      const headers = [
        { label: 'Tx ID', key: 'id' },
        { label: 'Student Name', key: 'studentName' },
        { label: 'Enrollment No', key: 'studentEnrollment' },
        { label: 'Book Title', key: 'bookTitle' },
        { label: 'ISBN', key: 'bookIsbn' },
        { label: 'Issue Date', key: 'issueDate' },
        { label: 'Due Date', key: 'dueDate' },
        { label: 'Return Date', key: 'returnDate' },
        { label: 'Status', key: 'status' },
      ];
      exportToCSV(transactionsData, 'Complete_Circulation_Audit_Report', headers);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating library analytics & reports..." size="large" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAllReportsData} />;
  }

  const activeLoans = transactionsData.filter((t) => t.status === 'ISSUED');
  const returnedLoans = transactionsData.filter((t) => t.status === 'RETURNED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Library Reports & CSV Export
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate and download reports on book inventory, student loans, and circulation logs
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        {[
          { id: 'BOOKS', label: `Books Inventory (${booksData.length})`, icon: BookOpen },
          { id: 'ISSUED', label: `Active Borrowers (${activeLoans.length})`, icon: Clock },
          { id: 'STUDENTS', label: `Registered Students (${studentsData.length})`, icon: Users },
          { id: 'ALL_TX', label: `All Transactions (${transactionsData.length})`, icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Books Inventory Report */}
      {activeTab === 'BOOKS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">Title & Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4 text-center">Available Copies</th>
                  <th className="py-3.5 px-4 text-center">Total Copies</th>
                  <th className="py-3.5 px-4 text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booksData.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{b.title}</p>
                      <p className="text-slate-500">{b.author}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-[11px]">
                        {b.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.isbn}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{b.availableQuantity}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{b.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{b.shelfNo || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Active Loans Report */}
      {activeTab === 'ISSUED' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Borrowing Student</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4 font-mono">Issue Date</th>
                  <th className="py-3.5 px-4 font-mono">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-400">#{tx.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{tx.studentName}</p>
                      <p className="text-indigo-600 font-mono text-[11px]">{tx.studentEnrollment}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{tx.bookTitle}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{tx.issueDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{tx.dueDate}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        ISSUED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Students Directory Report */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">Enrollment No</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Semester</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4 text-right">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsData.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{st.enrollmentNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{st.name}</td>
                    <td className="py-3 px-4 text-slate-600">{st.department || 'N/A'}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">Sem {st.semester}</td>
                    <td className="py-3 px-4 text-slate-600">{st.email || '-'}</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono">{st.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: All Transactions Audit Report */}
      {activeTab === 'ALL_TX' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4 font-mono">Issue Date</th>
                  <th className="py-3.5 px-4 font-mono">Due Date</th>
                  <th className="py-3.5 px-4 font-mono">Return Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactionsData.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-400">#{tx.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{tx.studentName}</p>
                      <p className="text-indigo-600 font-mono text-[11px]">{tx.studentEnrollment}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{tx.bookTitle}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{tx.issueDate}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{tx.dueDate}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{tx.returnDate || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
