import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Search, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  ArrowRight, 
  RefreshCw, 
  StopCircle, 
  Loader2,
  Lock,
  Check
} from 'lucide-react';
import { verifyTicketByToken, checkInTicket } from '../services/ticketService';
import { getAdminSession } from '../services/adminService';
import { formatDate, formatTime } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function VerifyTicket() {
  const { token } = useParams();
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  const [inputToken, setInputToken] = useState(token || '');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const qrScannerRef = useRef(null);

  // If token is in URL params, verify automatically on load
  useEffect(() => {
    if (token) {
      performVerification(token);
    }
  }, [token]);

  const performVerification = async (tok) => {
    if (!tok || !tok.trim()) return;
    setLoading(true);
    setVerificationResult(null);
    try {
      const res = await verifyTicketByToken(tok.trim());
      setVerificationResult(res);
      if (res.is_valid) {
        toast.success(`Verified Ticket: ${res.ticket_id}`);
      } else {
        toast.error(res.error || 'Invalid ticket token');
      }
    } catch (err) {
      setVerificationResult({ is_valid: false, error: err.message || 'Verification failed' });
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!inputToken.trim()) {
      toast.error('Please enter a ticket ID or token');
      return;
    }
    stopCamera();
    performVerification(inputToken);
  };

  const handleCheckInAction = async () => {
    if (!verificationResult?.ticket_id) return;
    setIsCheckingIn(true);
    try {
      const organizer = adminSession?.email || 'Organizer Desk';
      const res = await checkInTicket(verificationResult.ticket_id, organizer);
      toast.success('Check-in confirmed! Candidate is Present.');
      // Refresh status
      performVerification(verificationResult.ticket_id);
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Camera QR Scanner Lifecycle
  const startCamera = async () => {
    try {
      if (qrScannerRef.current) {
        try { await qrScannerRef.current.stop(); } catch(e) {}
      }

      const html5QrCode = new Html5Qrcode('verify-qr-reader');
      qrScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCamera();
          // Extract token from verification URL or direct token
          let extracted = decodedText.trim();
          const match = extracted.match(/\/verify\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            extracted = match[1];
          }
          setInputToken(extracted);
          performVerification(extracted);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      toast.error('Could not access camera. Please allow camera permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (qrScannerRef.current && isScanning) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
      } catch (err) {}
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(() => {}).finally(() => {
          try { qrScannerRef.current.clear(); } catch(e) {}
        });
      }
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-600 mb-3 border border-blue-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          QR Ticket Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Scan the candidate's QR code or enter the verification token to validate admission status.
        </p>
      </div>

      {/* Main White Card */}
      <div className="card-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 text-slate-800">
        {/* Camera Viewfinder */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-blue-400/50 flex items-center justify-center">
          <div id="verify-qr-reader" className="w-full h-full" />

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/95 z-20">
              <Camera className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">Device Scanner Ready</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start Camera Scanner</span>
              </button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-blue-400/80 rounded-xl animate-pulse" />
            </div>
          )}
        </div>

        {isScanning && (
          <div className="text-center">
            <button
              onClick={stopCamera}
              className="px-4 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Scanner</span>
            </button>
          </div>
        )}

        {/* Manual Token Search */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Ticket ID or Verification Token Lookup
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="e.g. TMI-2026-8F3A7C21 or Token string"
                className="w-full px-4 py-2.5 rounded-xl input-light text-xs sm:text-sm pl-9 uppercase font-mono tracking-wider text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60 shrink-0 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify</span>}
            </button>
          </div>
        </form>

        {/* Verification Result Display */}
        {verificationResult && (
          <div className="pt-4 border-t border-slate-100">
            {verificationResult.is_valid ? (
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-300 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                      VALID ENTRY TICKET
                    </span>
                  </div>

                  {verificationResult.ticket_status === 'checked_in' ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                      CHECKED IN
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      CONFIRMED (AWAITING CHECK-IN)
                    </span>
                  )}
                </div>

                {/* Minimal Safe Information Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Ticket ID</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{verificationResult.ticket_id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Candidate (Privacy Masked)</span>
                    <span className="font-bold text-slate-900 text-sm">{verificationResult.masked_name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Drive</span>
                    <span className="font-semibold text-slate-700">{verificationResult.drive_name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Event Date</span>
                    <span className="font-semibold text-slate-700">
                      {formatDate(verificationResult.event_date)} at {formatTime(verificationResult.event_date)}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Venue Desk</span>
                    <span className="font-semibold text-slate-700">{verificationResult.event_location}</span>
                  </div>
                </div>

                {/* Security Guarantee Notice */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Security Guarantee: Student phone number, email, and resume are strictly protected and never exposed through public verification.</span>
                </div>

                {/* Check In Action Button */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  {verificationResult.ticket_status !== 'checked_in' ? (
                    <button
                      onClick={handleCheckInAction}
                      disabled={isCheckingIn}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                      {isCheckingIn ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Authorize Entry / Mark Checked In</span>
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Attendance recorded on {formatDate(verificationResult.checked_in_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-rose-800">Invalid or Expired Ticket</h4>
                <p className="text-xs text-rose-600">{verificationResult.error || 'This QR token is not recognized.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
