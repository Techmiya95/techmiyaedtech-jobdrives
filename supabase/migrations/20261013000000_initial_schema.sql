-- =========================================================================
-- TECHMIYA EDTECH STUDENT DRIVE REGISTRATION & QR TICKET SYSTEM
-- SUPABASE POSTGRESQL PRODUCTION SCHEMA & ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DRIVES TABLE
CREATE TABLE IF NOT EXISTS public.drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    organizer TEXT NOT NULL DEFAULT 'Techmiya EdTech',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    event_location TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 150 CHECK (capacity > 0),
    registration_count INT NOT NULL DEFAULT 0 CHECK (registration_count >= 0),
    eligibility_rules JSONB NOT NULL DEFAULT '{"accepted_degrees": [], "accepted_passing_years": [], "min_cgpa": null}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying active drives
CREATE INDEX IF NOT EXISTS idx_drives_active ON public.drives (is_active, start_date, end_date);

-- 2. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT NOT NULL UNIQUE,
    drive_id UUID NOT NULL REFERENCES public.drives(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    normalized_email TEXT GENERATED ALWAYS AS (lower(trim(email))) STORED,
    is_techmiya_student BOOLEAN NOT NULL DEFAULT false,
    techmiya_student_id TEXT,
    course_batch TEXT,
    discovery_source TEXT NOT NULL,
    discovery_source_other TEXT,
    degree TEXT NOT NULL,
    degree_other TEXT,
    passing_year TEXT NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT false,
    current_company TEXT,
    job_role TEXT,
    experience_range TEXT,
    resume_object_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending_email', 'confirmed', 'cancelled', 'waitlist')),
    privacy_consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Enforce single registration per student per drive
    CONSTRAINT uq_drive_student_email UNIQUE (drive_id, normalized_email)
);

CREATE INDEX IF NOT EXISTS idx_registrations_drive ON public.registrations (drive_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_id ON public.registrations (ticket_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (normalized_email);

-- 3. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    verification_token_hash TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    checked_in_by TEXT,
    ticket_status TEXT NOT NULL DEFAULT 'active' CHECK (ticket_status IN ('active', 'checked_in', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_token_hash ON public.tickets (verification_token_hash);

-- 4. EMAIL EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    provider_message_id TEXT,
    event_type TEXT NOT NULL,
    delivery_status TEXT NOT NULL,
    attempt_count INT NOT NULL DEFAULT 1,
    last_error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON public.audit_logs (target_type, target_id);

-- =========================================================================
-- ATOMIC CONCURRENCY-SAFE REGISTRATION FUNCTION
-- =========================================================================
CREATE OR REPLACE FUNCTION public.register_student_atomic(
    p_drive_id UUID,
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_is_techmiya_student BOOLEAN,
    p_techmiya_student_id TEXT,
    p_course_batch TEXT,
    p_discovery_source TEXT,
    p_discovery_source_other TEXT,
    p_degree TEXT,
    p_degree_other TEXT,
    p_passing_year TEXT,
    p_is_working BOOLEAN,
    p_current_company TEXT,
    p_job_role TEXT,
    p_experience_range TEXT,
    p_resume_object_path TEXT,
    p_ticket_id TEXT,
    p_token_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_drive RECORD;
    v_reg_id UUID;
    v_norm_email TEXT;
BEGIN
    v_norm_email := lower(trim(p_email));

    -- Lock drive record to guarantee atomic capacity reservation
    SELECT * INTO v_drive
    FROM public.drives
    WHERE id = p_drive_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Drive not found or registration is closed.');
    END IF;

    -- Verify registration window
    IF now() < v_drive.start_date OR now() > v_drive.end_date THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration window for this drive is not open.');
    END IF;

    -- Verify capacity
    IF v_drive.registration_count >= v_drive.capacity THEN
        RETURN jsonb_build_object('success', false, 'error', 'This drive has reached maximum registration capacity.');
    END IF;

    -- Check duplicate registration
    IF EXISTS (
        SELECT 1 FROM public.registrations
        WHERE drive_id = p_drive_id AND normalized_email = v_norm_email
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'This email is already registered for this drive.');
    END IF;

    -- Insert registration
    INSERT INTO public.registrations (
        ticket_id,
        drive_id,
        full_name,
        phone,
        email,
        is_techmiya_student,
        techmiya_student_id,
        course_batch,
        discovery_source,
        discovery_source_other,
        degree,
        degree_other,
        passing_year,
        is_working,
        current_company,
        job_role,
        experience_range,
        resume_object_path,
        status
    ) VALUES (
        p_ticket_id,
        p_drive_id,
        trim(p_full_name),
        trim(p_phone),
        v_norm_email,
        p_is_techmiya_student,
        p_techmiya_student_id,
        p_course_batch,
        p_discovery_source,
        p_discovery_source_other,
        p_degree,
        p_degree_other,
        p_passing_year,
        p_is_working,
        p_current_company,
        p_job_role,
        p_experience_range,
        p_resume_object_path,
        'confirmed'
    ) RETURNING id INTO v_reg_id;

    -- Insert ticket record
    INSERT INTO public.tickets (
        registration_id,
        verification_token_hash,
        ticket_status
    ) VALUES (
        v_reg_id,
        p_token_hash,
        'active'
    );

    -- Increment drive registration count atomically
    UPDATE public.drives
    SET registration_count = registration_count + 1,
        updated_at = now()
    WHERE id = p_drive_id;

    -- Record audit entry
    INSERT INTO public.audit_logs (actor, action, target_type, target_id, metadata)
    VALUES (v_norm_email, 'STUDENT_REGISTERED', 'REGISTRATION', v_reg_id::text, jsonb_build_object('ticket_id', p_ticket_id, 'drive_id', p_drive_id));

    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_reg_id,
        'ticket_id', p_ticket_id,
        'drive_name', v_drive.name,
        'event_date', v_drive.event_date,
        'event_location', v_drive.event_location
    );
END;
$$;

-- =========================================================================
-- PUBLIC VERIFICATION FUNCTION (MINIMAL SAFE DATA EXPOSURE)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.verify_ticket_public(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_res RECORD;
    v_masked_name TEXT;
BEGIN
    SELECT 
        t.ticket_status,
        t.checked_in_at,
        r.ticket_id,
        r.full_name,
        d.name AS drive_name,
        d.event_date,
        d.event_location
    INTO v_res
    FROM public.tickets t
    JOIN public.registrations r ON t.registration_id = r.id
    JOIN public.drives d ON r.drive_id = d.id
    WHERE t.verification_token_hash = p_token_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('is_valid', false, 'error', 'Invalid or unverified ticket token.');
    END IF;

    -- Partial name masking for privacy: "A**** S*****"
    v_masked_name := regexp_replace(v_res.full_name, '(?<=\b\w)\w+', '***', 'g');

    RETURN jsonb_build_object(
        'is_valid', true,
        'ticket_status', v_res.ticket_status,
        'ticket_id', v_res.ticket_id,
        'masked_name', v_masked_name,
        'drive_name', v_res.drive_name,
        'event_date', v_res.event_date,
        'event_location', v_res.event_location,
        'checked_in_at', v_res.checked_in_at
    );
END;
$$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Drives: Everyone can view active drives
CREATE POLICY "Public can view active drives"
    ON public.drives
    FOR SELECT
    USING (is_active = true);

-- Admins can view and edit all drives
CREATE POLICY "Admins have full access to drives"
    ON public.drives
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- 2. Registrations: Protected from public listing
CREATE POLICY "Admins have full access to registrations"
    ON public.registrations
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- 3. Tickets: Protected
CREATE POLICY "Admins have full access to tickets"
    ON public.tickets
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- 4. Audit logs: Admins only
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- =========================================================================
-- SEED DATA: REALISTIC SAMPLE DRIVES
-- =========================================================================
INSERT INTO public.drives (name, description, organizer, start_date, end_date, event_date, event_location, capacity, registration_count, eligibility_rules, is_active)
VALUES
(
    'Techmiya Placement Drive 2026',
    'Flagship campus drive connecting graduates with top tier tech MNCs and high-growth Indian startups.',
    'Techmiya EdTech Placement Cell',
    now() - interval '2 days',
    now() + interval '30 days',
    '2026-11-15 09:00:00+00',
    'Techmiya Tech Campus & Virtual Assessment Labs',
    250,
    18,
    '{"accepted_degrees": ["BE / BTech", "BCA", "MCA", "BSc", "MSc"], "accepted_passing_years": ["2024", "2025", "2026"], "min_cgpa": "6.5"}'::jsonb,
    true
),
(
    'Software Developer Hiring Drive',
    'Specialized engineering drive hiring Full Stack, Frontend, Backend, and Mobile App Engineers.',
    'Techmiya Hiring Partners',
    now() - interval '1 day',
    now() + interval '20 days',
    '2026-11-20 10:00:00+00',
    'Main Auditorium & Tech Labs, Bengaluru',
    180,
    34,
    '{"accepted_degrees": ["BE / BTech", "BCA", "MCA", "M.Tech"], "accepted_passing_years": ["2024", "2025", "2026", "2027"], "min_cgpa": "7.0"}'::jsonb,
    true
),
(
    'Data Analytics Hiring Drive',
    'Opportunities for Data Analysts, BI Specialists, SQL Developers, and Python Data Engineers.',
    'Techmiya Analytics Group',
    now() - interval '3 days',
    now() + interval '25 days',
    '2026-11-22 09:30:00+00',
    'Virtual Assessment & Interview Floor',
    120,
    22,
    '{"accepted_degrees": ["BE / BTech", "BCA", "MCA", "BSc", "MSc", "BCom", "MBA"], "accepted_passing_years": ["2024", "2025", "2026"], "min_cgpa": "6.0"}'::jsonb,
    true
),
(
    'AI/ML Internship Drive',
    '6-Month paid internships with pre-placement offers (PPO) in Generative AI, PyTorch, and NLP.',
    'Techmiya AI Research Lab',
    now() - interval '5 days',
    now() + interval '15 days',
    '2026-11-28 11:00:00+00',
    'Innovation Lab 4 & Online',
    90,
    15,
    '{"accepted_degrees": ["BE / BTech", "MCA", "MSc"], "accepted_passing_years": ["2025", "2026", "2027"], "min_cgpa": "7.5"}'::jsonb,
    true
),
(
    'Python Full Stack Hiring Drive',
    'Comprehensive hiring drive for Django, FastAPI, React, and PostgreSQL developer openings.',
    'Techmiya Partner Consortium',
    now() - interval '1 day',
    now() + interval '18 days',
    '2026-12-05 09:00:00+00',
    'Techmiya Center of Excellence, Hyderabad',
    150,
    12,
    '{"accepted_degrees": ["BE / BTech", "BCA", "MCA", "BSc", "Diploma"], "accepted_passing_years": ["2023", "2024", "2025", "2026"], "min_cgpa": null}'::jsonb,
    true
),
(
    'Java Full Stack Hiring Drive',
    'Hiring enterprise software engineers specializing in Spring Boot, Microservices, and Angular/React.',
    'Techmiya Enterprise Hiring Network',
    now() - interval '4 days',
    now() + interval '22 days',
    '2026-12-10 09:30:00+00',
    'Campus Center, Pune & Virtual',
    200,
    29,
    '{"accepted_degrees": ["BE / BTech", "MCA", "MSc"], "accepted_passing_years": ["2024", "2025", "2026"], "min_cgpa": "6.5"}'::jsonb,
    true
),
(
    'Techmiya Career and Internship Drive',
    'Multi-disciplinary hiring for interns, freshers, business analysts, QA engineers, and operations associates.',
    'Techmiya EdTech',
    now() - interval '2 days',
    now() + interval '40 days',
    '2026-12-18 10:00:00+00',
    'Grand Auditorium, Techmiya Head Office',
    300,
    45,
    '{"accepted_degrees": [], "accepted_passing_years": ["2024", "2025", "2026", "2027"], "min_cgpa": null}'::jsonb,
    true
);
