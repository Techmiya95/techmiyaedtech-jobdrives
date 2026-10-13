import { z } from 'zod';

// Indian mobile number validator: 10 digits starting with 6, 7, 8, or 9 (with optional +91 or 0 prefix)
const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[- ]\s*)?|[0]?)?[6789]\d{9}$/;

export const studentRegistrationSchema = z.object({
  drive_id: z
    .string({ required_error: 'Please select an active placement drive' })
    .min(1, 'Please select an active placement drive'),
  
  full_name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must contain at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(indianPhoneRegex, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),

  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),

  is_techmiya_student: z
    .boolean()
    .default(false),

  techmiya_student_id: z
    .string()
    .optional(),

  course_batch: z
    .string()
    .optional(),

  discovery_source: z
    .string({ required_error: 'Please select how you heard about Techmiya' })
    .min(1, 'Please select discovery source'),

  discovery_source_other: z
    .string()
    .optional(),

  degree: z
    .string({ required_error: 'Please select your degree' })
    .min(1, 'Please select your degree'),

  degree_other: z
    .string()
    .optional(),

  passing_year: z
    .string({ required_error: 'Please select your graduation passing year' })
    .min(1, 'Please select passing year'),

  is_working: z
    .boolean()
    .default(false),

  current_company: z
    .string()
    .optional(),

  job_role: z
    .string()
    .optional(),

  experience_range: z
    .string()
    .optional(),

  resume: z
    .object({
      fileName: z.string().min(1, 'Resume file name is required'),
      fileSize: z.number().max(5 * 1024 * 1024, 'Resume file size cannot exceed 5MB'),
      objectPath: z.string().optional(),
      base64Data: z.string().optional(),
    }, { required_error: 'Please upload your latest resume in PDF format (max 5MB)' })
    .refine((val) => val && val.fileName.toLowerCase().endsWith('.pdf'), {
      message: 'Only PDF format resumes are accepted',
    }),

  privacy_terms: z
    .boolean()
    .refine((val) => val === true, 'You must confirm information accuracy and agree to registration terms'),
}).superRefine((data, ctx) => {
  // If discovery_source is Other, require discovery_source_other
  if (data.discovery_source === 'Other' && (!data.discovery_source_other || !data.discovery_source_other.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discovery_source_other'],
      message: 'Please specify where you learned about Techmiya',
    });
  }

  // If degree is Other, require degree_other
  if (data.degree === 'Other' && (!data.degree_other || !data.degree_other.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['degree_other'],
      message: 'Please specify your degree name',
    });
  }

  // If Techmiya student, optionally validate student ID if provided
  if (data.is_techmiya_student && data.techmiya_student_id && data.techmiya_student_id.trim().length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['techmiya_student_id'],
      message: 'Techmiya Student ID must be at least 3 characters',
    });
  }
});
