import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  ExternalLink, 
  ArrowLeft, 
  QrCode, 
  Loader2, 
  AlertCircle,
  Printer,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { verifyCandidate, markAttendance } from '../api/api';
import toast from 'react-hot-toast';

export default function Verify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    if (id) {
      loadCandidate(id);
    }
  }, [id]);

  const loadCandidate = async (candId) => {
    setLoading(true);
    setError('');
    try {
      const res = await verifyCandidate(candId);
      if (res.success && res.candidate) {
        setCandidate(res.candidate);
      } else {
        setError(`No registration record found for ID: ${candId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!candidate) return;
    setIsMarking(true);
    try {
      const res = await markAttendance(candidate.id);
      if (res.success && res.candidate) {
        setCandidate(res.candidate);
        toast.success(`Check-In confirmed for ${candidate.fullName}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance status');
    } finally {
      setIsMarking(false);
    }
  };

  const openResume = () => {
    if (!candidate?.resumeUrl) {
      toast.error('Resume URL not available');
      return;
    }
    // If it's a data URL or regular URL
    if (candidate.resumeUrl.startsWith('data:')) {
      const win = window.open();
      win.document.write(
        `<iframe src="${candidate.resumeUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    } else {
      window.open(candidate.resumeUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Verifying credentials for pass {id}...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="max-w-md mx-auto p-8 text-center my-12 glass-panel rounded-3xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Candidate not found.'}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/scan"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Scan Again
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  const isCheckedIn = candidate.attendance === 'Present';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigate('/scan')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Verification Slip</span>
          </button>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden print-area">
        {/* Status Badge Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                Placement Drive Candidate Profile
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {candidate.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
              {candidate.fullName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{candidate.college}</span>
            </p>
          </div>

          {/* Current Check-in Indicator */}
          <div className="shrink-0 text-left sm:text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Attendance Status
            </div>
            {isCheckedIn ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>CHECKED IN (PRESENT)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold animate-pulse">
                <Clock className="w-4 h-4" />
                <span>AWAITING DESK CHECK-IN</span>
              </div>
            )}
            {candidate.checkInTime && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Checked in at: {candidate.checkInTime}
              </p>
            )}
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree &amp; Department</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              {candidate.degreeBranch}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Passing Year &amp; Score</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              Class of {candidate.passingYear} • <span className="text-indigo-400 font-bold">{candidate.cgpa}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
            <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block">
              {candidate.phone}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              {candidate.email}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered On</span>
            <span className="text-xs font-mono text-slate-300 mt-1 block">
              {candidate.registeredAt || 'Drive Day'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 sm:col-span-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Domain / Skills</span>
            <span className="text-xs font-medium text-slate-200 mt-1 block">
              {candidate.primarySkill}
            </span>
            {candidate.secondarySkills && (
              <p className="text-[11px] text-slate-400 mt-1">
                Technologies: {candidate.secondarySkills}
              </p>
            )}
          </div>
        </div>

        {/* Resume Preview & Links Section */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Student Resume Document</p>
              <p className="text-[11px] text-slate-400">
                {candidate.resumeFileName || 'Candidate_Resume.pdf'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openResume}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full Resume</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button: Check In / Mark Present */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="text-xs text-slate-400">
            {isCheckedIn ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> Candidate entry authorized. Proceed to Interview Hall.
              </span>
            ) : (
              <span>Confirm college ID matches before clicking Check-In.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isCheckedIn ? (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={isMarking}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isMarking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying &amp; Marking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Present / Check In</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Next Candidate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
