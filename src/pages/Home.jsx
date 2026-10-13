import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Layers, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  FileCheck,
  Lock,
  ExternalLink
} from 'lucide-react';
import { getActiveDrives } from '../services/driveService';
import { formatDate, formatTime } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupId, setLookupId] = useState('');

  useEffect(() => {
    getActiveDrives()
      .then((data) => setDrives(data || []))
      .catch(() => setDrives([]))
      .finally(() => setLoading(false));
  }, []);

  const handleTicketLookup = (e) => {
    e.preventDefault();
    if (!lookupId.trim()) {
      toast.error('Please enter your Ticket ID');
      return;
    }
    const cleanId = lookupId.trim().toUpperCase();
    navigate(`/ticket/${cleanId}`);
  };

  const stats = [
    { label: 'Hiring Partners', value: '50+', icon: Briefcase, color: 'text-blue-400' },
    { label: 'Open Opportunities', value: '1,200+', icon: Users, color: 'text-indigo-400' },
    { label: 'Highest Package', value: '18.5 LPA', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Entry Verification', value: '100% QR', icon: ShieldCheck, color: 'text-cyan-400' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Select Active Drive',
      desc: 'Browse available placement drives and choose your eligible domain or company profile.',
    },
    {
      num: '02',
      title: 'Submit Academic Profile',
      desc: 'Provide your education details, passing year, and upload your latest resume in PDF format.',
    },
    {
      num: '03',
      title: 'Instant QR Hall Ticket',
      desc: 'Receive your unique Ticket ID (TMI-2026-XXXX) and digital QR pass with email confirmation.',
    },
    {
      num: '04',
      title: 'Desk Verification & Interview',
      desc: 'Present your QR code at the event entrance for verified attendance check-in.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-14 sm:mb-18">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Official Placement &amp; Career Gateway</span>
        </div>

        {/* Heading & Subheading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Register for Techmiya Drives
        </h1>

        <p className="mt-5 text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          “Register for placement drives, internships, hiring events, and career opportunities through Techmiya EdTech.”
        </p>

        {/* Quick Actions Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
          >
            <span>Register for Current Drive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/drives"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-sm transition-colors"
          >
            Explore All Drives
          </Link>
        </div>

        {/* Quick Ticket Lookup */}
        <div className="mt-8 max-w-md mx-auto">
          <form onSubmit={handleTicketLookup} className="relative flex items-center">
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Already registered? Enter Ticket ID (e.g. TMI-2026-8F3A7C21)"
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl input-light bg-white border border-slate-300 pl-10 pr-26 uppercase font-mono tracking-wider text-slate-800 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              View Ticket
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-16">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="card-white card-white-hover rounded-2xl p-4 sm:p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-2.5">
                <Icon className={`w-5 h-5 text-blue-600`} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Drives Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Active Events
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Placement Drives
            </h2>
          </div>
          <Link
            to="/drives"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All ({drives.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading current active placement drives..." />
        ) : drives.length === 0 ? (
          <div className="p-8 text-center card-white rounded-2xl text-slate-500">
            No active drives open for registration right now. Please check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.slice(0, 3).map((drive) => {
              const remaining = drive.capacity - (drive.registration_count || 0);
              return (
                <div
                  key={drive.id}
                  className="card-white card-white-hover rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {drive.organizer || 'Techmiya'}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 font-bold">
                        {remaining} seats left
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                      {drive.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {drive.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{formatDate(drive.event_date)} at {formatTime(drive.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{drive.event_location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to={`/register?drive=${drive.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <span>Register for this Drive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it Works / 4-Step Pathway */}
      <div className="card-white rounded-3xl p-8 sm:p-12 mb-16 border border-slate-200/90 shadow-md">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Registration Instructions
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How The Techmiya Portal Works
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Seamless end-to-end process from online registration to venue QR verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 inline-block mb-3">
                {st.num}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{st.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice & Guidelines Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Privacy &amp; Data Protection Notice</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Your resume and contact information are encrypted and accessible strictly by authorized recruitment partners. QR tickets contain zero sensitive personal contact details.
            </p>
          </div>
        </div>

        <Link
          to="/register"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
        >
          Start Registration
        </Link>
      </div>
    </div>
  );
}
