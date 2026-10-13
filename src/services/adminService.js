import { supabase, isSupabaseConfigured } from './supabase.js';

const ADMIN_SESSION_KEY = 'techmiya_admin_session';
const STORAGE_REGISTRATIONS_KEY = 'techmiya_portal_registrations_v2';
const STORAGE_TICKETS_KEY = 'techmiya_portal_tickets_v2';
const STORAGE_AUDIT_KEY = 'techmiya_portal_audit_v2';

export async function adminLogin(email, password) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ email: data.user.email, role: 'admin' }));
      return { success: true, user: data.user };
    } catch (err) {
      console.warn('Supabase auth failed, testing demo credentials:', err);
    }
  }

  // Demo admin credentials fallback
  if (
    (email.trim().toLowerCase() === 'admin@techmiya.edu.in' || email.trim().toLowerCase() === 'admin@techmiyaedtech.com') &&
    password === 'Techmiya@2026'
  ) {
    const session = { email: email.trim(), role: 'admin', token: 'mock-admin-token-2026' };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  throw new Error('Invalid email or password. Use demo credentials: admin@techmiya.edu.in / Techmiya@2026');
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  if (isSupabaseConfigured()) {
    supabase.auth.signOut().catch(() => {});
  }
}

/**
 * Get all registrations with tickets and drive info for Admin Roster
 */
export async function getAdminRegistrations(driveId = null) {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('registrations')
        .select('*, drives(*), tickets(*)')
        .order('created_at', { ascending: false });

      if (driveId) {
        query = query.eq('drive_id', driveId);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        return data.map((r) => ({
          id: r.id,
          ticket_id: r.ticket_id,
          full_name: r.full_name,
          email: r.email,
          phone: r.phone,
          drive_id: r.drive_id,
          drive_name: r.drives?.name || 'Drive',
          degree: r.degree,
          passing_year: r.passing_year,
          is_techmiya_student: r.is_techmiya_student,
          resume_path: r.resume_object_path,
          status: r.status,
          attendance: r.tickets?.[0]?.ticket_status === 'checked_in' ? 'Present' : 'Pending',
          checked_in_at: r.tickets?.[0]?.checked_in_at,
          created_at: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Google Apps Script Live Sync fallback
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  if (googleScriptUrl) {
    try {
      const response = await fetch(`${googleScriptUrl}?action=list`);
      const data = await response.json();
      if (data.success && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const sheetCandidates = data.candidates.map((c) => ({
          id: c.id,
          ticket_id: c.id,
          full_name: c.fullName || 'Candidate',
          email: c.email,
          phone: c.phone ? c.phone.toString() : '',
          drive_id: driveId || 'd1000000-0000-0000-0000-000000000001',
          drive_name: c.driveName || c.college || 'Techmiya Placement Drive 2026',
          degree: c.degree || c.degreeBranch || 'BE / BTech',
          passing_year: c.passingYear ? c.passingYear.toString() : '2026',
          is_techmiya_student: c.isTechmiyaStudent === 'Yes' || c.cgpa === 'Yes',
          resume_path: c.resumeUrl || null,
          resume_base64: null,
          resume_file_name: c.resumeFileName || 'Resume.pdf',
          status: 'confirmed',
          attendance: c.attendance === 'Present' ? 'Present' : 'Pending',
          checked_in_at: c.checkInTime || null,
          created_at: c.registeredAt || new Date().toISOString(),
        }));

        // Merge with local registrations
        const localRegs = JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS_KEY) || '[]');
        const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');
        const localMapped = localRegs.map((r) => {
          const t = tickets.find((tkt) => tkt.ticket_id === r.ticket_id);
          return {
            id: r.id,
            ticket_id: r.ticket_id,
            full_name: r.full_name,
            email: r.email,
            phone: r.phone,
            drive_id: r.drive_id,
            drive_name: r.drive_name || 'Placement Drive',
            degree: r.degree,
            passing_year: r.passing_year,
            is_techmiya_student: r.is_techmiya_student,
            resume_path: r.resume_object_path,
            resume_base64: r.resume_base64,
            resume_file_name: r.resume_file_name,
            status: r.status,
            attendance: t?.ticket_status === 'checked_in' ? 'Present' : 'Pending',
            checked_in_at: t?.checked_in_at,
            created_at: r.created_at,
          };
        });

        // Combined without duplicate ticket IDs
        const combined = [...sheetCandidates];
        localMapped.forEach((loc) => {
          if (!combined.some((sc) => sc.ticket_id === loc.ticket_id)) {
            combined.push(loc);
          }
        });

        return combined.filter((r) => !driveId || r.drive_id === driveId);
      }
    } catch (gErr) {
      console.warn('Google Sheet live sync failed, using local storage:', gErr);
    }
  }

  // Local fallback
  const regs = JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS_KEY) || '[]');
  const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');

  return regs
    .filter((r) => !driveId || r.drive_id === driveId)
    .map((r) => {
      const t = tickets.find((tkt) => tkt.ticket_id === r.ticket_id);
      return {
        id: r.id,
        ticket_id: r.ticket_id,
        full_name: r.full_name,
        email: r.email,
        phone: r.phone,
        drive_id: r.drive_id,
        drive_name: r.drive_name || 'Placement Drive',
        degree: r.degree,
        passing_year: r.passing_year,
        is_techmiya_student: r.is_techmiya_student,
        resume_path: r.resume_object_path,
        resume_base64: r.resume_base64,
        resume_file_name: r.resume_file_name,
        status: r.status,
        attendance: t?.ticket_status === 'checked_in' ? 'Present' : 'Pending',
        checked_in_at: t?.checked_in_at,
        created_at: r.created_at,
      };
    });
}

/**
 * Generate authorized short-lived signed URL for resume (never public)
 */
export async function getResumeSignedUrl(objectPath, base64Fallback = null) {
  if (isSupabaseConfigured() && objectPath && !objectPath.startsWith('data:')) {
    try {
      // 60-second time-limited signed URL
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(objectPath, 60);

      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.warn('Failed to generate signed URL from Supabase:', err);
    }
  }

  // Fallback to local base64 or placeholder
  if (base64Fallback) return base64Fallback;
  return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
}

/**
 * Cancel a registration with recorded reason
 */
export async function cancelRegistration(ticketId, reason = 'Administrative cancellation') {
  const cleanId = ticketId.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('ticket_id', cleanId);

      await supabase
        .from('tickets')
        .update({ ticket_status: 'cancelled' })
        .eq('ticket_id', cleanId);
    } catch (err) {
      console.warn('Supabase cancel failed, using local:', err);
    }
  }

  // Local fallback
  const regs = JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS_KEY) || '[]');
  const regIdx = regs.findIndex((r) => r.ticket_id.toUpperCase() === cleanId);
  if (regIdx >= 0) {
    regs[regIdx].status = 'cancelled';
    localStorage.setItem(STORAGE_REGISTRATIONS_KEY, JSON.stringify(regs));
  }

  const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');
  const tktIdx = tickets.findIndex((t) => t.ticket_id.toUpperCase() === cleanId);
  if (tktIdx >= 0) {
    tickets[tktIdx].ticket_status = 'cancelled';
    localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));
  }

  // Log in audit log
  const auditLogs = JSON.parse(localStorage.getItem(STORAGE_AUDIT_KEY) || '[]');
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actor: 'Admin',
    action: 'REGISTRATION_CANCELLED',
    target_type: 'REGISTRATION',
    target_id: cleanId,
    metadata: { reason },
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(auditLogs));

  return { success: true, message: `Registration ${cleanId} cancelled.` };
}

/**
 * Get audit logs for Admin Dashboard
 */
export async function getAuditLogs() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('Failed to load audit logs from Supabase:', err);
    }
  }

  return JSON.parse(localStorage.getItem(STORAGE_AUDIT_KEY) || '[]');
}
