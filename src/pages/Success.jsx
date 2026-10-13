import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  ArrowLeft, 
  FileImage, 
  FileText, 
  Share2, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Info
} from 'lucide-react';
import JobPassCard from '../components/JobPassCard';
import { exportElementAsPdf, exportElementAsPng } from '../utils/pdfExport';
import { verifyCandidate, getLocalCandidate } from '../api/api';
import toast from 'react-hot-toast';

export default function Success() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [candidate, setCandidate] = useState(location.state?.candidate || null);
  const [loading, setLoading] = useState(!candidate);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  // Trigger celebration confetti on initial load
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'],
      });
    } catch (e) {
      // Ignored if confetti unavailable
    }
  }, []);

  // Fetch candidate details if navigated directly via URL
  useEffect(() => {
    if (!candidate && id) {
      const local = getLocalCandidate(id);
      if (local) {
        setCandidate(local);
        setLoading(false);
        return;
      }

      verifyCandidate(id)
        .then((res) => {
          if (res.success && res.candidate) {
            setCandidate(res.candidate);
          } else {
            toast.error('Could not find registration pass');
          }
        })
        .catch((err) => {
          toast.error(err.message || 'Pass not found');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, candidate]);

  const handleDownloadPdf = async () => {
    const el = document.getElementById('admit-card-element');
    if (!el) return;
    setDownloadingPdf(true);
    try {
      await exportElementAsPdf(el, `Job-Drive-Admit-Card-${candidate?.id || 'Pass'}.pdf`);
      toast.success('Admit Card PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try image download or print.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById('admit-card-element');
    if (!el) return;
    setDownloadingPng(true);
    try {
      await exportElementAsPng(el, `Job-Drive-Admit-Card-${candidate?.id || 'Pass'}.png`);
      toast.success('Admit Card Image saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save image.');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Techmiya Campus Job Drive Admit Card',
        text: `Here is my verified Hall Ticket for Techmiya Campus Job Drive 2026 (ID: ${candidate?.id})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Pass link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Retrieving your Admit Card details...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-md mx-auto p-8 text-center my-12 glass-panel rounded-3xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Registration Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          We could not locate any candidate record corresponding to ID "{id}".
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Registration</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Registration Confirmed!
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
          Your digital QR Hall Ticket has been generated. Please download or print this card and present it at the entry desk on drive day.
        </p>
      </div>

      {/* Main Grid: Admit Card & Action Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Pass Card Display Area */}
        <div className="md:col-span-7 flex flex-col items-center print-area">
          <JobPassCard candidate={candidate} id="admit-card-element" />
        </div>

        {/* Action Panel Sidebar */}
        <div className="md:col-span-5 space-y-4 no-print">
          {/* Download Buttons Card */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download &amp; Save Pass
            </h3>

            {/* PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Download Official PDF Pass</span>
            </button>

            {/* PNG Image Button */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {downloadingPng ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileImage className="w-4 h-4 text-purple-400" />
              )}
              <span>Download as Image (PNG)</span>
            </button>

            {/* Print Button */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Pass</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Share Link</span>
              </button>
            </div>
          </div>

          {/* Drive Day Instructions */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" /> Important Instructions
            </h4>
            <div className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
              <p>
                • Keep your <strong>Registration ID ({candidate.id})</strong> handy or bookmark this page.
              </p>
              <p>
                • Report to <strong>Auditorium Entry Desk #4</strong> at <strong>09:00 AM Sharp</strong> on October 24, 2026.
              </p>
              <p>
                • Bring <strong>2 printed copies of your resume</strong> and your original college photo identity card.
              </p>
            </div>
          </div>

          {/* Back to Home Button */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Register Another Student / Back Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
