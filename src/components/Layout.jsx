import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  QrCode, 
  Users, 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import { getScriptUrl } from '../api/api';

export default function Layout({ children }) {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const liveUrl = getScriptUrl();

  const navLinks = [
    { to: '/', label: 'Register', icon: Briefcase },
    { to: '/scan', label: 'Scan Pass', icon: QrCode },
    { to: '/admin', label: 'Candidate Roster', icon: Users },
  ];

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient Glowing Orbs */}
      <div className="orb-indigo -top-40 -left-40 fixed opacity-70" />
      <div className="orb-purple -bottom-40 -right-40 fixed opacity-70" />
      <div className="orb-cyan top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed opacity-30" />

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/75 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <Briefcase className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  TECHMIYA
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 tracking-wider">
                  DRIVE '26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Campus Placement &amp; QR Admit Pass Portal
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Backend Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Backend & Google Sheets Settings"
              className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-colors ml-1"
            >
              <Settings className="w-4 h-4" />
              <span
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  liveUrl ? 'bg-emerald-400 ring-2 ring-emerald-950' : 'bg-purple-400 ring-2 ring-purple-950'
                }`}
              />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-md mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base">TECHMIYA CAMPUS JOB DRIVE 2026</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Connecting top tier engineering, technology, and management talent with India's fastest growing tech startups and MNCs. Verify passes in seconds with instant digital QR scanning.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> October 24-25, 2026</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Main Campus Auditorium &amp; Tech Labs</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Drive Portals</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-indigo-400 transition-colors">Student Registration</Link></li>
                <li><Link to="/scan" className="hover:text-indigo-400 transition-colors">Entry Desk QR Scanner</Link></li>
                <li><Link to="/admin" className="hover:text-indigo-400 transition-colors">Admin Candidate Roster</Link></li>
                <li><button onClick={() => setIsSettingsOpen(true)} className="hover:text-indigo-400 transition-colors">Database Config</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Helpdesk &amp; Verification</h4>
              <ul className="space-y-2">
                <li>Email: <a href="mailto:placements@techmiya.edu.in" className="text-indigo-400 hover:underline">placements@techmiya.edu.in</a></li>
                <li>Helpline: <span className="text-slate-300 font-mono">+91 98765 43210</span></li>
                <li>Hours: 08:30 AM – 06:30 PM IST</li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Live Check-in Desk Active
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Techmiya EdTech. All rights reserved. Official Placement Registration Portal.</p>
            <p className="flex items-center gap-1.5">
              <span>Powered by React 19 &amp; Google Apps Script</span>
              <span>•</span>
              <span className="text-slate-400">Strictly Non-Transferable</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Backend Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
