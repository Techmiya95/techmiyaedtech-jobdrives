import { supabase, isSupabaseConfigured } from './supabase.js';

const STORAGE_DRIVES_KEY = 'techmiya_portal_drives_v4';

export const SAMPLE_DRIVES = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    name: '24/7.ai Hiring Drive - Tech Support',
    organizer: '24/7.ai',
    description: 'Exclusive campus recruitment drive by 24/7.ai for Tech Support / Voice Process roles.',
    package_details: '₹3.95 LPA',
    roles_offered: ['Tech Support Executive (Voice Process)', 'Technical Support Associate'],
    skills_required: [
      'Excellent English Verbal & Communication Skills',
      'Technical Support & Computer Basics',
      'Active Listening & Customer Handling',
      'Analytical & Troubleshooting Ability',
    ],
    job_description: 'Campus hiring drive conducted by 24/7.ai for Tech Support (Voice Process). Selected candidates will handle voice queries, troubleshoot technology and customer issues, and deliver technical support for global clients.',
    responsibilities: [
      'Handle inbound and outbound technical support interactions over the phone (Voice Process).',
      'Diagnose and troubleshoot hardware, software, and application queries.',
      'Ensure high first-contact resolution rates and maintain customer delight.',
      'Log and escalate incidents accurately according to standard operating procedures.',
    ],
    selection_process: [
      'Round 1: PIR (Preliminary Interview Round)',
      'Round 2: Harver Assessment',
      'Round 3: ACM Round',
    ],
    work_location: 'Bengaluru / Onsite',
    bond_info: 'No Service Bond',
    start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 10 * 86400000).toISOString(),
    event_date: '2026-10-17T03:30:00Z', // 17th October 2026, 9:00 AM IST
    event_location: 'Techmiya Ed-Tech, 28th Main Rd, S & C Cross A Road, Jayanagar 9th Block, Bengaluru, Karnataka 560069 (Reporting: 9:00 AM)',
    capacity: 250,
    registration_count: 0,
    eligibility_rules: {
      accepted_degrees: ['BE / BTech', 'BCA', 'BSc', 'BCom', 'BBA', 'BA', 'MCA', 'Any Graduate'],
      accepted_passing_years: ['2023', '2024', '2025', '2026'],
      min_cgpa: null,
    },
    is_active: true,
  },
  /*
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    name: 'Software Developer Hiring Drive',
    organizer: 'Techmiya Hiring Partners',
    description: 'Specialized engineering drive hiring Full Stack, Frontend, Backend, and Mobile App Engineers.',
    package_details: '₹6.00 LPA – ₹12.00 LPA',
    roles_offered: ['Full Stack Developer', 'Frontend Engineer (React)', 'Backend Engineer (Node/Java)'],
    skills_required: ['JavaScript / TypeScript', 'React.js or Next.js', 'Node.js or Spring Boot', 'REST APIs', 'Git & CI/CD'],
    job_description: 'Focused hiring drive for specialized software engineering talent across web and cloud platforms. Partner companies are building scalable SaaS platforms, fintech gateways, and consumer tech solutions. Engineers will be responsible for creating modern reactive user interfaces and resilient backend microservices.',
    responsibilities: [
      'Develop reactive, accessible frontend user interfaces and resilient microservices.',
      'Build and integrate RESTful and GraphQL APIs with robust security checks.',
      'Optimize web vitals, state management, and database query latency.',
      'Contribute to architectural discussions and maintain automated test coverage.',
    ],
    selection_process: [
      'Round 1: Online Coding Challenge (Algorithms & Data Structures)',
      'Round 2: Machine Coding / Live Problem Solving Session',
      'Round 3: Architecture & System Design / Deep Dive Round',
      'Round 4: Culture Fit & Offer Discussion',
    ],
    work_location: 'Bengaluru (Onsite / Tech Park Campus)',
    bond_info: 'No Service Bond',
    start_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 20 * 86400000).toISOString(),
    event_date: '2026-11-20T10:00:00Z',
    event_location: 'Main Auditorium & Tech Labs, Bengaluru',
    capacity: 180,
    registration_count: 34,
    eligibility_rules: {
      accepted_degrees: ['BE / BTech', 'BCA', 'MCA', 'M.Tech'],
      accepted_passing_years: ['2024', '2025', '2026', '2027'],
      min_cgpa: '7.0',
    },
    is_active: true,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000003',
    name: 'Data Analytics Hiring Drive',
    organizer: 'Techmiya Analytics Group',
    description: 'Opportunities for Data Analysts, BI Specialists, SQL Developers, and Python Data Engineers.',
    package_details: '₹4.80 LPA – ₹9.00 LPA',
    roles_offered: ['Data Analyst', 'Business Intelligence Specialist', 'Junior Data Engineer'],
    skills_required: ['SQL (Complex Joins & Window Functions)', 'Python (Pandas, NumPy)', 'Power BI / Tableau', 'Advanced Excel', 'Data Modeling'],
    job_description: 'Accelerated hiring drive for analytical minds passionate about uncovering actionable business insights from large-scale datasets. Recruited analysts work alongside senior data scientists and executive leadership to drive commercial decision-making.',
    responsibilities: [
      'Extract, transform, and clean large datasets from production transactional databases.',
      'Build interactive executive dashboards and automated KPI tracking reports.',
      'Perform exploratory data analysis and root cause analysis for commercial decision-making.',
      'Collaborate with engineering teams to validate data pipeline integrity.',
    ],
    selection_process: [
      'Round 1: SQL & Data Aptitude Test',
      'Round 2: Practical Dashboard / Python Case Study Round',
      'Round 3: Technical Interview with Analytics Lead',
      'Round 4: HR & Fitment Discussion',
    ],
    work_location: 'Bengaluru / Virtual Assessment Floor',
    bond_info: 'No Service Bond',
    start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    event_date: '2026-11-22T09:30:00Z',
    event_location: 'Virtual Assessment & Interview Floor',
    capacity: 120,
    registration_count: 22,
    eligibility_rules: {
      accepted_degrees: ['BE / BTech', 'BCA', 'MCA', 'BSc', 'MSc', 'BCom', 'MBA'],
      accepted_passing_years: ['2024', '2025', '2026'],
      min_cgpa: '6.0',
    },
    is_active: true,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000004',
    name: 'AI/ML Internship Drive',
    organizer: 'Techmiya AI Research Lab',
    description: '6-Month paid internships with pre-placement offers (PPO) in Generative AI, PyTorch, and NLP.',
    package_details: '₹25,000 – ₹45,000 / month Stipend (PPO: ₹8.5 – ₹15.0 LPA upon completion)',
    roles_offered: ['Machine Learning Intern', 'Generative AI Research Intern', 'NLP Engineering Trainee'],
    skills_required: ['Python', 'PyTorch or TensorFlow', 'Hugging Face & LLM APIs', 'Linear Algebra & Statistics', 'Vector Databases'],
    job_description: '6-Month intensive internship program with direct pre-placement conversion opportunities at Techmiya AI Research Lab and leading AI startups. Work on real-world generative AI workflows, Retrieval-Augmented Generation (RAG), and computer vision pipelines.',
    responsibilities: [
      'Train, fine-tune, and evaluate open-source language and vision models.',
      'Build RAG pipelines using LangChain, LlamaIndex, and vector databases.',
      'Conduct benchmark evaluations and latency profiling for edge deployment.',
      'Author research summaries and publish open engineering logs.',
    ],
    selection_process: [
      'Round 1: ML Fundamentals & Python Screening',
      'Round 2: Take-Home AI Project / GitHub Code Review',
      'Round 3: Technical Discussion on Deep Learning Architecture',
      'Round 4: Offer Confirmation',
    ],
    work_location: 'Innovation Lab 4, Bengaluru & Hybrid',
    bond_info: '6-Month Internship Contract with PPO',
    start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    event_date: '2026-11-28T11:00:00Z',
    event_location: 'Innovation Lab 4 & Online',
    capacity: 90,
    registration_count: 15,
    eligibility_rules: {
      accepted_degrees: ['BE / BTech', 'MCA', 'MSc'],
      accepted_passing_years: ['2025', '2026', '2027'],
      min_cgpa: '7.5',
    },
    is_active: true,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000005',
    name: 'Python Full Stack Hiring Drive',
    organizer: 'Techmiya Partner Consortium',
    description: 'Comprehensive hiring drive for Django, FastAPI, React, and PostgreSQL developer openings.',
    package_details: '₹4.50 LPA – ₹8.50 LPA',
    roles_offered: ['Python Developer', 'Django/FastAPI Backend Engineer', 'Full Stack Associate'],
    skills_required: ['Python 3.x', 'FastAPI / Django', 'PostgreSQL', 'React / HTML5 / CSS3', 'Docker Basics'],
    job_description: 'Dedicated hiring consortium for python developers to build high-concurrency microservices, data processing micro-apps, and modern reactive dashboards for enterprise clients.',
    responsibilities: [
      'Write robust backend logic, ORM models, and asynchronous worker queues.',
      'Create clean API integrations with third-party payment and authentication providers.',
      'Deploy and monitor containerized services using Docker.',
    ],
    selection_process: [
      'Round 1: Online Python & SQL Quiz + Coding Task',
      'Round 2: Technical Interview (Core Python, Concurrency, Frameworks)',
      'Round 3: HR Final Discussion',
    ],
    work_location: 'Hyderabad & Bengaluru',
    bond_info: 'No Service Bond',
    start_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 18 * 86400000).toISOString(),
    event_date: '2026-12-05T09:00:00Z',
    event_location: 'Techmiya Center of Excellence, Hyderabad',
    capacity: 150,
    registration_count: 12,
    eligibility_rules: {
      accepted_degrees: ['BE / BTech', 'BCA', 'MCA', 'BSc', 'Diploma'],
      accepted_passing_years: ['2023', '2024', '2025', '2026'],
      min_cgpa: null,
    },
    is_active: true,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000006',
    name: 'Java Full Stack Hiring Drive',
    organizer: 'Techmiya Enterprise Hiring Network',
    description: 'Hiring enterprise software engineers specializing in Spring Boot, Microservices, and Angular/React.',
    package_details: '₹5.00 LPA – ₹9.50 LPA',
    roles_offered: ['Java Software Engineer', 'Spring Boot Backend Trainee', 'Full Stack Developer'],
    skills_required: ['Java 17+', 'Spring Boot & Spring Cloud', 'Hibernate / JPA', 'MySQL / Oracle', 'Angular or React'],
    job_description: 'Enterprise client consortium hiring Java developers for banking, telecom, and healthcare digital transformation initiatives across India.',
    responsibilities: [
      'Develop scalable microservices with Spring Boot and resilient REST endpoints.',
      'Implement secure authentication mechanisms using JWT and OAuth2.',
      'Tune database queries and database schema migrations.',
    ],
    selection_process: [
      'Round 1: Core Java & Aptitude Assessment',
      'Round 2: Technical Interview (OOPs, Collections, Multi-threading, Spring)',
      'Round 3: Managerial & HR Discussion',
    ],
    work_location: 'Pune / Bengaluru / Hybrid',
    bond_info: 'No Service Bond',
    start_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 22 * 86400000).toISOString(),
    event_date: '2026-12-10T09:30:00Z',
    event_location: 'Campus Center, Pune & Virtual',
    capacity: 200,
    registration_count: 29,
    eligibility_rules: {
      accepted_degrees: ['BE / BTech', 'MCA', 'MSc'],
      accepted_passing_years: ['2024', '2025', '2026'],
      min_cgpa: '6.5',
    },
    is_active: true,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000007',
    name: 'Techmiya Career and Internship Drive',
    organizer: 'Techmiya EdTech',
    description: 'Multi-disciplinary hiring for interns, freshers, business analysts, QA engineers, and operations associates.',
    package_details: '₹3.50 LPA – ₹7.00 LPA (Internship: ₹18,000/month)',
    roles_offered: ['Technical Associate', 'QA & Automation Trainee', 'Business Technology Analyst', 'Cloud Support Associate'],
    skills_required: ['Basic Programming & Logic', 'Manual & Automation QA Concepts', 'SQL Fundamentals', 'Communication & Teamwork'],
    job_description: 'Open multi-disciplinary recruitment initiative designed for enthusiastic fresh graduates and final-year students looking to kickstart their technology career.',
    responsibilities: [
      'Participate in product testing, quality assurance, and automated regression suites.',
      'Assist senior consultants in documenting business workflows and user stories.',
      'Provide technical support, operational monitoring, and ticket triage.',
    ],
    selection_process: [
      'Round 1: Aptitude, Logic & Basic Tech Test',
      'Round 2: Technical & Problem Solving Interview',
      'Round 3: HR & Communication Evaluation',
    ],
    work_location: 'Head Office, Bengaluru',
    bond_info: 'No Service Bond',
    start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 40 * 86400000).toISOString(),
    event_date: '2026-12-18T10:00:00Z',
    event_location: 'Grand Auditorium, Techmiya Head Office',
    capacity: 300,
    registration_count: 45,
    eligibility_rules: {
      accepted_degrees: [],
      accepted_passing_years: ['2024', '2025', '2026', '2027'],
      min_cgpa: null,
    },
    is_active: true,
  },
  */
];

function getLocalDrives() {
  try {
    const data = localStorage.getItem(STORAGE_DRIVES_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_DRIVES_KEY, JSON.stringify(SAMPLE_DRIVES));
      return SAMPLE_DRIVES;
    }
    const parsed = JSON.parse(data);
    // Merge new JD fields from SAMPLE_DRIVES into cached objects
    return parsed.map((d) => {
      const sample = SAMPLE_DRIVES.find((s) => s.id === d.id);
      return sample
        ? {
          ...d,
          ...sample,
          capacity: d.capacity || sample.capacity,
          registration_count: d.registration_count || 0,
        }
        : d;
    });
  } catch (e) {
    return SAMPLE_DRIVES;
  }
}

function saveLocalDrives(drives) {
  try {
    localStorage.setItem(STORAGE_DRIVES_KEY, JSON.stringify(drives));
  } catch (e) {
    console.error('Failed to save drives to localStorage:', e);
  }
}

/**
 * Fetch all active drives whose registration windows are currently open
 */
export async function getActiveDrives() {
  if (isSupabaseConfigured()) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('drives')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('event_date', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local drives:', err);
    }
  }

  // Local fallback: filter active and open drives
  const now = new Date();
  return getLocalDrives().filter((d) => {
    const isAct = d.is_active;
    const isStart = new Date(d.start_date) <= now;
    const isEnd = new Date(d.end_date) >= now;
    const hasCapacity = (d.registration_count || 0) < d.capacity;
    return isAct && isStart && isEnd && hasCapacity;
  });
}

/**
 * Fetch all drives (including inactive/past) for Admin Dashboard
 */
export async function getAllDrivesForAdmin() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('drives')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('Admin drives fetch failed:', err);
    }
  }

  return getLocalDrives();
}

/**
 * Fetch a single drive by ID
 */
export async function getDriveById(id) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('drives')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('Drive lookup failed in Supabase, trying local:', err);
    }
  }

  const drives = getLocalDrives();
  return drives.find((d) => d.id === id) || null;
}

/**
 * Create a new drive (Admin)
 */
export async function createDrive(driveData) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('drives')
        .insert([driveData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Failed to insert drive in Supabase, using local:', err);
    }
  }

  const drives = getLocalDrives();
  const newDrive = {
    id: `d-${Date.now()}`,
    registration_count: 0,
    created_at: new Date().toISOString(),
    ...driveData,
  };
  drives.unshift(newDrive);
  saveLocalDrives(drives);
  return newDrive;
}

/**
 * Update a drive (Admin)
 */
export async function updateDrive(id, driveData) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('drives')
        .update(driveData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Update drive in Supabase failed, using local:', err);
    }
  }

  const drives = getLocalDrives();
  const idx = drives.findIndex((d) => d.id === id);
  if (idx >= 0) {
    drives[idx] = { ...drives[idx], ...driveData, updated_at: new Date().toISOString() };
    saveLocalDrives(drives);
    return drives[idx];
  }
  throw new Error('Drive not found');
}
