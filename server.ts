import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  User, Branch, Course, Lesson, Enrollment, Assignment, 
  Submission, Transaction, Finance, SystemSettings 
} from "./src/types";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_store.json");

// Helper to load settings blank certificate
const DEFAULT_CERT_BG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="%23fcfbfa"/>
  <!-- Elegant Islamic/Arabic border -->
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="%2310B981" stroke-width="4"/>
  <rect x="35" y="35" width="730" height="530" fill="none" stroke="%23FBBF24" stroke-width="2"/>
  
  <!-- Corner Ornaments -->
  <path d="M 25 65 L 65 25 M 25 105 L 105 25 M 25 145 L 145 25" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 775 65 L 735 25 M 775 105 L 695 25 M 775 145 L 655 25" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 25 535 L 65 575 M 25 495 L 105 575 M 25 455 L 145 575" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 775 535 L 735 575 M 775 495 L 695 575 M 775 455 L 655 575" stroke="%2310B981" stroke-width="1.5" fill="none" />
  
  <!-- Banner Top -->
  <path d="M 300 35 L 500 35 L 480 80 L 320 80 Z" fill="%2310B981"/>
  <text x="400" y="62" font-family="'Inter', sans-serif" font-weight="bold" font-size="16" fill="%23ffffff" text-anchor="middle">BAIT KHAT</text>
  
  <text x="400" y="160" font-family="'Inter', sans-serif" font-weight="bold" font-size="32" fill="%231F2937" text-anchor="middle">SERTIFIKAT KELULUSAN</text>
  <text x="400" y="195" font-family="'Inter', sans-serif" font-size="14" fill="%236B7280" text-anchor="middle" letter-spacing="1">Diberikan secara resmi kepada alumnus sekolah kaligrafi:</text>
  
  <!-- Outer Frame Decors -->
  <circle cx="400" cy="505" r="30" fill="none" stroke="%23FBBF24" stroke-width="2"/>
  <path d="M 385 505 L 415 505 M 400 490 L 400 520" stroke="%2310B981" stroke-width="2"/>
  
  <text x="400" y="460" font-family="'Inter', sans-serif" font-size="13" fill="%239CA3AF" text-anchor="middle">Direktur Utama Bait Khat, Jakarta, Indonesia</text>
</svg>`;

// Default Initial Seed Data
const INITIAL_DB = {
  users: [
    { id: "u-sa1", name: "Irfan Hakim (Super Admin)", email: "admin@baitkhat.com", phone_number: "081234567890", role: "super_admin", branch_id: null },
    { id: "u-ac1", name: "Fathur (Branch Admin - Bandung)", email: "fathur.bdg@baitkhat.com", phone_number: "081987654321", role: "admin_cabang", branch_id: "b-1" },
    { id: "u-t1", name: "Ust. Ahmad Naufal (Tutor Naskhi)", email: "ahmad@baitkhat.com", phone_number: "08111222333", role: "tutor", branch_id: null },
    { id: "u-t2", name: "Ust. Syarifuddin (Tutor Thuluth)", email: "syarif@baitkhat.com", phone_number: "08222333444", role: "tutor", branch_id: null },
    { id: "u-s1", name: "Fikri Arkan", email: "fikri@study.com", phone_number: "08555666777", role: "siswa", branch_id: "b-1" },
    { id: "u-s2", name: "Indra Lesmana", email: "indra@study.com", phone_number: "08777888999", role: "siswa", branch_id: "b-1" }
  ] as User[],
  
  branches: [
    { id: "b-1", name: "Cabang Bandung Pusat", address: "Jl. Dago No. 104, Kota Bandung" },
    { id: "b-2", name: "Cabang Jakarta Timur", address: "Jl. Kalimalang Raya No. 15, Jakarta Timur" }
  ] as Branch[],
  
  courses: [
    { id: "c-1", title: "Kelas Khat Naskhi Online", description: "Mempelajari dasar-dasar penulisan Kaligrafi Naskhi secara terstruktur, dari ukuran titik pena, kemiringan kalam, hingga sambungan ayat utuh.", type: "online_lms", price: 350000, thumbnail_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=300&q=80", is_published: true },
    { id: "c-2", title: "Sains Thuluth Jamil (Premium)", description: "Kelas luksus mendalami seni kaligrafi Thuluth, aliran paling anggun untuk dekorasi masjid dan ornamen arsitektur.", type: "online_lms", price: 650000, thumbnail_url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=300&q=80", is_published: true },
    { id: "c-3", title: "Lomba Khat Cabang Bandung 2026", description: "Event Lomba Kaligrafi antar provinsi untuk mengasah keahlian para murid dan seniman se-Indonesia.", type: "lomba_event", price: 100000, thumbnail_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=300&q=80", is_published: true }
  ] as Course[],
  
  lessons: [
    { id: "l-1", course_id: "c-1", title: "Pengenalan Kalam, Kertas Licin & Tinta", type: "video", content: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_number: 1 },
    { id: "l-2", course_id: "c-1", title: "Kaidah Huruf Mufradah (Alif s/d Dal) & Titik Ukuran", type: "video", content: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_number: 2 },
    { id: "l-3", course_id: "c-1", title: "Tugas Mandiri 1: Penulisan Huruf Tunggal", type: "text", content: "Petunjuk: Buat coretan 5 kali untuk masing-masing huruf Alif, Ba, Ta, Tsa dengan ukuran 5 titik pena.", order_number: 3 },
    { id: "l-4", course_id: "c-1", title: "Ujian Akhir Kaligrafi Naskhi Ayat Pendek", type: "pdf", content: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", order_number: 4 },
    
    { id: "l-5", course_id: "c-2", title: "Proporsi Khusus Khat Thuluth", type: "video", content: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_number: 1 }
  ] as Lesson[],
  
  assignments: [
    { id: "a-1", lesson_id: "l-3", title: "Tugas Huruf Alif & Ba Beraturan", instruction_text: "Unggah tulisan tangan Anda menggunakan Kalam Handam/Bambu berukuran 2mm dengan tinta hitam di atas Kertas Art Paper licin. Resolusi tinggi tanpa distorsi bayangan.", is_exam: false },
    { id: "a-2", lesson_id: "l-4", title: "Ujian Mandiri Khat Naskhi - QS Al-Qalam 1-2", instruction_text: "Tuliskan ayat 'Nun. Wal-qalami wa ma yasthurun' dengan kaidah Naskhi sempurna. Hasil akhir dinilai mutlak oleh Tutor Penanggungjawab.", is_exam: true }
  ] as Assignment[],
  
  enrollments: [
    { id: "e-1", course_id: "c-1", student_id: "u-s1", tutor_id: "u-t1", status: "active" }, // Fikri is active under Ahmad
    { id: "e-2", course_id: "c-1", student_id: "u-s2", tutor_id: null, status: "pending" } // Indra is pending tutor allocation
  ] as Enrollment[],
  
  submissions: [
    { 
      id: "s-1", 
      assignment_id: "a-1", 
      student_id: "u-s1", 
      submitted_file_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=90", // Mock elegant calligraphy image
      status: "graded", 
      grade: 88, 
      feedback_file_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=90", 
      feedback_notes: "Sangat bagus, namun perhatikan kepala huruf Ba agar melengkung alami sekitar 1.5 titik pena. Bagian ekor sudah proporsional." 
    }
  ] as Submission[],
  
  transactions: [
    { id: "t-1", user_id: "u-s1", course_id: "c-1", amount: 350000, payment_type: "manual", status: "paid", proof_url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80", midtrans_snap_token: null },
    { id: "t-2", user_id: "u-s2", course_id: "c-1", amount: 350000, payment_type: "midtrans", status: "pending_verification", proof_url: null, midtrans_snap_token: "mock-snap-token-123" }
  ] as Transaction[],
  
  finances: [
    { id: "f-1", branch_id: "b-1", type: "income", amount: 350000, description: "Pendaftaran Kelas Khat Naskhi Online - Fikri Arkan", transaction_date: "2026-06-18T10:00:00.000Z" },
    { id: "f-2", branch_id: "b-1", type: "expense", amount: 120000, description: "Pembelian Kertas Art Paper & Kalam Handam Cabang", transaction_date: "2026-06-19T14:30:00.000Z" },
    { id: "f-3", branch_id: "b-1", type: "payroll", amount: 150000, description: "Gaji Tutor Ust. Ahmad Naufal - Pengajaran Fikri Arkan", transaction_date: "2026-06-20T08:00:00.000Z" }
  ] as Finance[],
  
  settings: {
    payment_gateway_active: false,
    certificate_template_url: DEFAULT_CERT_BG,
    cert_coord_name: { x: 400, y: 250, font_size: 26, font_color: "#1F2937" },
    cert_coord_course: { x: 400, y: 320, font_size: 20, font_color: "#10B981" },
    cert_coord_date: { x: 400, y: 380, font_size: 14, font_color: "#4B5563" }
  } as SystemSettings
};

// Ensure DB loaded
function loadDB(): typeof INITIAL_DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading JSON database, using seed", e);
  }
  // Store seeds
  saveDB(INITIAL_DB);
  return INITIAL_DB;
}

function saveDB(data: typeof INITIAL_DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving to database file:", e);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" })); // high resolution upload sizes allowed losslessly

  // Standard API Routes
  app.get("/api/db", (req, res) => {
    res.json(loadDB());
  });

  app.post("/api/reset", (req, res) => {
    saveDB(INITIAL_DB);
    res.json({ success: true, db: INITIAL_DB });
  });

  // User Actions (Create, Delete)
  app.post("/api/users", (req, res) => {
    const db = loadDB();
    const { action, user } = req.body;
    if (action === "create") {
      const newUser = { id: `u-${Date.now()}`, ...user };
      db.users.push(newUser);
      saveDB(db);
      return res.json({ success: true, user: newUser });
    }
    if (action === "delete") {
      db.users = db.users.filter(u => u.id !== user.id);
      saveDB(db);
      return res.json({ success: true });
    }
    res.status(400).json({ error: "Invalid action" });
  });

  // Course management
  app.post("/api/courses", (req, res) => {
    const db = loadDB();
    const { action, course } = req.body;
    if (action === "create") {
      const newCourse = { id: `c-${Date.now()}`, is_published: true, ...course };
      db.courses.push(newCourse);
      saveDB(db);
      return res.json({ success: true, course: newCourse });
    }
    res.status(400).json({ error: "Invalid action" });
  });

  // Lesson management
  app.post("/api/lessons", (req, res) => {
    const db = loadDB();
    const { action, lesson } = req.body;
    if (action === "create") {
      const newLesson = { id: `l-${Date.now()}`, ...lesson, order_number: db.lessons.filter(l => l.course_id === lesson.course_id).length + 1 };
      db.lessons.push(newLesson);
      saveDB(db);
      return res.json({ success: true, lesson: newLesson });
    }
    res.status(400).json({ error: "Invalid action" });
  });

  // Assignment management
  app.post("/api/assignments", (req, res) => {
    const db = loadDB();
    const { action, assignment } = req.body;
    if (action === "create") {
      const newAssignment = { id: `a-${Date.now()}`, ...assignment };
      db.assignments.push(newAssignment);
      saveDB(db);
      return res.json({ success: true, assignment: newAssignment });
    }
    res.status(400).json({ error: "Invalid" });
  });

  // Enrollment (Siswa register + checkout)
  app.post("/api/enroll", (req, res) => {
    const db = loadDB();
    const { student_id, course_id, payment_type, proof_url } = req.body;
    
    const course = db.courses.find(c => c.id === course_id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // 1. Create transaction record
    const transactionId = `t-${Date.now()}`;
    const newTransaction: Transaction = {
      id: transactionId,
      user_id: student_id,
      course_id: course_id,
      amount: course.price,
      payment_type: payment_type,
      status: payment_type === 'midtrans' && db.settings.payment_gateway_active ? 'paid' : 'pending_verification',
      proof_url: proof_url || null,
      midtrans_snap_token: payment_type === 'midtrans' ? `snap-${Date.now()}` : null
    };
    db.transactions.push(newTransaction);

    // 2. Create Enrollment record
    const enrollmentId = `e-${Date.now()}`;
    const newEnrollment: Enrollment = {
      id: enrollmentId,
      course_id: course_id,
      student_id: student_id,
      tutor_id: null, // Initially null, waiting super admin routing allocation
      status: newTransaction.status === 'paid' ? 'active' : 'pending'
    };
    db.enrollments.push(newEnrollment);

    // 3. If paid automatically (Midtrans scenario) -> record center finance income
    if (newTransaction.status === 'paid') {
      db.finances.push({
        id: `f-${Date.now()}`,
        branch_id: "b-1", // default branch
        type: "income",
        amount: course.price,
        description: `Pendaftaran Otomatis: ${course.title}`,
        transaction_date: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, transaction: newTransaction, enrollment: newEnrollment });
  });

  // Super Admin / Cabang Admin: Assign Tutor (Routing)
  app.post("/api/assign-tutor", (req, res) => {
    const db = loadDB();
    const { enrollment_id, tutor_id } = req.body;
    const enrollment = db.enrollments.find(e => e.id === enrollment_id);
    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });

    enrollment.tutor_id = tutor_id;
    // Set status of enrollment to active once tutor is assigned (in case they were pending)
    enrollment.status = "active";
    
    // Auto calculate payroll entry simulator for Tutor on route allocation
    const tutor = db.users.find(u => u.id === tutor_id);
    const course = db.courses.find(c => c.id === enrollment.course_id);
    if (tutor && course) {
      // 40% of the course price is allocated as payroll to the tutor
      const payrollAmount = Math.round(course.price * 0.43); 
      db.finances.push({
        id: `f-${Date.now()}`,
        branch_id: "b-1",
        type: "payroll",
        amount: payrollAmount,
        description: `Penggajian Tutor: ${tutor.name} untuk mhs ${enrollment_id}`,
        transaction_date: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, enrollment });
  });

  // Verify Manual payment by Admin
  app.post("/api/verify-payment", (req, res) => {
    const db = loadDB();
    const { transaction_id } = req.body;
    const transaction = db.transactions.find(t => t.id === transaction_id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "paid";

    // Set matching enrollment to active
    const enrollment = db.enrollments.find(e => e.course_id === transaction.course_id && e.student_id === transaction.user_id);
    if (enrollment) {
      enrollment.status = "active";
    }

    // Record into Finances Ledger
    const course = db.courses.find(c => c.id === transaction.course_id);
    db.finances.push({
      id: `f-${Date.now()}`,
      branch_id: "b-1",
      type: "income",
      amount: transaction.amount,
      description: `Verifikasi Penjualan: ${course ? course.title : "Program"}`,
      transaction_date: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, transaction, enrollment });
  });

  // Siswa Submit Assignment
  app.post("/api/submit-assignment", (req, res) => {
    const db = loadDB();
    const { assignment_id, student_id, submitted_file_url } = req.body;

    // Check if submission already exists
    let submission = db.submissions.find(s => s.assignment_id === assignment_id && s.student_id === student_id);
    if (submission) {
      submission.submitted_file_url = submitted_file_url;
      submission.status = "submitted";
      submission.grade = null;
      submission.feedback_file_url = null;
      submission.feedback_notes = null;
    } else {
      submission = {
        id: `s-${Date.now()}`,
        assignment_id,
        student_id,
        submitted_file_url,
        status: "submitted",
        grade: null,
        feedback_file_url: null,
        feedback_notes: null
      };
      db.submissions.push(submission);
    }

    saveDB(db);
    res.json({ success: true, submission });
  });

  // Tutor Grade Submission (Annotate feedback image)
  app.post("/api/grade-submission", (req, res) => {
    const db = loadDB();
    const { submission_id, grade, feedback_notes, feedback_file_url } = req.body;

    const submission = db.submissions.find(s => s.id === submission_id);
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    submission.grade = Number(grade);
    submission.feedback_notes = feedback_notes;
    submission.feedback_file_url = feedback_file_url || null;
    submission.status = grade >= 75 ? "graded" : "revised"; // Under 75 needs revision

    // If this is an exam and passed, check if they completed the full course (all assignments graded)
    saveDB(db);
    res.json({ success: true, submission });
  });

  // System Settings edit (Midtrans toggles OR Certificate templates)
  app.post("/api/update-settings", (req, res) => {
    const db = loadDB();
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // Finance addition (Manual expense, etc.)
  app.post("/api/add-finance", (req, res) => {
    const db = loadDB();
    const newFinance: Finance = {
      id: `f-${Date.now()}`,
      branch_id: req.body.branch_id || "b-1",
      type: req.body.type,
      amount: Number(req.body.amount),
      description: req.body.description,
      transaction_date: new Date().toISOString()
    };
    db.finances.push(newFinance);
    saveDB(db);
    res.json({ success: true, finance: newFinance });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
