/**
 * API service for Techmiya Campus Job Drive
 * Dual-Mode: Uses Google Apps Script Web App if configured;
 * otherwise automatically uses rich LocalStorage mock database.
 */

const STORAGE_KEY = 'techmiya_job_drive_candidates';
const CONFIG_KEY = 'techmiya_apps_script_url';

// Default mock candidates so the app is instantly testable and demonstrable
const INITIAL_MOCK_DATA = [
  {
    id: 'JD26-A8K9M2',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    college: 'Delhi Technological University (DTU)',
    degreeBranch: 'B.Tech - Computer Science',
    passingYear: '2026',
    cgpa: '8.8',
    primarySkill: 'Full Stack Web (React & Node.js)',
    secondarySkills: 'TypeScript, Docker, Tailwind CSS, PostgreSQL',
    resumeFileName: 'Aarav_Sharma_Resume.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    attendance: 'Pending',
    checkInTime: null,
    registeredAt: '2026-10-12 10:30:00',
    linkedinUrl: 'https://linkedin.com/in/example',
    githubUrl: 'https://github.com/example',
  },
  {
    id: 'JD26-B3N7P1',
    fullName: 'Priya Iyer',
    email: 'priya.iyer@example.com',
    phone: '9812345678',
    college: 'BITS Pilani',
    degreeBranch: 'B.Tech - Electronics & Communication',
    passingYear: '2026',
    cgpa: '9.2',
    primarySkill: 'AI / Machine Learning & Data Science',
    secondarySkills: 'Python, PyTorch, LangChain, SQL',
    resumeFileName: 'Priya_Iyer_Resume.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    attendance: 'Present',
    checkInTime: '2026-10-13 09:15:22',
    registeredAt: '2026-10-11 14:20:00',
    linkedinUrl: 'https://linkedin.com/in/example',
    githubUrl: 'https://github.com/example',
  },
  {
    id: 'JD26-C4T8X9',
    fullName: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '9988776655',
    college: 'Vellore Institute of Technology (VIT)',
    degreeBranch: 'MCA - Master of Computer Applications',
    passingYear: '2025',
    cgpa: '8.4',
    primarySkill: 'Cloud & DevOps Engineering',
    secondarySkills: 'AWS, Kubernetes, Terraform, Linux',
    resumeFileName: 'Rohan_Verma_Resume.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    attendance: 'Pending',
    checkInTime: null,
    registeredAt: '2026-10-12 16:45:10',
    linkedinUrl: 'https://linkedin.com/in/example',
    githubUrl: 'https://github.com/example',
  }
];

export function getScriptUrl() {
  return localStorage.getItem(CONFIG_KEY) || import.meta.env.VITE_GOOGLE_SCRIPT_URL || import.meta.env.VITE_APPS_SCRIPT_URL || '';
}

export function setScriptUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem(CONFIG_KEY, url.trim());
  } else {
    localStorage.removeItem(CONFIG_KEY);
  }
}

function getStoredCandidates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read candidates from storage:', err);
    return INITIAL_MOCK_DATA;
  }
}

function saveStoredCandidates(candidates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch (err) {
    console.error('Failed to save candidates:', err);
  }
}

/**
 * Register a candidate
 */
export async function registerCandidate(candidateData) {
  const scriptUrl = getScriptUrl();

  // Try live Google Apps Script if URL provided
  if (scriptUrl) {
    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Crucial to prevent CORS preflight rejection in Google Apps Script
        },
        body: JSON.stringify({
          action: 'register',
          ...candidateData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Also cache locally for fast offline access
        const localList = getStoredCandidates();
        const existingIdx = localList.findIndex(c => c.id === candidateData.id);
        const record = {
          ...candidateData,
          attendance: 'Pending',
          checkInTime: null,
          registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          resumeUrl: result.resumeUrl || candidateData.resume?.base64Data,
          resumeFileName: candidateData.resume?.fileName,
        };
        if (existingIdx >= 0) {
          localList[existingIdx] = record;
        } else {
          localList.unshift(record);
        }
        saveStoredCandidates(localList);
        return { success: true, id: candidateData.id, live: true, result };
      } else {
        throw new Error(result.error || 'Server rejected registration');
      }
    } catch (err) {
      console.warn('Apps Script request failed, falling back to local simulation:', err);
      // If error was explicit duplicate message from server, throw it
      if (err.message && (err.message.includes('already registered') || err.message.includes('Server rejected'))) {
        throw err;
      }
    }
  }

  // LocalStorage Mock Registration
  await new Promise(resolve => setTimeout(resolve, 600)); // Smooth UI feel
  const candidates = getStoredCandidates();

  // Duplicate check
  const duplicate = candidates.find(
    c => c.email.toLowerCase() === candidateData.email.toLowerCase() || c.phone === candidateData.phone
  );
  if (duplicate) {
    throw new Error(`Email (${candidateData.email}) or phone is already registered with ID: ${duplicate.id}`);
  }

  const record = {
    ...candidateData,
    attendance: 'Pending',
    checkInTime: null,
    registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    resumeFileName: candidateData.resume?.fileName || 'resume.pdf',
    resumeUrl: candidateData.resume?.base64Data || null,
  };

  candidates.unshift(record);
  saveStoredCandidates(candidates);
  return { success: true, id: candidateData.id, live: false };
}

/**
 * Verify candidate by Registration ID
 */
export async function verifyCandidate(id) {
  if (!id) throw new Error('Registration ID required');
  const cleanId = id.trim().toUpperCase();
  const scriptUrl = getScriptUrl();

  if (scriptUrl) {
    try {
      const url = `${scriptUrl}?action=verify&id=${encodeURIComponent(cleanId)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.candidate) {
        return { success: true, candidate: data.candidate, live: true };
      }
    } catch (err) {
      console.warn('Live verify failed, falling back to local storage:', err);
    }
  }

  // Local fallback
  const candidates = getStoredCandidates();
  const candidate = candidates.find(c => c.id.toUpperCase() === cleanId);
  if (!candidate) {
    throw new Error(`No registration found for ID: ${cleanId}`);
  }

  return { success: true, candidate, live: false };
}

/**
 * Mark Attendance / Check In
 */
export async function markAttendance(id) {
  if (!id) throw new Error('Registration ID required');
  const cleanId = id.trim().toUpperCase();
  const scriptUrl = getScriptUrl();

  if (scriptUrl) {
    try {
      const url = `${scriptUrl}?action=markAttendance&id=${encodeURIComponent(cleanId)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        // Update local cache as well
        const candidates = getStoredCandidates();
        const idx = candidates.findIndex(c => c.id.toUpperCase() === cleanId);
        if (idx >= 0) {
          candidates[idx].attendance = 'Present';
          candidates[idx].checkInTime = data.candidate?.checkInTime || new Date().toISOString().replace('T', ' ').substring(0, 19);
          saveStoredCandidates(candidates);
        }
        return { success: true, candidate: data.candidate, live: true };
      }
    } catch (err) {
      console.warn('Live attendance marking failed, using local storage:', err);
    }
  }

  // Local fallback
  const candidates = getStoredCandidates();
  const idx = candidates.findIndex(c => c.id.toUpperCase() === cleanId);
  if (idx === -1) {
    throw new Error(`Candidate with ID "${cleanId}" not found`);
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  candidates[idx].attendance = 'Present';
  candidates[idx].checkInTime = nowStr;
  saveStoredCandidates(candidates);

  return { success: true, candidate: candidates[idx], live: false };
}

/**
 * Get all candidates (For Admin / Recruiter Dashboard)
 */
export async function getAllCandidates() {
  const scriptUrl = getScriptUrl();

  if (scriptUrl) {
    try {
      const url = `${scriptUrl}?action=list`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && Array.isArray(data.candidates)) {
        return { success: true, candidates: data.candidates, live: true };
      }
    } catch (err) {
      console.warn('Live list fetch failed, falling back to local storage:', err);
    }
  }

  return { success: true, candidates: getStoredCandidates(), live: false };
}

/**
 * Get candidate directly from local cache if available (for instant Success page rendering)
 */
export function getLocalCandidate(id) {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  const candidates = getStoredCandidates();
  return candidates.find(c => c.id.toUpperCase() === cleanId) || null;
}
