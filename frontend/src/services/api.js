import axios from 'axios';

// Centralized API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/library-management/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending JSESSIONID cookies for session auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for standardized error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 401) {
        errorMessage = 'Session expired or unauthorized. Please log in.';
      } else if (error.response.status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (error.response.status === 409) {
        errorMessage = 'Conflict detected: duplicate entry or dependency conflict.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please verify backend & database status.';
      }
    } else if (error.request) {
      errorMessage = 'Cannot reach backend server. Please verify Tomcat is running on port 8080.';
    }
    return Promise.reject(new Error(errorMessage));
  }
);

// 1. Authentication Services
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getSession: () => apiClient.get('/auth/session'),
};

// 2. Dashboard Metrics Service
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard'),
};

// 3. Books Services
export const booksAPI = {
  getAll: () => apiClient.get('/books'),
  getById: (id) => apiClient.get(`/books?id=${id}`),
  search: (query) => apiClient.get(`/books?search=${encodeURIComponent(query)}`),
  create: (bookData) => apiClient.post('/books', bookData),
  update: (bookData) => apiClient.put('/books', bookData),
  delete: (id) => apiClient.delete(`/books?id=${id}`),
};

// 4. Students Services
export const studentsAPI = {
  getAll: () => apiClient.get('/students'),
  getById: (id) => apiClient.get(`/students?id=${id}`),
  search: (query) => apiClient.get(`/students?search=${encodeURIComponent(query)}`),
  create: (studentData) => apiClient.post('/students', studentData),
  update: (studentData) => apiClient.put('/students', studentData),
  delete: (id) => apiClient.delete(`/students?id=${id}`),
};

// 5. Categories Services
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories?id=${id}`),
  create: (categoryData) => apiClient.post('/categories', categoryData),
  update: (categoryData) => apiClient.put('/categories', categoryData),
  delete: (id) => apiClient.delete(`/categories?id=${id}`),
};

// 6. Issued Books / Transactions Services
export const issuedBooksAPI = {
  getAll: (status) => {
    const url = status && status !== 'ALL' ? `/issued-books?status=${status}` : '/issued-books';
    return apiClient.get(url);
  },
  getById: (id) => apiClient.get(`/issued-books?id=${id}`),
  getStudentHistory: (studentId) => apiClient.get(`/issued-books?studentId=${studentId}`),
  issueBook: (data) => apiClient.post('/issued-books/issue', data),
  returnBook: (data) => apiClient.post('/issued-books/return', data),
};

export default apiClient;
