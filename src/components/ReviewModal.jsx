import React from 'react';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  formData,
  drive,
  onConfirmSubmit,
  isSubmitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Review Your Registration</h3>
              <p className="text-xs text-slate-500">Please review all details before generating your QR ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable details */}
        <div className="py-5 space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
          {/* Drive Selected */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
              Selected Placement Drive
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{drive?.name}</h4>
            <div className="mt-1 flex flex-wrap gap-3 text-slate-600 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {drive?.event_date ? new Date(drive.event_date).toLocaleDateString() : 'TBA'}
              </span>
              <span>•</span>
              <span>{drive?.event_location}</span>
            </div>
          </div>

          {/* Candidate Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Candidate Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{formData.full_name}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Contact Mobile</span>
              <span className="font-mono font-semibold text-slate-900 text-sm mt-0.5 block">{formData.phone}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Email Address (Destination for ticket)</span>
              <span className="font-semibold text-blue-700 mt-0.5 block">{formData.email}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Degree &amp; Branch</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {formData.degree === 'Other' ? formData.degree_other : formData.degree}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Year of Passing</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">Class of {formData.passing_year}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Techmiya Student</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {formData.is_techmiya_student ? `Yes (${formData.techmiya_student_id || 'Enrolled'})` : 'No'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Employment Status</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {formData.is_working ? `Working (${formData.current_company || 'Employed'})` : 'Fresher / Seeking'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-900 block">{formData.resume?.fileName || 'Resume.pdf'}</span>
                  <span className="text-[11px] text-emerald-600">PDF Document Attached &amp; Validated</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <span className="text-slate-800 font-semibold block mb-0.5">Confirmation Policy:</span>
            A unique ticket ID and QR code will be generated immediately. A confirmation email will be sent to <strong>{formData.email}</strong>.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Edit Details
          </button>

          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Registration...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Generate QR Ticket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
