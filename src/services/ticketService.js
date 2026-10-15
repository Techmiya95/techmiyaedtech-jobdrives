import { supabase, isSupabaseConfigured } from './supabase.js';

const STORAGE_REGISTRATIONS_KEY = 'techmiya_portal_registrations_v2';
const STORAGE_TICKETS_KEY = 'techmiya_portal_tickets_v2';
const STORAGE_AUDIT_KEY = 'techmiya_portal_audit_v2';

function maskName(name) {
  if (!name) return 'Student';
  return name.replace(/(?<=\b\w)\w+/g, '***');
}

/**
 * Fetch full ticket details by Ticket ID (e.g. TMI-2026-8F3A7C21) for the student view
 */
export async function getTicketById(ticketId) {
  if (!ticketId) throw new Error('Ticket ID is required');
  const cleanId = ticketId.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('*, drives(*), tickets(*)')
        .eq('ticket_id', cleanId)
        .single();

      if (regError) throw regError;
      if (reg) {
        return {
          ticket_id: reg.ticket_id,
          student_name: reg.full_name,
          email: reg.email,
          phone: reg.phone,
          degree: reg.degree,
          passing_year: reg.passing_year,
          status: reg.status,
          drive_name: reg.drives?.name,
          event_date: reg.drives?.event_date,
          event_location: reg.drives?.event_location,
          organizer: reg.drives?.organizer,
          issued_at: reg.tickets?.[0]?.issued_at || reg.created_at,
          ticket_status: reg.tickets?.[0]?.ticket_status || 'active',
          checked_in_at: reg.tickets?.[0]?.checked_in_at,
          token: reg.tickets?.[0]?.verification_token || cleanId,
        };
      }
    } catch (err) {
      console.warn('Supabase ticket lookup failed, falling back to local:', err);
    }
  }

  // Local fallback
  const regs = JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS_KEY) || '[]');
  const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');

  const reg = regs.find((r) => r.ticket_id.toUpperCase() === cleanId);
  if (reg) {
    const tkt = tickets.find((t) => t.ticket_id.toUpperCase() === cleanId) || {};
    return {
      ticket_id: reg.ticket_id,
      student_name: reg.full_name,
      email: reg.email,
      phone: reg.phone,
      degree: reg.degree,
      passing_year: reg.passing_year,
      status: reg.status,
      drive_name: reg.drive_name,
      event_date: reg.event_date,
      event_location: reg.event_location,
      organizer: 'Techmiya EdTech',
      issued_at: tkt.issued_at || reg.created_at,
      ticket_status: tkt.ticket_status || 'active',
      checked_in_at: tkt.checked_in_at,
      token: tkt.verification_token || cleanId,
    };
  }

  // Google Apps Script Live Ticket Lookup fallback
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  if (googleScriptUrl) {
    try {
      const response = await fetch(`${googleScriptUrl}?action=verify&id=${encodeURIComponent(cleanId)}`);
      const data = await response.json();
      if (data.success && data.candidate) {
        const c = data.candidate;
        return {
          ticket_id: c.id,
          student_name: c.fullName || 'Candidate',
          email: c.email || '',
          phone: c.phone ? c.phone.toString() : '',
          degree: c.degree || c.degreeBranch || 'BE / BTech',
          passing_year: c.passingYear ? c.passingYear.toString() : '2026',
          status: 'confirmed',
          drive_name: c.driveName || c.college || '24/7.ai Hiring Drive - Tech Support',
          event_date: '2026-10-17T03:30:00Z',
          event_location: 'Techmiya Ed-Tech, 28th Main Rd, S & C Cross A Road, Jayanagar 9th Block, Bengaluru, Karnataka 560069 (Reporting: 9:00 AM)',
          organizer: '24/7.ai',
          issued_at: c.registeredAt || new Date().toISOString(),
          ticket_status: c.attendance === 'Present' ? 'checked_in' : 'active',
          checked_in_at: c.checkInTime || null,
          token: c.id,
        };
      }
    } catch (gErr) {
      console.warn('Google Sheet ticket lookup failed:', gErr);
    }
  }

  throw new Error(`Ticket "${cleanId}" not found`);
}

/**
 * Public Verification Function (Safe masked output, zero sensitive contact details)
 */
export async function verifyTicketByToken(token) {
  if (!token) throw new Error('Verification token is required');
  const cleanToken = token.trim();

  // SHA-256 hash of token
  const encoder = new TextEncoder();
  const data = encoder.encode(cleanToken);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  if (isSupabaseConfigured()) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token: cleanToken }),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      console.warn('Live verify-ticket Edge Function failed, falling back to local:', err);
    }
  }

  // Local fallback
  const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');
  const regs = JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS_KEY) || '[]');

  // Check by token or hash or ticket_id
  const tkt = tickets.find(
    (t) =>
      t.verification_token === cleanToken ||
      t.verification_token_hash === tokenHash ||
      t.ticket_id.toUpperCase() === cleanToken.toUpperCase()
  );

  if (!tkt) {
    return {
      is_valid: false,
      error: 'Invalid or unrecognized ticket verification token.',
    };
  }

  const reg = regs.find((r) => r.ticket_id === tkt.ticket_id);
  if (!reg) {
    return { is_valid: false, error: 'Registration record for ticket is missing.' };
  }

  return {
    is_valid: true,
    ticket_status: tkt.ticket_status,
    ticket_id: tkt.ticket_id,
    masked_name: maskName(reg.full_name),
    drive_name: reg.drive_name,
    event_date: reg.event_date,
    event_location: reg.event_location,
    checked_in_at: tkt.checked_in_at,
  };
}

/**
 * Organizer Check-In Function with duplicate prevention & audit log
 */
export async function checkInTicket(ticketId, organizerName = 'Desk Organizer') {
  if (!ticketId) throw new Error('Ticket ID is required');
  const cleanId = ticketId.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-in-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          ticket_id: cleanId,
          organizer_name: organizerName,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Check-in failed');
      }
      return resData;
    } catch (err) {
      console.warn('Check-in edge function failed, using local fallback:', err);
    }
  }

  // Local fallback
  const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');
  const regs = JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS_KEY) || '[]');

  const tktIdx = tickets.findIndex((t) => t.ticket_id.toUpperCase() === cleanId);
  if (tktIdx === -1) {
    throw new Error(`Ticket "${cleanId}" not found in database.`);
  }

  if (tickets[tktIdx].ticket_status === 'checked_in') {
    throw new Error(
      `Ticket was ALREADY checked in on ${new Date(tickets[tktIdx].checked_in_at).toLocaleTimeString()} by ${
        tickets[tktIdx].checked_in_by || 'Organizer'
      }. Duplicate check-ins are restricted.`
    );
  }

  const nowIso = new Date().toISOString();
  tickets[tktIdx].ticket_status = 'checked_in';
  tickets[tktIdx].checked_in_at = nowIso;
  tickets[tktIdx].checked_in_by = organizerName;
  localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));

  // Log in audit log
  const auditLogs = JSON.parse(localStorage.getItem(STORAGE_AUDIT_KEY) || '[]');
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actor: organizerName,
    action: 'TICKET_CHECKED_IN',
    target_type: 'TICKET',
    target_id: cleanId,
    timestamp: nowIso,
  });
  localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(auditLogs));

  const reg = regs.find((r) => r.ticket_id.toUpperCase() === cleanId);

  return {
    success: true,
    message: 'Check-in successful! Attendance verified.',
    candidate_name: reg?.full_name || 'Student',
    ticket_id: cleanId,
    checked_in_at: nowIso,
  };
}
