import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobPassCard({ candidate, id = 'admit-card-element' }) {
  const [copied, setCopied] = useState(false);

  if (!candidate) return null;

  // Build verification URL for the QR code
  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/$/, '');
  const verifyUrl = `${origin}${pathname}/#/verify/${candidate.id}`;

  const copyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(candidate.id);
    setCopied(true);
    toast.success(`Copied Registration ID: ${candidate.id}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id={id}
      className="w-full max-w-[460px] mx-auto rounded-3xl overflow-hidden glass-card-ticket text-slate-100 transition-all select-none relative"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px -5px rgba(99, 102, 241, 0.25)',
      }}
    >
      {/* Top Banner with Gradient & Wave */}
      <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-28 h-28 bg-purple-400/20 rounded-full blur-xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
                Official Hall Ticket
              </span>
              {candidate.attendance === 'Present' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1.5 drop-shadow-sm">
              CAMPUS JOB DRIVE 2026
            </h2>
            <p className="text-xs font-medium text-indigo-100 flex items-center gap-1.5 mt-0.5">
              <span>TECHMIYA EDTECH</span>
              <span>•</span>
              <span>ANNUAL PLACEMENT SUMMIT</span>
            </p>
          </div>

          <div className="p-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shrink-0">
            <img
              src="/images/techmiyaedtech_new_logo.png"
              alt="Techmiya"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Primary Candidate Badge Section */}
      <div className="p-6 pb-5 bg-slate-900/70 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Candidate Name</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mt-0.5">
              {candidate.fullName}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{candidate.college}</span>
            </p>
          </div>

          {/* Registration ID Pill with Copy button */}
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pass Code</p>
            <button
              type="button"
              onClick={copyId}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/25 transition-all group font-mono text-xs font-bold"
              title="Click to copy registration ID"
            >
              <span>{candidate.id}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        {/* Academic & Skill Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Degree &amp; Branch</span>
            <span className="text-xs font-bold text-slate-200 line-clamp-1 mt-0.5" title={candidate.degreeBranch}>
              {candidate.degreeBranch}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Batch / CGPA</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 block">
              Class of {candidate.passingYear} • <span className="text-indigo-400">{candidate.cgpa}</span>
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40 col-span-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Primary Domain / Skills</span>
            <span className="text-xs font-medium text-slate-200 mt-0.5 block line-clamp-1">
              {candidate.primarySkill}
            </span>
          </div>
        </div>
      </div>

      {/* Perforated Notches Divider */}
      <div className="relative py-2 bg-slate-900/70">
        {/* Left cutout circle */}
        <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0f172a] border border-white/10 shadow-inner z-20" />
        {/* Right cutout circle */}
        <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0f172a] border border-white/10 shadow-inner z-20" />
        
        {/* Dashed line */}
        <div className="mx-6 border-b-2 border-dashed border-slate-700/80" />
      </div>

      {/* Lower Ticket Section: QR Code & Verification Data */}
      <div className="p-6 pt-3 bg-slate-900/70">
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-indigo-500/20 flex items-center justify-center">
              <QRCodeSVG
                value={verifyUrl}
                size={118}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234338ca'><rect width='24' height='24' rx='6' fill='%234338ca'/><path d='M8 12h8m-8-3h8m-8 6h5' stroke='white' stroke-width='2' stroke-linecap='round'/></svg>",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            <span className="mt-2 text-[10px] font-bold tracking-wider uppercase text-indigo-300 font-mono">
              SCAN AT ENTRY DESK
            </span>
          </div>

          {/* Drive Day Schedule Details */}
          <div className="flex-1 space-y-2.5 w-full text-left">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Reporting Slot</span>
                <span className="font-semibold text-white">09:00 AM Sharp (Batch A)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Venue Desk</span>
                <span className="font-semibold text-white">Auditorium Desk #4 &amp; Lab Complex</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Resume Attached</span>
                <span className="font-semibold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {candidate.resumeFileName ? candidate.resumeFileName.substring(0, 20) : 'Uploaded & Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact info footer bar */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[200px]" title={candidate.email}>{candidate.email}</span>
          <span className="font-mono text-slate-300">{candidate.phone}</span>
        </div>
      </div>

      {/* Ticket Base Security Notice */}
      <div className="px-6 py-2.5 bg-slate-950 text-center border-t border-white/5">
        <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
          NON-TRANSFERABLE • PRESENT WITH COLLEGE ID &amp; 2 HARDCOPY RESUMES
        </p>
      </div>
    </div>
  );
}
