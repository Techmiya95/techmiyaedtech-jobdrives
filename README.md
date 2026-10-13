# Techmiya EdTech — Student Drive Registration & QR Ticket System

Production-ready campus placement and career drive registration web application built for **Techmiya EdTech**. Enables students to register for placement drives, hiring events, internship drives, and workshops, generates unique encrypted QR Hall Tickets / Passes, sends confirmation emails via Resend, and provides authorized organizers with a high-speed entry desk scanner and administration console.

---

## 🌟 Key Features

1. **Multi-Drive Registration Portal**:
   - Dynamic listing of active placement drives with real-time capacity and eligibility rules.
   - Multi-field responsive form: Personal Details, Techmiya Affiliation, Discovery Source, Education (Degree, Passing Year, Work Experience), and PDF Resume Upload (max 5MB).
   - Pre-submission review screen modal with required privacy & information accuracy confirmation.
   - Concurrency-safe atomic capacity reservation and duplicate registration prevention per drive.

2. **Cryptographic QR Hall Tickets & Passes**:
   - Unique Ticket ID format: `TMI-2026-XXXXXXXX` (e.g., `TMI-2026-8F3A7C21`).
   - Secure verification token and SHA-256 hash generation.
   - **Zero PII Exposure Guarantee**: The QR code encodes strictly the verification URL (`https://drive.techmiyaedtech.com/#/verify/<token>`) and never exposes candidate phone number, email, or resume URL.
   - One-click PDF download (`jsPDF` + `html-to-image`), high-resolution PNG export, and printable pass layout.

3. **Public Ticket Verification & Organizer Check-In Desk**:
   - Public endpoint displays only minimum safe verification info: Valid/Invalid status, Ticket ID, partially masked candidate name (`A*** S*****`), drive name, event date, venue, and status.
   - Organizer camera QR scanner (`html5-qrcode`) and manual entry with strict duplicate check-in blocking.

4. **Resend Transactional Email System**:
   - Automated confirmation emails dispatched via Supabase Edge Function with subject:
     `Registration Confirmed – {{drive_name}} | Techmiya EdTech`.
   - Includes formatted event details, "View My Ticket" direct link, and plain-text fallback.

5. **Organizer Admin Dashboard**:
   - Protected console with role-based authentication.
   - Candidate roster with search, drive filtering, attendance toggling, and CSV export.
   - Authorized, time-limited 60-second signed URLs for resume viewing from private Supabase Storage.
   - Drive management: Create, configure eligibility rules, modify capacity, and publish/close drives.
   - Security audit trail logging all check-ins, registrations, and cancellations.

6. **Dual-Mode Architecture**:
   - **Production Mode**: Full integration with Supabase PostgreSQL, Supabase Storage, and Supabase Edge Functions with Resend.
   - **Demo / Local Mode**: Seamless mock database fallback with realistic sample data when environment variables are not yet configured.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Routing**: `react-router-dom` (using `HashRouter` for zero-config GitHub Pages hosting)
- **Forms & Validation**: `react-hook-form`, `@hookform/resolvers`, `zod`
- **QR Code & Scanning**: `qrcode.react` (`QRCodeSVG`), `html5-qrcode`
- **Export & Printing**: `html-to-image`, `jspdf`, `canvas-confetti`
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) + Private Supabase Storage bucket (`resumes`)
- **Email Delivery**: Resend API via Supabase Edge Function
- **Hosting & CI/CD**: GitHub Pages + GitHub Actions workflow (`deploy.yml`)

---

## 📁 Project Structure

```text
techmiya-drive-portal/
├── public/
│   ├── favicon.svg
│   ├── 404.html                          # GitHub Pages SPA deep-link redirect
│   └── CNAME                             # drive.techmiyaedtech.com
├── src/
│   ├── components/
│   │   ├── Header.jsx                    # Navigation & branding
│   │   ├── Footer.jsx                    # Contact, disclaimer & links
│   │   ├── FormField.jsx                 # Accessible form field wrapper
│   │   ├── LoadingSpinner.jsx            # Reusable SVG loader
│   │   ├── ProtectedRoute.jsx            # Admin route guard
│   │   └── ReviewModal.jsx               # Pre-submission review modal
│   ├── pages/
│   │   ├── Home.jsx                      # Portal home & featured drives
│   │   ├── DriveList.jsx                 # Filterable drives catalogue
│   │   ├── Register.jsx                  # Multi-field student registration form
│   │   ├── Ticket.jsx                    # Digital QR pass with PDF/PNG download
│   │   ├── VerifyTicket.jsx              # Public verify & organizer check-in scanner
│   │   ├── AdminLogin.jsx                # Organizer login
│   │   ├── AdminDashboard.jsx            # Full management dashboard
│   │   └── NotFound.jsx                  # 404 handler
│   ├── services/
│   │   ├── supabase.js                   # Client initialization & connection check
│   │   ├── driveService.js               # Drives query and management
│   │   ├── registrationService.js        # Resume upload & atomic registration
│   │   ├── ticketService.js              # Token verification & check-in
│   │   └── adminService.js               # Admin authentication, signed URLs & audit
│   ├── utils/
│   │   ├── validation.js                 # Zod schema with Indian phone & PDF rules
│   │   ├── formatters.js                 # Date, time, and file size formatters
│   │   └── pdfExport.js                  # High-resolution PDF & PNG generator
│   ├── App.jsx                           # Route configuration & toaster
│   ├── main.jsx                          # App entry point
│   └── index.css                         # Tailwind CSS design system tokens
├── supabase/
│   ├── migrations/
│   │   └── 20261013000000_initial_schema.sql # Complete PostgreSQL schema & RLS
│   ├── functions/
│   │   ├── register-student/index.ts     # Atomic registration & token hashing
│   │   ├── send-confirmation/index.ts    # Resend email delivery
│   │   ├── verify-ticket/index.ts        # Public masked verification
│   │   └── check-in-ticket/index.ts      # Authorized check-in & audit logging
│   └── config.toml
├── .github/
│   └── workflows/
│       └── deploy.yml                    # Automated GitHub Pages CI/CD
├── scripts/
│   └── verify-portal.mjs                 # Automated business logic test suite
├── .env.example
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
VITE_APP_URL=https://drive.techmiyaedtech.com
```
*(If left empty or unconfigured, the portal automatically operates in rich Demo Mode with mock storage, sample drives, and local attendance).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Automated Test Suite
```bash
node scripts/verify-portal.mjs
```

---

## 🗄️ Supabase Database & Backend Setup

### 1. Apply Database Migration
Open your Supabase SQL Editor and run the migration in:
`supabase/migrations/20261013000000_initial_schema.sql`.

This creates:
- `public.drives`: Table for placement drives with atomic registration counters.
- `public.registrations`: Table for student registrations with unique constraint on `(drive_id, normalized_email)`.
- `public.tickets`: Table for unique ticket records and SHA-256 token hashes.
- `public.email_events`: Transactional email delivery log.
- `public.audit_logs`: Audit trail for check-in events, cancellations, and administrative actions.
- Stored Procedures: `register_student_atomic` (capacity locks) and `verify_ticket_public` (safe masked data).
- Row Level Security (RLS) policies enforcing least privilege.

### 2. Create Storage Bucket
1. Navigate to **Storage** in your Supabase dashboard.
2. Create a new bucket named `resumes`.
3. Set bucket access to **Private** (never public).
4. Resume files will be accessed strictly via short-lived signed URLs generated by the admin service.

### 3. Deploy Supabase Edge Functions
Set your project secrets in Supabase:
```bash
supabase secrets set RESEND_API_KEY=re_your_resend_api_key
supabase secrets set APP_URL=https://drive.techmiyaedtech.com
```

Deploy the functions:
```bash
supabase functions deploy register-student
supabase functions deploy send-confirmation
supabase functions deploy verify-ticket
supabase functions deploy check-in-ticket
```

---

## 📧 Resend Email & Custom Domain Setup

1. Sign up at [Resend](https://resend.com) and add your sending domain (e.g., `techmiyaedtech.com`).
2. Add the required DNS records at your DNS registrar:
   - **DKIM**: TXT record provided by Resend.
   - **SPF**: TXT record `v=spf1 include:amazonses.com ~all`.
   - **DMARC**: TXT record at `_dmarc.techmiyaedtech.com` with `v=DMARC1; p=none;`.
3. Once verified, copy your API key and set it as `RESEND_API_KEY` in Supabase secrets.

---

## 🌐 GitHub Pages & Custom Domain Configuration

### Custom Domain: `drive.techmiyaedtech.com`

1. **DNS Configuration**:
   Add a CNAME record at your DNS provider:
   - **Type**: `CNAME`
   - **Host / Name**: `drive`
   - **Target / Value**: `<your-github-username>.github.io`
   - **TTL**: Default (3600 or automatic)

2. **Repository Settings**:
   - In GitHub, go to **Settings** > **Pages**.
   - Under **Build and deployment**, select **GitHub Actions**.
   - Under **Custom domain**, enter `drive.techmiyaedtech.com`.
   - Check **Enforce HTTPS** once DNS propagation completes.

3. **Automated Deployment**:
   The workflow `.github/workflows/deploy.yml` automatically triggers on every push to `main`, compiles the Vite production bundle, and deploys to GitHub Pages.

---

## 🔐 Security Architecture

- **No Secret Key Leakage**: Neither the Supabase service role key nor the Resend API key is included in the Vite frontend bundle.
- **Private Storage**: Resumes are stored in a private bucket using random UUID filenames (`crypto.randomUUID() + '.pdf'`), never public student names.
- **Safe Public QR Verification**: The QR code encodes only a random token URL. Scanning reveals only ticket status and masked name (`A*** S*****`), never email, phone, or resume access.
- **Concurrency-Safe Registrations**: Registration counts and capacity limits are enforced atomically inside the database using PostgreSQL row-level locks (`FOR UPDATE`).
- **Audit Logging**: All administrative check-ins, cancellations, and ticket scans are permanently recorded in `audit_logs`.

---

## 👤 Admin Console Credentials (Demo Mode)

- **URL**: [/#/admin/login](http://localhost:5173/#/admin/login)
- **Demo Email**: `admin@techmiya.edu.in`
- **Demo Password**: `Techmiya@2026`

---

## 📄 License
&copy; Techmiya EdTech. All rights reserved.
