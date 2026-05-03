// src/data/masterData.js
// ─────────────────────────────────────────────────────────────────────────────
// MASTER DATA FILE
// Add new colleges / degrees / courses here whenever needed.
// ─────────────────────────────────────────────────────────────────────────────

// ── AFFILIATED COLLEGES under Pondicherry University ─────────────────────────
// Add more entries at the bottom of this array as needed.
export const COLLEGES = [
  // ── Pondicherry University itself ──
  "Pondicherry University (Main Campus)",

  // ── Engineering & Technology ──────
  "Manakula Vinayagar Institute of Technology",
  "Pondicherry Engineering College",
  "Sri Manakula Vinayagar Engineering College",
  "Rajiv Gandhi College of Engineering & Technology",
  "Achariya College of Engineering Technology",
  "Sri Aravindar Engineering College",
  "Indira Institute of Engineering & Technology",
  "New Prince Shri Bhavani College of Engineering & Technology",

  // ── Arts & Science ─────────────────
  "Tagore Arts College",
  "Achariya Arts & Science College",
  "Sri Aurobindo College of Arts & Commerce",
  "Sacred Heart College",
  "Kanchi Mamunivar Government Institute for Postgraduate Studies & Research",

  // ── Management & Commerce ──────────
  "Pondicherry Institute of Medical Sciences",
  "Sri Venkateswara College of Education",
  "Annai Viollet Arts & Science College",

  // ── Add more below ─────────────────
  // "Your College Name Here",
];

// ── DEGREE TYPES (full formal name) ──────────────────────────────────────────
// These appear on the certificate in full form.
// Add more entries as needed.
export const DEGREE_TYPES = [
  // Undergraduate
  { value: "Bachelor of Technology",                label: "Bachelor of Technology (B.Tech)" },
  { value: "Bachelor of Engineering",               label: "Bachelor of Engineering (B.E)" },
  { value: "Bachelor of Science",                   label: "Bachelor of Science (B.Sc)" },
  { value: "Bachelor of Arts",                      label: "Bachelor of Arts (B.A)" },
  { value: "Bachelor of Commerce",                  label: "Bachelor of Commerce (B.Com)" },
  { value: "Bachelor of Computer Applications",     label: "Bachelor of Computer Applications (BCA)" },
  { value: "Bachelor of Business Administration",   label: "Bachelor of Business Administration (BBA)" },
  { value: "Bachelor of Education",                 label: "Bachelor of Education (B.Ed)" },

  // Postgraduate
  { value: "Master of Technology",                  label: "Master of Technology (M.Tech)" },
  { value: "Master of Engineering",                 label: "Master of Engineering (M.E)" },
  { value: "Master of Science",                     label: "Master of Science (M.Sc)" },
  { value: "Master of Arts",                        label: "Master of Arts (M.A)" },
  { value: "Master of Commerce",                    label: "Master of Commerce (M.Com)" },
  { value: "Master of Computer Applications",       label: "Master of Computer Applications (MCA)" },
  { value: "Master of Business Administration",     label: "Master of Business Administration (MBA)" },
  { value: "Master of Education",                   label: "Master of Education (M.Ed)" },
  { value: "Master of Philosophy",                  label: "Master of Philosophy (M.Phil)" },

  // Doctoral
  { value: "Doctor of Philosophy",                  label: "Doctor of Philosophy (Ph.D)" },

  // Add more below ──
  // { value: "Bachelor of Fine Arts", label: "Bachelor of Fine Arts (BFA)" },
];

// ── COURSES — keyed by degree type ───────────────────────────────────────────
// When user selects a degree, only relevant courses appear.
// Add more courses inside each array, or add a new degree key.
export const COURSES_BY_DEGREE = {
  "Bachelor of Technology": [
    "Information Technology",
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Automobile Engineering",
    "Aeronautical Engineering",
    "Biomedical Engineering",
    "Chemical Engineering",
    // Add more B.Tech courses here
  ],
  "Bachelor of Engineering": [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    // Add more B.E courses here
  ],
  "Bachelor of Science": [
    "Computer Science",
    "Information Technology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Biotechnology",
    "Statistics",
    "Electronics",
    "Nursing",
    // Add more B.Sc courses here
  ],
  "Bachelor of Arts": [
    "English Literature",
    "Tamil Literature",
    "History",
    "Economics",
    "Political Science",
    "Sociology",
    "Psychology",
    "Geography",
    // Add more B.A courses here
  ],
  "Bachelor of Commerce": [
    "General",
    "Computer Applications",
    "Accounting & Finance",
    "Banking & Insurance",
    "Professional Accounting",
    // Add more B.Com courses here
  ],
  "Bachelor of Computer Applications": [
    "Computer Applications",
    // Add more BCA specialisations here
  ],
  "Bachelor of Business Administration": [
    "General Management",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    // Add more BBA courses here
  ],
  "Bachelor of Education": [
    "General",
    "Physical Education",
    "Special Education",
    // Add more B.Ed courses here
  ],
  "Master of Technology": [
    "Information Technology",
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Embedded Systems",
    "VLSI Design",
    "Power Electronics",
    "Structural Engineering",
    "Thermal Engineering",
    // Add more M.Tech courses here
  ],
  "Master of Engineering": [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    // Add more M.E courses here
  ],
  "Master of Science": [
    "Computer Science",
    "Information Technology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biotechnology",
    "Data Science",
    "Cyber Security",
    // Add more M.Sc courses here
  ],
  "Master of Arts": [
    "English Literature",
    "Tamil Literature",
    "History",
    "Economics",
    "Political Science",
    "Sociology",
    "Psychology",
    // Add more M.A courses here
  ],
  "Master of Commerce": [
    "General",
    "Accounting & Finance",
    "Banking & Insurance",
    // Add more M.Com courses here
  ],
  "Master of Computer Applications": [
    "Computer Applications",
    // Add more MCA specialisations here
  ],
  "Master of Business Administration": [
    "General Management",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Operations Management",
    "Information Technology",
    // Add more MBA courses here
  ],
  "Master of Education": [
    "General",
    "Physical Education",
    // Add more M.Ed courses here
  ],
  "Master of Philosophy": [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Economics",
    "English",
    // Add more M.Phil courses here
  ],
  "Doctor of Philosophy": [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Management Studies",
    "Economics",
    "English",
    // Add more Ph.D specialisations here
  ],
};

// ── ROLE-BASED ACCESS ─────────────────────────────────────────────────────────
// Change ADMIN_SECRET_KEY to any secret you want.
// Keep this file server-side in production; this is for demo purposes.
export const ADMIN_SECRET_KEY = "MVIT@Admin";

// ── THEME ──────────────────────────────────────────────────────────────────────
export const DEFAULT_THEME = "light"; // "light" or "dark"

// ── PROJECT INFO & TEAM ────────────────────────────────────────────────────────
export const PROJECT_INFO = {
  title:       "Blockchain Based Verification for University Certificates",
  subtitle:    "Leveraging QR Codes and DApps for Enhanced Credibility",
  department:  "Department of Information Technology",
  institution: "Manakula Vinayagar Institute of Technology",
  affiliated:  "Affiliated to Pondicherry University",
  year:        "2025",

  guide: {
    name:        "Dr. P. Sivakumar",
    designation: "Professor & Head",
    dept:        "Department of Information Technology",
  },

  // ── Add or remove team members here ────────────────────────────────────────
  team: [
    { name: "Adhitya B",       regNo: "22TH0204" },
    { name: "Harish D",        regNo: "22TH0230" },
    { name: "Hubert Joseva C", regNo: "22TH0233" },
    { name: "Navvin Kkumar E", regNo: "22TH0269" },
  ],
};
