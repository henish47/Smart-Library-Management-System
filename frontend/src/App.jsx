import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Students } from './pages/Students';
import { Categories } from './pages/Categories';
import { IssueBook } from './pages/IssueBook';
import { ReturnBook } from './pages/ReturnBook';
import { Transactions } from './pages/Transactions';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="students" element={<Students />} />
            <Route path="categories" element={<Categories />} />
            <Route path="issue-book" element={<IssueBook />} />
            <Route path="return-book" element={<ReturnBook />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
