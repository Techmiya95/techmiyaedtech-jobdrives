import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Upload, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  StopCircle,
  HelpCircle
} from 'lucide-react';
import { normalizeRegistrationID } from '../utils/generateID';
import toast from 'react-hot-toast';

export default function Scan() {
  const navigate = useNavigate();
  const [manualId, setManualId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [activeCamera, setActiveCamera] = useState('environment'); // back camera preferred
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper to extract candidate ID from scanned text
  const parseCandidateId = (decodedText) => {
    if (!decodedText) return null;
    const text = decodedText.trim();
    
    // Check if it's a URL ending in /verify/:id or #/verify/:id
    const matchUrl = text.match(/\/verify\/([a-zA-Z0-9_-]+)/);
    if (matchUrl && matchUrl[1]) {
      return normalizeRegistrationID(matchUrl[1]);
    }

    // Check if it's a direct ID like JD26-XXXXXX
    if (text.toUpperCase().includes('JD26-') || text.toUpperCase().startsWith('JD')) {
      return normalizeRegistrationID(text);
    }

    return normalizeRegistrationID(text);
  };

  const onScanSuccess = (decodedText) => {
    const id = parseCandidateId(decodedText);
    if (id) {
      toast.success(`Scanned Pass: ${id}`);
      stopCamera();
      navigate(`/verify/${id}`);
    } else {
      toast.error('Scanned QR code does not contain a valid Drive Pass ID');
    }
  };

  const startCamera = async () => {
    setScanError('');
    try {
      if (qrScannerRef.current) {
        try {
          await qrScannerRef.current.stop();
        } catch (e) {}
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      qrScannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: activeCamera },
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Continuous frame parsing error (normal for QR stream until QR is focused)
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Camera start failed:', err);
      setScanError(
        'Unable to access camera. Please allow camera permissions in your browser or use Manual Entry below.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (qrScannerRef.current && isScanning) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
    setIsScanning(false);
  };

  // Switch between front & back camera
  const toggleCameraFacing = async () => {
    await stopCamera();
    setActiveCamera((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 300);
  };

  // Handle uploading a QR screenshot/image file
  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-qr-reader-hidden');
      const decodedResult = await html5QrCode.scanFile(file, true);
      const id = parseCandidateId(decodedResult);
      if (id) {
        toast.success(`Scanned Pass from file: ${id}`);
        navigate(`/verify/${id}`);
      } else {
        toast.error('No valid registration pass ID found in image');
      }
    } catch (err) {
      toast.error('Could not detect QR code in selected image. Please try another photo.');
    }
  };

  // Manual ID submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error('Please enter a Registration ID');
      return;
    }
    const clean = normalizeRegistrationID(manualId);
    stopCamera();
    navigate(`/verify/${clean}`);
  };

  // Clean up camera on unmount
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mb-3">
          <Camera className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Entry Desk QR Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Scan the candidate's digital or printed hall ticket QR code to verify credentials and mark verified attendance.
        </p>
      </div>

      {/* Main Scanner Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Hidden element for file scanning */}
        <div id="file-qr-reader-hidden" className="hidden" />

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full" />

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 z-20">
              <Camera className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-sm font-semibold text-slate-200">Camera is Inactive</p>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Click below to launch scanner and position the candidate's pass QR inside the box.
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Scanner</span>
              </button>
            </div>
          )}

          {/* Scanner Overlay Sight Crosshair */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-indigo-400/80 rounded-2xl shadow-2xl relative animate-pulse">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
              </div>
            </div>
          )}
        </div>

        {/* Camera Control Actions */}
        {isScanning && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip Camera</span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Scanner</span>
            </button>
          </div>
        )}

        {/* Error message */}
        {scanError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Option 2: Upload QR Photo */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileScan}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scan from Saved Image / Photo</span>
          </button>
        </div>

        {/* Option 3: Manual ID Entry */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Manual Registration ID Entry
          </label>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. JD26-A8K9M2"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm pl-9 uppercase font-mono tracking-wider"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Verify</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-slate-500 mt-2">
            Sample test IDs: <code className="text-indigo-300">JD26-A8K9M2</code>, <code className="text-indigo-300">JD26-B3N7P1</code>, <code className="text-indigo-300">JD26-C4T8X9</code>
          </p>
        </div>
      </div>
    </div>
  );
}
