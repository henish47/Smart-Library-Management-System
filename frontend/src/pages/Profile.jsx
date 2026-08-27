import React from 'react';
import { User, ShieldCheck, Mail, Server, Database, Code, Library, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-indigo-600" />
          Administrator Profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Active system administrator account and runtime environment details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-2xl font-extrabold shadow-xl shadow-indigo-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Administrator'}</h2>
            <p className="text-xs font-mono text-indigo-600 font-semibold">@{user?.username || 'admin'}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Full System Administrator</span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-mono font-bold text-slate-800">#{user?.id || 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-medium text-slate-800 truncate max-w-[160px]">
                {user?.email || 'admin@smartlibrary.edu'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session:</span>
              <span className="font-semibold text-emerald-600">Active (HttpSession)</span>
            </div>
          </div>
        </div>

        {/* Project & Tech Architecture Specs (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-600" />
            System Architecture & Tech Specs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Server className="w-4 h-4" />
                <span>Backend Runtime</span>
              </div>
              <p className="text-slate-600">Java 17 LTS + Java Servlets (javax.servlet 4.0)</p>
              <p className="text-[11px] text-slate-400">Apache Tomcat 9 / Dynamic Web App</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Database className="w-4 h-4" />
                <span>Database Engine</span>
              </div>
              <p className="text-slate-600">MySQL 8.0+ (`library_management`)</p>
              <p className="text-[11px] text-slate-400">JDBC PreparedStatement + Transactions</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Library className="w-4 h-4" />
                <span>Frontend Client</span>
              </div>
              <p className="text-slate-600">React 18 + Vite + Tailwind CSS</p>
              <p className="text-[11px] text-slate-400">Axios REST Client (with credentials)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AJT Mini Project</span>
              </div>
              <p className="text-slate-600">College Semester 3 Project</p>
              <p className="text-[11px] text-slate-400">Standard Layered MVC/DAO Architecture</p>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
            <p className="font-bold mb-1">📋 Project Design Principles:</p>
            <ul className="list-disc list-inside text-indigo-700 text-[11px] space-y-1">
              <li>Strictly free local technologies without paid APIs or cloud dependencies.</li>
              <li>Pure JDBC with atomic rollback/commit transactions for book borrowing.</li>
              <li>Clean separation of concerns: Model POJOs $\rightarrow$ JDBC DAOs $\rightarrow$ REST Servlets $\rightarrow$ React SPA.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
