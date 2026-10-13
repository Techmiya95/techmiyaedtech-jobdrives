import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Award, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  Globe,
  Code2
} from 'lucide-react';
import { registrationSchema } from '../utils/validation';
import { generateRegistrationID } from '../utils/generateID';
import { registerCandidate } from '../api/api';
import toast from 'react-hot-toast';

const DEGREE_OPTIONS = [
  'B.Tech - Computer Science & Engineering (CSE)',
  'B.Tech - Information Technology (IT)',
  'B.Tech - AI & Data Science (AI/DS)',
  'B.Tech - Electronics & Communication (ECE)',
  'B.Tech - Electrical Engineering (EE)',
  'B.Tech - Mechanical Engineering (ME)',
  'B.Tech - Civil Engineering (CE)',
  'MCA - Master of Computer Applications',
  'BCA - Bachelor of Computer Applications',
  'B.Sc - Computer Science / IT',
  'M.Tech - Computer Science / VLSI',
  'MBA - Tech Management / Operations',
  'Other Degree / Specialization',
];

const SKILL_DOMAINS = [
  'Full Stack Web Development (MERN / Next.js / Java)',
  'Frontend Engineering (React / Vue / TypeScript)',
  'Backend & Microservices (Node.js / Java / Go / Python)',
  'AI / Machine Learning & Data Science',
  'Cloud Architecture & DevOps (AWS / Docker / Kubernetes)',
  'Mobile App Development (React Native / Flutter / Android)',
  'Cybersecurity & Ethical Hacking',
  'Quality Assurance & Test Automation',
  'UI/UX & Product Design',
  'Core Hardware / Embedded Systems / IoT',
];

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      college: '',
      degreeBranch: '',
      passingYear: '2026',
      cgpa: '',
      primarySkill: '',
      secondarySkills: '',
      linkedinUrl: '',
      githubUrl: '',
      termsAccepted: true,
    },
  });

  // Handle resume file processing
  const processFile = (file) => {
    setFileError('');
    if (!file) return;

    // Check size limit (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds the 5MB limit.');
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const isDoc = validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc');

    if (!isDoc) {
      setFileError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      const filePayload = {
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        base64Data,
      };
      setResumeData(filePayload);
      setValue('resume', filePayload, { shouldValidate: true });
      toast.success(`Attached ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    };
    reader.onerror = () => {
      setFileError('Failed to read the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeResume = () => {
    setResumeData(null);
    setValue('resume', null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    if (!resumeData) {
      setFileError('Please upload your resume to proceed');
      toast.error('Resume upload is required');
      return;
    }

    setIsSubmitting(true);
    const candidateId = generateRegistrationID();

    try {
      const payload = {
        id: candidateId,
        ...data,
      };

      const res = await registerCandidate(payload);
      toast.success('Registration successful! Generating Hall Ticket...');
      navigate(`/success/${candidateId}`, { state: { candidate: payload, newlyRegistered: true } });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Form Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Priority Candidate Entry Form</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Candidate Registration
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Complete the form below to receive your official QR Entry Pass &amp; Admit Card for Drive Day.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  {...register('fullName')}
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm pl-10 ${
                    errors.fullName ? 'border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.fullName && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. aarav.sharma@example.com"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm pl-10 ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile / WhatsApp Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  {...register('phone')}
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm pl-10 font-mono ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.phone && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Academic Background */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" /> Academic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                College / University Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi Technological University (DTU) or IIT / NIT"
                {...register('college')}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                  errors.college ? 'border-rose-500 focus:ring-rose-500/20' : ''
                }`}
              />
              {errors.college && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.college.message}
                </p>
              )}
            </div>

            {/* Degree & Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Degree &amp; Branch <span className="text-rose-400">*</span>
              </label>
              <select
                {...register('degreeBranch')}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900 ${
                  errors.degreeBranch ? 'border-rose-500 focus:ring-rose-500/20' : ''
                }`}
              >
                <option value="">Select Degree &amp; Branch</option>
                {DEGREE_OPTIONS.map((deg) => (
                  <option key={deg} value={deg} className="bg-slate-900 text-slate-100">
                    {deg}
                  </option>
                ))}
              </select>
              {errors.degreeBranch && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.degreeBranch.message}
                </p>
              )}
            </div>

            {/* Passing Year & CGPA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Year <span className="text-rose-400">*</span>
                </label>
                <select
                  {...register('passingYear')}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm bg-slate-900"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  CGPA / % <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8.5 or 82%"
                  {...register('cgpa')}
                  className={`w-full px-3 py-2.5 rounded-xl glass-input text-sm ${
                    errors.cgpa ? 'border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                />
                {errors.cgpa && (
                  <p className="text-rose-400 text-[11px] mt-1">Required</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Skills & Domain */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" /> Technical Skills &amp; Domain
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Domain / Specialization <span className="text-rose-400">*</span>
              </label>
              <select
                {...register('primarySkill')}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900 ${
                  errors.primarySkill ? 'border-rose-500 focus:ring-rose-500/20' : ''
                }`}
              >
                <option value="">Select Primary Domain</option>
                {SKILL_DOMAINS.map((skill) => (
                  <option key={skill} value={skill} className="bg-slate-900 text-slate-100">
                    {skill}
                  </option>
                ))}
              </select>
              {errors.primarySkill && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.primarySkill.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Key Technologies / Frameworks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Python, PostgreSQL, Docker, AWS"
                {...register('secondarySkills')}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  LinkedIn URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    {...register('linkedinUrl')}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm pl-10"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  GitHub / Portfolio URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    {...register('githubUrl')}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm pl-10"
                  />
                  <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Resume Upload */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Resume Upload <span className="text-rose-400">*</span>
          </h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {!resumeData ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900/80'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                Click or drag &amp; drop your resume here
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOC, DOCX up to 5MB
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-white truncate">{resumeData.fileName}</p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{(resumeData.fileSize / 1024 / 1024).toFixed(2)} MB • Ready for submission</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeResume}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Remove attached resume"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {(fileError || errors.resume) && (
            <p className="text-rose-400 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {fileError || errors.resume?.message}
            </p>
          )}
        </div>

        {/* Section 5: Confirmation Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('termsAccepted')}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
              I certify that all academic and personal details provided are authentic. I agree to attend the campus job drive in formal attire and carry college identification.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.termsAccepted.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Your Hall Ticket...</span>
              </>
            ) : (
              <>
                <span>Complete Registration &amp; Get Admit Card</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            Instant Pass generation • Encrypted QR code generated immediately upon registration
          </p>
        </div>
      </form>
    </div>
  );
}
