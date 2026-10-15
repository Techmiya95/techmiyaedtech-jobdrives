import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  FileImage,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { getTicketById } from '../services/ticketService';
import { exportElementAsPdf, exportElementAsPng } from '../utils/pdfExport';
import { formatDate, formatTime } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Ticket() {
  const { id } = useParams();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  useEffect(() => {
    if (id) {
      getTicketById(id)
        .then((data) => {
          setTicket(data);
          // If arrived right after registration, trigger confetti celebration
          if (location.state?.isNew) {
            try {
              confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#6366f1', '#10b981', '#a855f7'],
              });
            } catch (e) {}
          }
        })
        .catch((err) => {
          toast.error(err.message || 'Ticket not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id, location.state]);

  const copyTicketId = () => {
    if (!ticket?.ticket_id) return;
    navigator.clipboard.writeText(ticket.ticket_id);
    setCopied(true);
    toast.success(`Copied Ticket ID: ${ticket.ticket_id}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('techmiya-ticket-card');
    if (!el) return;
    setDownloadingPdf(true);
    try {
      await exportElementAsPdf(el, `Techmiya-Ticket-${ticket?.ticket_id}.pdf`);
      toast.success('Admit Ticket PDF saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById('techmiya-ticket-card');
    if (!el) return;
    setDownloadingPng(true);
    try {
      await exportElementAsPng(el, `Techmiya-Ticket-${ticket?.ticket_id}.png`);
      toast.success('Ticket PNG image saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PNG');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Techmiya EdTech Drive Ticket',
        text: `Here is my verified registration ticket for ${ticket?.drive_name} (ID: ${ticket?.ticket_id})`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Ticket link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your digital QR ticket..." />;
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto p-8 text-center my-14 card-white rounded-3xl border border-slate-200/80 shadow-md">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ticket Not Found</h2>
        <p className="text-xs text-slate-600 mb-6">
          Could not locate registration ticket with ID "{id}". Please verify the ticket code or contact support.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  // Verification URL encoded in QR code (Points strictly to verification endpoint)
  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/$/, '');
  const verifyUrl = `${origin}${pathname}/#/verify/${ticket.token || ticket.ticket_id}`;

  const isCheckedIn = ticket.ticket_status === 'checked_in';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Top Banner */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Verified Hall Ticket</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Registration Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          Save or print this pass. Present your QR code at the event entrance for fast attendance verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Pass Ticket Card */}
        <div className="md:col-span-7 flex flex-col items-center print-area">
          <div
            id="techmiya-ticket-card"
            className="w-full max-w-[450px] rounded-3xl overflow-hidden glass-card-ticket text-slate-100 relative select-none"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px -5px rgba(59, 130, 246, 0.25)',
            }}
          >
            {/* Top Navy Blue Header Banner */}
            <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      Entry Pass
                    </span>
                    {isCheckedIn ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CHECKED IN
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400 text-slate-950">
                        CONFIRMED
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                    TECHMIYA EDTECH
                  </h2>
                  <p className="text-xs font-semibold text-blue-200 mt-0.5">
                    {ticket.drive_name}
                  </p>
                </div>

                <div className="p-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shrink-0">
                  <img
                    src="/images/techmiyaedtech_new_logo.png"
                    alt="Techmiya Logo"
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Candidate Info Section */}
            <div className="p-6 pb-5 bg-slate-900/80 border-b border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">Candidate Name</p>
                  <h3 className="text-xl font-bold text-white mt-0.5">{ticket.student_name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {ticket.degree} • Class of {ticket.passing_year}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Ticket ID</p>
                  <button
                    onClick={copyTicketId}
                    className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:text-white font-mono text-xs font-bold transition-colors"
                  >
                    <span>{ticket.ticket_id}</span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                </div>
              </div>

              {/* Event Schedule Info */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Event Date &amp; Time</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                    {formatDate(ticket.event_date)} • {formatTime(ticket.event_date)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Venue / Desk</span>
                  <span className="text-[11px] leading-snug font-bold text-slate-200 mt-0.5 block" title={ticket.event_location}>
                    {ticket.event_location}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforated Notches Divider */}
            <div className="relative py-2 bg-slate-900/80">
              <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0f172a] border border-white/10 z-20 shadow-inner" />
              <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0f172a] border border-white/10 z-20 shadow-inner" />
              <div className="mx-6 border-b-2 border-dashed border-slate-700/80" />
            </div>

            {/* QR Code & Security Notice */}
            <div className="p-6 pt-3 bg-slate-900/80">
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                {/* QR Code Container */}
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-blue-500/20">
                    <QRCodeSVG
                      value={verifyUrl}
                      size={118}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="mt-2 text-[10px] font-bold tracking-wider uppercase text-blue-300 font-mono">
                    SCAN AT ENTRY DESK
                  </span>
                </div>

                {/* Instructions */}
                <div className="flex-1 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Report 30 minutes prior to slot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Present with college photo identity card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Carry 2 physical copies of resume</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Base Security Notice */}
            <div className="px-6 py-2.5 bg-slate-950 text-center border-t border-white/5">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
                NON-TRANSFERABLE • TECHMIYA EDTECH VERIFIED TICKET
              </p>
            </div>
          </div>
        </div>

        {/* Action Panel Sidebar */}
        <div className="md:col-span-5 space-y-4 no-print">
          <div className="card-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download &amp; Save Ticket
            </h3>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <FileText className="w-4 h-4" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download Official PDF Pass'}</span>
            </button>

            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <FileImage className="w-4 h-4 text-indigo-600" />
              <span>{downloadingPng ? 'Generating Image...' : 'Download as Image (PNG)'}</span>
            </button>

            {/* Print & Share */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Print Pass</span>
              </button>

              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share Link</span>
              </button>
            </div>
          </div>

          {/* Drive Instructions Notice */}
          <div className="card-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Important Drive Day Guidelines
            </h4>
            <p>• Registration confirmation does not guarantee selection or employment.</p>
            <p>• Formal business attire is required for all technical and HR interview rounds.</p>
            <p>• Keep this Ticket ID bookmark or email handy for venue entrance.</p>
          </div>

          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors border border-dashed border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Register for Another Drive / Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
