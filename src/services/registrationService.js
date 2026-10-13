import { supabase, isSupabaseConfigured } from './supabase.js';
import { getDriveById } from './driveService.js';

const STORAGE_REGISTRATIONS_KEY = 'techmiya_portal_registrations_v2';
const STORAGE_TICKETS_KEY = 'techmiya_portal_tickets_v2';

// Generates cryptographically secure ticket ID: TMI-2026-8F3A7C21
export function generateTicketId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
  return `TMI-2026-${hex}`;
}

// Generates random secure token and returns { token, hash }
export async function generateTokenAndHash() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return { token, hash };
}

function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalRegistrations(regs) {
  try {
    localStorage.setItem(STORAGE_REGISTRATIONS_KEY, JSON.stringify(regs));
  } catch (e) {
    console.error('Failed to save registrations to localStorage:', e);
  }
}

function getLocalTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTickets(tickets) {
  try {
    localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save tickets to localStorage:', e);
  }
}

/**
 * Upload resume to private Supabase Storage bucket (or mock storage)
 */
export async function uploadResumeFile(file) {
  if (!file) throw new Error('No resume file provided');

  // Verify file size limit (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Resume file exceeds 5MB size limit.');
  }

  // Verify PDF MIME type and extension
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('Only PDF format resumes are accepted.');
  }

  // Generate cryptographically random storage object name (never student name or email)
  const randomFileName = `${crypto.randomUUID()}.pdf`;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(randomFileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (error) throw error;
      return {
        objectPath: data.path,
        fileName: file.name,
        fileSize: file.size,
      };
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local storage:', err);
    }
  }

  // Local fallback: convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        objectPath: randomFileName,
        fileName: file.name,
        fileSize: file.size,
        base64Data: reader.result,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read resume file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Submit complete student registration
 */
export async function submitRegistration(formData) {
  const { drive_id, email, phone, full_name } = formData;
  const normalizedEmail = email.trim().toLowerCase();

  // Validate drive existence & capacity
  const drive = await getDriveById(drive_id);
  if (!drive) {
    throw new Error('Selected drive is invalid or unavailable.');
  }

  if (!drive.is_active) {
    throw new Error('Registration for this drive is currently closed.');
  }

  if ((drive.registration_count || 0) >= drive.capacity) {
    throw new Error('This drive has reached maximum registration capacity.');
  }

  // Check duplicate registration
  const localRegs = getLocalRegistrations();
  const existing = localRegs.find(
    (r) => r.drive_id === drive_id && r.email.trim().toLowerCase() === normalizedEmail
  );
  if (existing) {
    throw new Error(`You have already registered for this drive with ticket ID: ${existing.ticket_id}`);
  }

  const ticketId = generateTicketId();
  const { token, hash } = await generateTokenAndHash();

  // If Supabase is configured, call Edge Function or RPC
  if (isSupabaseConfigured()) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          ...formData,
          ticket_id: ticketId,
          token_hash: hash,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        return {
          success: true,
          ticket_id: resData.ticket_id || ticketId,
          verification_token: resData.verification_token || token,
          drive,
          registration: {
            ...formData,
            ticket_id: resData.ticket_id || ticketId,
            id: resData.registration_id,
            status: 'confirmed',
          },
        };
      } else {
        throw new Error(resData.error || 'Server rejected registration');
      }
    } catch (err) {
      console.warn('Edge function call failed, falling back to local transaction:', err);
      if (err.message && (err.message.includes('already registered') || err.message.includes('capacity'))) {
        throw err;
      }
    }
  }

  // Local storage simulation
  await new Promise((resolve) => setTimeout(resolve, 600));

  const registrationRecord = {
    id: `reg-${Date.now()}`,
    ticket_id: ticketId,
    drive_id,
    drive_name: drive.name,
    event_date: drive.event_date,
    event_location: drive.event_location,
    full_name: full_name.trim(),
    phone: phone.trim(),
    email: normalizedEmail,
    is_techmiya_student: Boolean(formData.is_techmiya_student),
    techmiya_student_id: formData.techmiya_student_id || null,
    course_batch: formData.course_batch || null,
    discovery_source: formData.discovery_source || 'Other',
    discovery_source_other: formData.discovery_source_other || null,
    degree: formData.degree,
    degree_other: formData.degree_other || null,
    passing_year: formData.passing_year,
    is_working: Boolean(formData.is_working),
    current_company: formData.current_company || null,
    job_role: formData.job_role || null,
    experience_range: formData.experience_range || null,
    resume_object_path: formData.resume?.objectPath || 'mock.pdf',
    resume_file_name: formData.resume?.fileName || 'Resume.pdf',
    resume_base64: formData.resume?.base64Data || null,
    status: 'confirmed',
    privacy_consent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const ticketRecord = {
    id: `tkt-${Date.now()}`,
    registration_id: registrationRecord.id,
    ticket_id: ticketId,
    verification_token: token,
    verification_token_hash: hash,
    ticket_status: 'active',
    issued_at: new Date().toISOString(),
    checked_in_at: null,
    checked_in_by: null,
  };

  localRegs.unshift(registrationRecord);
  saveLocalRegistrations(localRegs);

  const localTickets = getLocalTickets();
  localTickets.unshift(ticketRecord);
  saveLocalTickets(localTickets);

  // Sync with Google Sheet & send confirmation email if Google Apps Script URL is configured
  const googleScriptUrl =
    import.meta.env.VITE_GOOGLE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbxFJm4XG06FPeSVWf1cVEKXp45F836arlPSzjfQKQPoOT6vDSfgut-SgoUpb033VFNgLQ/exec';

  if (googleScriptUrl && googleScriptUrl.trim() !== '') {
    try {
      const payload = {
        action: 'register',
        ticket_id: ticketId,
        full_name: registrationRecord.full_name,
        email: registrationRecord.email,
        phone: registrationRecord.phone,
        drive_name: drive.name,
        degree: registrationRecord.degree,
        passing_year: registrationRecord.passing_year,
        is_techmiya_student: registrationRecord.is_techmiya_student,
        techmiya_student_id: registrationRecord.techmiya_student_id,
        course_batch: registrationRecord.course_batch,
        discovery_source: registrationRecord.discovery_source,
        is_working: registrationRecord.is_working,
        current_company: registrationRecord.current_company,
        job_role: registrationRecord.job_role,
        resume_file_name: formData.resume?.fileName || registrationRecord.resume_file_name,
        resume: formData.resume?.base64Data ? {
          fileName: formData.resume.fileName,
          base64Data: formData.resume.base64Data,
        } : null,
      };

      // Use text/plain;charset=utf-8 so browsers do not trigger CORS preflight rejection with Google Apps Script
      await fetch(googleScriptUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
    } catch (gErr) {
      console.warn('Google Sheet dispatch error:', gErr);
    }
  }

  return {
    success: true,
    ticket_id: ticketId,
    verification_token: token,
    drive,
    registration: registrationRecord,
  };
}
