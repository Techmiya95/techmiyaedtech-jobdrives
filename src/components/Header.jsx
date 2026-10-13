import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ExternalLink,
  BookOpen,
  Globe
} from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/register', label: 'Register Now' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/90 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/techmiyaedtech_new_logo.png"
            alt="Techmiya EdTech Logo"
            className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-amber-500">
              Techmiya Ed-Tech
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-2">
          <a
            href="https://techmiyaedtech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
          >
            Home
          </a>
          <a
            href="https://techmiyaedtech.com/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
          >
            Courses
          </a>
          <a
            href="https://techmiyaedtech.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
          >
            Contact
          </a>
          <a
            href="https://trainers.techmiyaedtech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
          >
            Trainers
          </a>

          <Link
            to="/"
            className={`ml-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              location.pathname === '/' || location.pathname === '/register'
                ? 'bg-amber-100/90 text-amber-800 border-amber-300/80 shadow-sm'
                : 'bg-amber-50/70 text-amber-700 hover:bg-amber-100 border-amber-200'
            }`}
          >
            Register Now
          </Link>
        </nav>

        {/* Right CTA Action Buttons (Exact style of trainers.techmiyaedtech.com) */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://lms.techmiyaedtech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>Access LMS</span>
          </a>

          <a
            href="https://techmiyaedtech.com/enquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>Enquire Now</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <a
            href="https://techmiyaedtech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </a>
          <a
            href="https://techmiyaedtech.com/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Courses
          </a>
          <a
            href="https://techmiyaedtech.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Contact
          </a>
          <a
            href="https://trainers.techmiyaedtech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Trainers
          </a>

          <div className="border-t border-slate-200 my-2 pt-2 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-800"
            >
              Register Now
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <a
              href="https://lms.techmiyaedtech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-semibold"
            >
              Access LMS
            </a>
            <a
              href="https://techmiyaedtech.com/enquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-xs font-semibold"
            >
              Enquire Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
