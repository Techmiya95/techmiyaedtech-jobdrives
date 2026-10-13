import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  Layers,
  HelpCircle,
  Building,
  Info,
  Calendar,
  MapPin,
  Clock,
  Banknote,
  ListChecks,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { studentRegistrationSchema } from '../utils/validation';
import { getActiveDrives } from '../services/driveService';
import { uploadResumeFile, submitRegistration } from '../services/registrationService';
import { formatDate, formatTime } from '../utils/formatters';
import FormField from '../components/FormField';
import ReviewModal from '../components/ReviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DEGREE_OPTIONS = [
  'BE / BTech',
  'BCA',
  'MCA',
  'BSc',
  'MSc',
  'BCom',
  'MCom',
  'BA',
  'MA',
  'Diploma',
  'MBA',
  'Other',
];

const DISCOVERY_OPTIONS = [
  'Friend or Referral',
  'WhatsApp Group',
  'Instagram',
  'LinkedIn',
  'YouTube',
  'College',
  'Faculty or Trainer',
  'Techmiya Website',
  'Email',
  'Other',
];

const PASSING_YEARS = ['2023', '2024', '2025', '2026', '2027', '2028'];

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [drives, setDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isJdExpanded, setIsJdExpanded] = useState(true);
  const [lookupId, setLookupId] = useState('');

  const handleTicketLookup = (e) => {
    e.preventDefault();
    if (!lookupId.trim()) {
      toast.error('Please enter your Ticket ID (e.g. TMI-2026-...)');
      return;
    }
    const cleanId = lookupId.trim().toUpperCase();
    navigate(`/ticket/${cleanId}`);
  };

  // Parse pre-selected drive from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const preselectedDriveId = searchParams.get('drive') || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      drive_id: preselectedDriveId,
      full_name: '',
      phone: '',
      email: '',
      is_techmiya_student: false,
      techmiya_student_id: '',
      course_batch: '',
      discovery_source: 'College',
      discovery_source_other: '',
      degree: 'BE / BTech',
      degree_other: '',
      passing_year: '2026',
      is_working: false,
      current_company: '',
      job_role: '',
      experience_range: '',
      privacy_terms: false,
    },
  });

  const selectedDriveId = watch('drive_id');
  const isTechmiyaStudent = watch('is_techmiya_student');
  const selectedDiscovery = watch('discovery_source');
  const selectedDegree = watch('degree');
  const isWorking = watch('is_working');

  useEffect(() => {
    getActiveDrives()
      .then((data) => {
        setDrives(data || []);
        if (preselectedDriveId) {
          setValue('drive_id', preselectedDriveId);
        } else if (data && data.length > 0) {
          setValue('drive_id', data[0].id);
        }
      })
      .catch(() => setDrives([]))
      .finally(() => setLoadingDrives(false));
  }, [preselectedDriveId, setValue]);

  const selectedDrive = drives.find((d) => d.id === selectedDriveId);

  // Resume File Handler
  const handleFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Only PDF format resumes are accepted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume size exceeds the 5MB limit.');
      return;
    }

    setIsUploadingResume(true);
    try {
      const uploaded = await uploadResumeFile(file);
      setResumeData(uploaded);
      setValue('resume', uploaded, { shouldValidate: true });
      toast.success(`Attached ${file.name}`);
    } catch (err) {
      toast.error(err.message || 'Failed to attach resume file');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeResume = () => {
    setResumeData(null);
    setValue('resume', null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 1: Open Review Modal on valid form
  const onFormValid = (data) => {
    if (!resumeData) {
      toast.error('Please upload your resume in PDF format to continue');
      return;
    }
    setPendingFormData(data);
    setIsReviewOpen(true);
  };

  // Step 2: Final submission from Review Modal
  const handleFinalSubmit = async () => {
    if (!pendingFormData) return;
    setIsSubmitting(true);
    try {
      const res = await submitRegistration(pendingFormData);
      if (res.success) {
        setIsReviewOpen(false);
        toast.success('Registration Confirmed! Ticket Generated.');
        navigate(`/ticket/${res.ticket_id}`, {
          state: {
            ticket: res,
            isNew: true,
          },
        });
      }
    } catch (err) {
      toast.error(err.message || 'Registration submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDrives) {
    return <LoadingSpinner text="Loading registration form..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Quick Ticket Lookup Bar */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-medium">Already registered? Find your Hall Ticket / QR pass:</span>
        </div>
        <form onSubmit={handleTicketLookup} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Ticket ID (e.g. TMI-2026-XXXX)"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0 transition-colors shadow-sm"
          >
            Find Ticket
          </button>
        </form>
      </div>

      {/* Floating Dark Hero Banner Capsule (Matching trainers.techmiyaedtech.com) */}
      <div className="bg-gradient-to-r from-[#0b1727] via-[#0f2444] to-[#0b1727] text-white font-extrabold text-2xl sm:text-3xl py-6 px-8 sm:px-12 rounded-3xl text-center shadow-xl border border-blue-900/40 max-w-2xl mx-auto -mb-6 relative z-20">
        Placement Drive Registration
      </div>

      {/* Main Crisp White Form Card */}
      <div className="card-white rounded-3xl p-6 sm:p-12 shadow-2xl relative pt-12 text-slate-800">
        <form onSubmit={handleSubmit(onFormValid)} className="space-y-8">
          {/* Section F: Select the Drive */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
            <FormField
              label="Select Placement Drive"
              required
              error={errors.drive_id?.message}
              helpText="Choose an active placement or internship drive with open seats."
            >
              <select
                {...register('drive_id')}
                className="w-full px-4 py-3 rounded-xl input-light text-sm font-medium bg-white text-slate-800"
              >
                <option value="">-- Choose an Active Placement Drive --</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id} className="text-slate-800">
                    {d.name} ({d.organizer}) — {d.capacity - (d.registration_count || 0)} seats available
                  </option>
                ))}
              </select>
            </FormField>

            {selectedDrive && (
              <div className="mt-4 pt-4 border-t border-blue-200/80 space-y-3">
                {/* Header Highlights Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDrive.package_details && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                        <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{selectedDrive.package_details}</span>
                      </span>
                    )}
                    {selectedDrive.work_location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{selectedDrive.work_location}</span>
                      </span>
                    )}
                    {selectedDrive.bond_info && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedDrive.bond_info}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {selectedDrive.capacity - (selectedDrive.registration_count || 0)} seats left
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsJdExpanded(!isJdExpanded)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-100/70 hover:bg-blue-100 transition-colors"
                    >
                      <span>{isJdExpanded ? 'Collapse JD' : 'View Full JD'}</span>
                      {isJdExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible / Expandable Full JD Card */}
                {isJdExpanded && (
                  <div className="bg-white rounded-2xl p-5 border border-blue-200/90 shadow-sm space-y-4 transition-all">
                    {/* Role Title & About the Drive */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Job Description &amp; Drive Overview</span>
                        </h4>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-wider">
                          {selectedDrive.organizer}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedDrive.job_description || selectedDrive.description}
                      </p>
                    </div>

                    {/* Roles Offered */}
                    {selectedDrive.roles_offered && selectedDrive.roles_offered.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1.5">
                          Designations / Roles Offered:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDrive.roles_offered.map((role, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Skills */}
                    {selectedDrive.skills_required && selectedDrive.skills_required.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1.5">
                          Key Skills &amp; Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDrive.skills_required.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Responsibilities */}
                    {selectedDrive.responsibilities && selectedDrive.responsibilities.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1.5">
                          Job Responsibilities:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {selectedDrive.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Eligibility Criteria Grid */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Eligible Degrees</span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                          {selectedDrive.eligibility_rules?.accepted_degrees?.length > 0
                            ? selectedDrive.eligibility_rules.accepted_degrees.join(', ')
                            : 'All Degrees / Any Graduate'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Passing Batches</span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                          {selectedDrive.eligibility_rules?.accepted_passing_years?.length > 0
                            ? selectedDrive.eligibility_rules.accepted_passing_years.join(', ')
                            : 'All Recent Batches'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Min. CGPA / Cutoff</span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                          {selectedDrive.eligibility_rules?.min_cgpa
                            ? `${selectedDrive.eligibility_rules.min_cgpa} CGPA or above`
                            : 'No Minimum Cutoff'}
                        </span>
                      </div>
                    </div>

                    {/* Selection Process Pipeline */}
                    {selectedDrive.selection_process && selectedDrive.selection_process.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                          <span>Hiring &amp; Selection Process:</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedDrive.selection_process.map((round, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium"
                            >
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate">{round}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date & Reporting Venue Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 -mx-5 -mb-5 p-3.5 sm:p-4 rounded-b-2xl">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span><strong>Event Date:</strong> {formatDate(selectedDrive.event_date)} at {formatTime(selectedDrive.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span><strong>Venue / Desk:</strong> {selectedDrive.event_location}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 1: Personal Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  1. Personal &amp; Contact Info
                </h3>
                <p className="text-xs text-slate-500">
                  Provide your full legal name and active contact channels
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <FormField
                label="Full Name"
                required
                error={errors.full_name?.message}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    {...register('full_name')}
                    className="w-full px-4 py-2.5 rounded-xl input-light text-sm pl-10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </FormField>

              {/* Phone Number */}
              <FormField
                label="Phone Number (10 Digits)"
                required
                error={errors.phone?.message}
                helpText="Indian 10-digit mobile number starting with 6, 7, 8, or 9"
              >
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    {...register('phone')}
                    className="w-full px-4 py-2.5 rounded-xl input-light text-sm pl-10 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </FormField>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <FormField
                  label="Email Address"
                  required
                  error={errors.email?.message}
                  helpText="Destination for registration confirmation and QR entry ticket"
                >
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. rahul.sharma@example.com"
                      {...register('email')}
                      className="w-full px-4 py-2.5 rounded-xl input-light text-sm pl-10"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </FormField>
              </div>
            </div>
          </div>

          {/* Section 2: Techmiya Affiliation */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4 pt-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Techmiya Student Status
                </h3>
                <p className="text-xs text-slate-500">
                  Let us know if you are currently enrolled in any Techmiya training program
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Are you a Techmiya student?"
                required
              >
                <select
                  value={isTechmiyaStudent ? 'Yes' : 'No'}
                  onChange={(e) => setValue('is_techmiya_student', e.target.value === 'Yes')}
                  className="w-full px-4 py-2.5 rounded-xl input-light text-sm bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </FormField>

              {isTechmiyaStudent && (
                <>
                  <FormField
                    label="Techmiya Student ID"
                    error={errors.techmiya_student_id?.message}
                  >
                    <input
                      type="text"
                      placeholder="e.g. TM-2025-442"
                      {...register('techmiya_student_id')}
                      className="w-full px-4 py-2.5 rounded-xl input-light text-sm"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField
                      label="Enrolled Course / Batch"
                      error={errors.course_batch?.message}
                    >
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Java Batch 14 / Data Analytics 2026"
                        {...register('course_batch')}
                        className="w-full px-4 py-2.5 rounded-xl input-light text-sm"
                      />
                    </FormField>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Discovery Source */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4 pt-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  3. Discovery Source
                </h3>
                <p className="text-xs text-slate-500">
                  How did you learn about Techmiya EdTech and this drive?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Discovery Channel"
                required
                error={errors.discovery_source?.message}
              >
                <select
                  {...register('discovery_source')}
                  className="w-full px-4 py-2.5 rounded-xl input-light text-sm bg-white"
                >
                  {DISCOVERY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedDiscovery === 'Other' && (
                <FormField
                  label="Please specify channel"
                  required
                  error={errors.discovery_source_other?.message}
                >
                  <input
                    type="text"
                    placeholder="Specify how you found Techmiya"
                    {...register('discovery_source_other')}
                    className="w-full px-4 py-2.5 rounded-xl input-light text-sm"
                  />
                </FormField>
              )}
            </div>
          </div>

          {/* Section 4: Education & Employment */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4 pt-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  4. Education &amp; Employment Details
                </h3>
                <p className="text-xs text-slate-500">
                  Your graduation qualification and current work status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Degree */}
              <FormField
                label="Highest Degree"
                required
                error={errors.degree?.message}
              >
                <select
                  {...register('degree')}
                  className="w-full px-4 py-2.5 rounded-xl input-light text-sm bg-white"
                >
                  {DEGREE_OPTIONS.map((deg) => (
                    <option key={deg} value={deg}>
                      {deg}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Year of Passing */}
              <FormField
                label="Year of Passing"
                required
                error={errors.passing_year?.message}
              >
                <select
                  {...register('passing_year')}
                  className="w-full px-4 py-2.5 rounded-xl input-light text-sm bg-white"
                >
                  {PASSING_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      Class of {yr}
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedDegree === 'Other' && (
                <div className="sm:col-span-2">
                  <FormField
                    label="Specify Degree Name"
                    required
                    error={errors.degree_other?.message}
                  >
                    <input
                      type="text"
                      placeholder="Enter your degree name"
                      {...register('degree_other')}
                      className="w-full px-4 py-2.5 rounded-xl input-light text-sm"
                    />
                  </FormField>
                </div>
              )}

              {/* Are you currently working? */}
              <FormField
                label="Are you currently working?"
                required
              >
                <select
                  value={isWorking ? 'Yes' : 'No'}
                  onChange={(e) => setValue('is_working', e.target.value === 'Yes')}
                  className="w-full px-4 py-2.5 rounded-xl input-light text-sm bg-white"
                >
                  <option value="No">No (Fresher / Student)</option>
                  <option value="Yes">Yes (Working Professional)</option>
                </select>
              </FormField>

              {isWorking && (
                <>
                  <FormField
                    label="Current Company"
                    error={errors.current_company?.message}
                  >
                    <input
                      type="text"
                      placeholder="Company name"
                      {...register('current_company')}
                      className="w-full px-4 py-2.5 rounded-xl input-light text-sm"
                    />
                  </FormField>

                  <FormField
                    label="Job Role"
                    error={errors.job_role?.message}
                  >
                    <input
                      type="text"
                      placeholder="e.g. Junior Software Engineer"
                      {...register('job_role')}
                      className="w-full px-4 py-2.5 rounded-xl input-light text-sm"
                    />
                  </FormField>

                  <FormField
                    label="Experience Range"
                    error={errors.experience_range?.message}
                  >
                    <select
                      {...register('experience_range')}
                      className="w-full px-4 py-2.5 rounded-xl input-light text-sm bg-white"
                    >
                      <option value="0-1 years">0 - 1 years</option>
                      <option value="1-3 years">1 - 3 years</option>
                      <option value="3+ years">3+ years</option>
                    </select>
                  </FormField>
                </>
              )}
            </div>
          </div>

          {/* Section 5: Resume Upload */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2 pt-4">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  5. Upload Resume <span className="text-rose-500">*</span>
                </h3>
                <p className="text-xs text-slate-500">
                  PDF format only (Max: 5 MB) • Used for employer evaluation
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,.pdf"
              className="hidden"
            />

            {!resumeData ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Click or drag &amp; drop your resume (PDF only)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Maximum file size: 5 MB • Private encrypted storage
                </p>
                {isUploadingResume && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing resume file...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-300 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-800 truncate">{resumeData.fileName}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PDF validated ({(resumeData.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeResume}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                  title="Replace or remove resume"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {errors.resume && (
              <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.resume.message}
              </p>
            )}
          </div>

          {/* Mandatory Confirmation Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('privacy_terms')}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
              />
              <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                “I confirm that the information provided is accurate and agree to the registration and privacy terms.”
              </span>
            </label>
            {errors.privacy_terms && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.privacy_terms.message}
              </p>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <span>Submit Registration &amp; Get QR Pass</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-slate-500 mt-2.5">
              By submitting, you confirm that all entered details and documents are authentic.
            </p>
          </div>
        </form>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        formData={pendingFormData || {}}
        drive={selectedDrive}
        onConfirmSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
