import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  ShieldCheck,
  Lock
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-[#060b13] text-slate-400 text-xs mt-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Techmiya Edtech Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/techmiyaedtech_new_logo.png"
                alt="Techmiya EdTech Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-extrabold text-amber-500 text-xl tracking-tight">
                Techmiya Edtech
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Transforming learning with cutting-edge technology education. Empowering students to build successful careers in tech.
            </p>

            {/* Social Links (Matching trainers.techmiyaedtech.com clean text style) */}
            <div className="flex items-center gap-4 pt-3 text-xs text-slate-400 font-medium">
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Youtube
              </a>
              <a
                href="https://linkedin.com/company/techmiya-edtech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com/techmiya_edtech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-xs">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="https://techmiyaedtech.com/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="https://techmiyaedtech.com/courses" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                  Courses
                </a>
              </li>
              <li>
                <a href="https://techmiyaedtech.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="https://trainers.techmiyaedtech.com/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                  Trainers Portal
                </a>
              </li>
              <li>
                <Link to="/drives" className="hover:text-amber-400 transition-colors">
                  Placement Drives
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us (Exact address from trainers.techmiyaedtech.com) */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-xs">
              Contact Us
            </h4>
            <ul className="space-y-3.5 text-xs leading-relaxed">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-950/70 border border-blue-800/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:hr@techmiyaedtech.com" className="hover:text-amber-400 transition-colors pt-1">
                  hr@techmiyaedtech.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-950/70 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 text-slate-300 pt-1">
                  <a href="tel:+916363760275" className="block hover:text-amber-400">+91 6363760275</a>
                  <a href="tel:+916361987951" className="block hover:text-amber-400">+91 6361987951</a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-950/70 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-300 text-[11px] pt-1">
                  Techmiya Ed-Tech, 28th Main Rd, S &amp; C Cross A Road, Jayanagar 9th Block, Bengaluru, Karnataka 560069
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Centered Copyright Bar */}
        <div className="pt-8 border-t border-slate-900/90 text-center text-[11px] text-slate-500">
          <p>
            &copy; 2026 Techmiya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
