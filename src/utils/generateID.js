/**
 * Generates a memorable, unique Registration ID for candidates.
 * Format: JD26-XXXXXX (e.g., JD26-K9P4M2)
 */
export function generateRegistrationID() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JD26-${code}`;
}

/**
 * Normalizes input registration ID for search / verification
 */
export function normalizeRegistrationID(rawId) {
  if (!rawId) return '';
  let cleaned = rawId.trim().toUpperCase();
  // If user typed without hyphen or prefix, adjust if needed
  if (!cleaned.startsWith('JD26-') && cleaned.startsWith('JD26')) {
    cleaned = 'JD26-' + cleaned.substring(4);
  }
  return cleaned;
}
