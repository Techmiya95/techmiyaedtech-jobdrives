import { studentRegistrationSchema } from '../src/utils/validation.js';
import { generateTicketId, generateTokenAndHash } from '../src/services/registrationService.js';

console.log('--- RUNNING TECHMIYA PORTAL VALIDATION & BUSINESS LOGIC TESTS ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  // Test 1: Valid registration payload
  const validData = {
    drive_id: 'd1000000-0000-0000-0000-000000000001',
    full_name: 'Aarav Sharma',
    phone: '9876543210',
    email: 'aarav.sharma@example.com',
    is_techmiya_student: true,
    techmiya_student_id: 'TM-2025-102',
    course_batch: 'Java Batch 12',
    discovery_source: 'LinkedIn',
    degree: 'BE / BTech',
    passing_year: '2026',
    is_working: false,
    resume: {
      fileName: 'Aarav_Resume.pdf',
      fileSize: 2048576, // 2MB
      objectPath: 'test.pdf',
    },
    privacy_terms: true,
  };

  const res1 = studentRegistrationSchema.safeParse(validData);
  assert(res1.success, 'Valid registration payload passes Zod validation');

  // Test 2: Invalid Indian mobile number (9 digits or starts with 2)
  const invalidPhoneData = { ...validData, phone: '123456789' };
  const res2 = studentRegistrationSchema.safeParse(invalidPhoneData);
  assert(!res2.success, 'Rejects invalid 9-digit or incorrect prefix phone number');

  // Test 3: Invalid Email address format
  const invalidEmailData = { ...validData, email: 'not-an-email' };
  const res3 = studentRegistrationSchema.safeParse(invalidEmailData);
  assert(!res3.success, 'Rejects invalid email format');

  // Test 4: Resume size exceeds 5MB
  const largeResumeData = {
    ...validData,
    resume: {
      fileName: 'Big_Resume.pdf',
      fileSize: 6 * 1024 * 1024, // 6MB
    },
  };
  const res4 = studentRegistrationSchema.safeParse(largeResumeData);
  assert(!res4.success, 'Rejects resume file larger than 5MB');

  // Test 5: Non-PDF resume rejection
  const nonPdfData = {
    ...validData,
    resume: {
      fileName: 'Resume.docx',
      fileSize: 1024 * 1024,
    },
  };
  const res5 = studentRegistrationSchema.safeParse(nonPdfData);
  assert(!res5.success, 'Rejects non-PDF resume format (.docx)');

  // Test 6: Requires specifying custom source when "Other" is chosen
  const otherSourceWithoutText = {
    ...validData,
    discovery_source: 'Other',
    discovery_source_other: '',
  };
  const res6 = studentRegistrationSchema.safeParse(otherSourceWithoutText);
  assert(!res6.success, 'Requires discovery_source_other when discovery_source is Other');

  // Test 7: Requires privacy terms acceptance
  const unacceptedTerms = { ...validData, privacy_terms: false };
  const res7 = studentRegistrationSchema.safeParse(unacceptedTerms);
  assert(!res7.success, 'Enforces mandatory acceptance of privacy notice and terms');

  // Test 8: Ticket ID format check (TMI-2026-XXXXXXXX)
  const ticketId1 = generateTicketId();
  const ticketId2 = generateTicketId();
  assert(ticketId1.startsWith('TMI-2026-') && ticketId1.length === 17, `Ticket ID matches format TMI-2026-XXXXXXXX (${ticketId1})`);
  assert(ticketId1 !== ticketId2, 'Subsequent ticket IDs are unique');

  // Test 9: Cryptographic Token & Hash generation
  const { token, hash } = await generateTokenAndHash();
  assert(token.length === 48, 'Generates 48-char cryptographically random token');
  assert(hash.length === 64, 'Generates 64-char SHA-256 hash of token');

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
