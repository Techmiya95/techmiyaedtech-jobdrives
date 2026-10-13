import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertCircle, X, ExternalLink, Database, Link as LinkIcon } from 'lucide-react';
import { getScriptUrl, setScriptUrl } from '../api/api';
import toast from 'react-hot-toast';

export default function SettingsModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getScriptUrl());
      setStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setScriptUrl(url);
    toast.success(url.trim() ? 'Google Apps Script URL saved!' : 'Switched to Local Demo Mode');
    onClose();
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setStatus({ ok: false, msg: 'Please enter a URL first' });
      return;
    }
    setTesting(true);
    setStatus(null);
    try {
      const pingUrl = `${url.trim()}?action=verify&id=PING_TEST`;
      const res = await fetch(pingUrl);
      const data = await res.json();
      if (data && ('success' in data)) {
        setStatus({ ok: true, msg: 'Connected successfully to Google Apps Script!' });
        toast.success('Connection verified!');
      } else {
        setStatus({ ok: false, msg: 'Received unexpected response from script.' });
      }
    } catch (err) {
      setStatus({ ok: false, msg: 'Could not connect. Ensure Web App is deployed with "Anyone" access.' });
    } finally {
      setTesting(false);
    }
  };

  const handleUseDemo = () => {
    setUrl('');
    setScriptUrl('');
    toast.success('Now running in Local Demo Mode');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Backend Connection Settings</h3>
              <p className="text-xs text-slate-400">Configure Google Apps Script or run in offline mock mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Google Apps Script Web App URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input pl-10"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Leave blank to automatically run in offline/local mock mode with zero configuration.
            </p>
          </div>

          {status && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              status.ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {status.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{status.msg}</span>
            </div>
          )}

          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <span>Quick Deployment Checklist</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Deploy <code className="text-slate-200">Code.gs</code> as a Web App from Extensions &gt; Apps Script</li>
              <li>Set "Execute as": <strong>Me</strong></li>
              <li>Set "Who has access": <strong>Anyone</strong> (CRITICAL)</li>
              <li>New registrations and resumes will flow into your Google Sheet and Google Drive!</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleUseDemo}
            className="w-full sm:w-auto px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Reset to Demo Mode
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {url.trim() && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Ping'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/25"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
