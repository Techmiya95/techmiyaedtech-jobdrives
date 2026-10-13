import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Footer from './components/Footer';

import Register from './pages/Register';
import DriveList from './pages/DriveList';
import Ticket from './pages/Ticket';
import VerifyTicket from './pages/VerifyTicket';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#0f172a',
            },
          },
        }}
      />
      <div className="relative min-h-screen bg-gradient-to-b from-[#e8f1fa] via-[#eef4fb] to-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        {/* Subtle Ambient Vignettes */}
        <div className="orb-indigo -top-40 -left-40 fixed opacity-25 pointer-events-none" />
        <div className="orb-cyan -bottom-40 -right-40 fixed opacity-20 pointer-events-none" />

        <Header />

        <main className="flex-1 relative z-10">
          <Routes>
            {/* Directly opens the Registration Form */}
            <Route path="/" element={<Register />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/drives" element={<DriveList />} />
            <Route path="/ticket/:id" element={<Ticket />} />
            <Route path="/verify" element={<VerifyTicket />} />
            <Route path="/verify/:token" element={<VerifyTicket />} />

            {/* Redirect old admin and home paths */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/roster" element={<Navigate to="/" replace />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="/success/:id" element={<Navigate to="/ticket/:id" replace />} />
            <Route path="/scan" element={<Navigate to="/verify" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
}
