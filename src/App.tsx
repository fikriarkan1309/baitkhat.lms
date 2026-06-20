import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Wallet, Award, Monitor, Navigation, Upload, 
  Check, AlertCircle, Send, Plus, RefreshCw, FileText, Image as ImageIcon, 
  Settings as SettingsIcon, Play, ExternalLink, Calendar, Search, Trash2, 
  Sparkles, DollarSign, ArrowUpRight, ArrowDownRight, UserCheck, ShieldAlert,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import CanvasAnnotator from './components/CanvasAnnotator';
import CertificateDownloader from './components/CertificateDownloader';
import { 
  User, Branch, Course, Lesson, Enrollment, Assignment, 
  Submission, Transaction, Finance, SystemSettings, UserRole 
} from './types';

// Preset sample high-res kaligrafi artwork for simulation upload
const PREMIUM_KHAT_SAMPLES = [
  { name: "[SAMPEL 1] Diwani Jali - Bismillah", url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80" },
  { name: "[SAMPEL 2] Thuluth Al-Ikhlas", url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=600&q=80" },
  { name: "[SAMPEL 3] Naskhi Ayat Kursi", url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" }
];

export default function App() {
  // Session switching
  const [currentUser, setCurrentUser] = useState<User>({
    id: "u-sa1",
    name: "Irfan Hakim (Super Admin)",
    email: "admin@baitkhat.com",
    phone_number: "081234567890",
    role: "super_admin",
    branch_id: null
  });

  // DB State matching server loaded dynamically
  const [db, setDb] = useState<{
    users: User[];
    branches: Branch[];
    courses: Course[];
    lessons: Lesson[];
    assignments: Assignment[];
    enrollments: Enrollment[];
    submissions: Submission[];
    transactions: Transaction[];
    finances: Finance[];
    settings: SystemSettings;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tabs for layout per role
  const [adminTab, setAdminTab] = useState<'alokasi' | 'keuangan' | 'sertifikat' | 'kurikulum'>('alokasi');
  const [tutorTab, setTutorTab] = useState<'beranda' | 'koreksi'>('beranda');
  const [siswaTab, setSiswaTab] = useState<'belajar' | 'transaksi'>('belajar');

  // Input states
  const [activeCourseId, setActiveCourseId] = useState<string>("c-1");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // High-res manual upload simulator state
  const [simulatedFileUrl, setSimulatedFileUrl] = useState<string>(PREMIUM_KHAT_SAMPLES[0].url);
  const [manualFileInput, setManualFileInput] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // New Course/Lesson Form states
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCoursePrice, setNewCoursePrice] = useState(250000);
  const [newCourseType, setNewCourseType] = useState<'reguler_offline' | 'online_lms' | 'lomba_event'>('online_lms');
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<'video' | 'audio' | 'text' | 'pdf' | 'link'>('video');
  const [newLessonContent, setNewLessonContent] = useState("");

  // Dynamic Finance Addition states
  const [finAmount, setFinAmount] = useState<number>(50000);
  const [finType, setFinType] = useState<'income' | 'expense' | 'payroll'>('expense');
  const [finDesc, setFinDesc] = useState("");
  const [finBranch, setFinBranch] = useState("b-1");

  // Interactive annotation canvas target
  const [correctionTarget, setCorrectionTarget] = useState<Submission | null>(null);
  const [tutorGrade, setTutorGrade] = useState<number>(85);
  const [tutorFeedback, setTutorFeedback] = useState<string>("");

  // Admin Custom Coordinates Mapping States
  const [certNameX, setCertNameX] = useState(400);
  const [certNameY, setCertNameY] = useState(240);
  const [certNameSize, setCertNameSize] = useState(28);
  const [certNameColor, setCertNameColor] = useState("#1F2937");

  const [certCourseX, setCertCourseX] = useState(400);
  const [certCourseY, setCertCourseY] = useState(330);
  const [certCourseSize, setCertCourseSize] = useState(20);
  const [certCourseColor, setCertCourseColor] = useState("#10B981");

  const [certDateX, setCertDateX] = useState(400);
  const [certDateY, setCertDateY] = useState(390);
  const [certDateSize, setCertDateSize] = useState(13);
  const [certDateColor, setCertDateColor] = useState("#4B5563");

  const [certBackground, setCertBackground] = useState<string>("");

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fallback / Offline simulation state
  const [offlineActive, setOfflineActive] = useState<boolean>(() => {
    return (
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("github.io") ||
      localStorage.getItem("bait_khat_offline_forced") === "true"
    );
  });

  const getLocalDb = () => {
    const saved = localStorage.getItem("bait_khat_fallback_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.users) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    const DEFAULT_CERT_BG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="%23fcfbfa"/>
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="%2310B981" stroke-width="4"/>
  <rect x="35" y="35" width="730" height="530" fill="none" stroke="%23FBBF24" stroke-width="2"/>
  <path d="M 25 65 L 65 25 M 25 105 L 105 25 M 25 145 L 145 25" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 775 65 L 735 25 M 775 105 L 695 25 M 775 145 L 655 25" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 25 535 L 65 575 M 25 495 L 105 575 M 25 455 L 145 575" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 775 535 L 735 575 M 775 495 L 695 575 M 775 455 L 655 575" stroke="%2310B981" stroke-width="1.5" fill="none" />
  <path d="M 300 35 L 500 35 L 480 80 L 320 80 Z" fill="%2310B981"/>
  <text x="400" y="62" font-family="'Inter', sans-serif" font-weight="bold" font-size="16" fill="%23ffffff" text-anchor="middle">BAIT KHAT</text>
  <text x="400" y="160" font-family="'Inter', sans-serif" font-weight="bold" font-size="32" fill="%231F2937" text-anchor="middle">SERTIFIKAT KELULUSAN</text>
  <text x="400" y="195" font-family="'Inter', sans-serif" font-size="14" fill="%236B7280" text-anchor="middle" letter-spacing="1">Diberikan secara resmi kepada alumnus sekolah kaligrafi:</text>
  <circle cx="400" cy="505" r="30" fill="none" stroke="%23FBBF24" stroke-width="2"/>
  <path d="M 385 505 L 415 505 M 400 490 L 400 520" stroke="%2310B981" stroke-width="2"/>
  <text x="400" y="460" font-family="'Inter', sans-serif" font-size="13" fill="%239CA3AF" text-anchor="middle">Direktur Utama Bait Khat, Jakarta, Indonesia</text>
</svg>`;
    const seeds = {
      users: [
        { id: "u-sa1", name: "Irfan Hakim (Super Admin)", email: "admin@baitkhat.com", phone_number: "081234567890", role: "super_admin" as UserRole, branch_id: null },
        { id: "u-ac1", name: "Fathur (Branch Admin - Bandung)", email: "fathur.bdg@baitkhat.com", phone_number: "081987654321", role: "admin_cabang" as UserRole, branch_id: "b-1" },
        { id: "u-t1", name: "Ust. Ahmad Naufal (Tutor Naskhi)", email: "ahmad@baitkhat.com", phone_number: "08111222333", role: "tutor" as UserRole, branch_id: null },
        { id: "u-t2", name: "Ust. Syarifuddin (Tutor Thuluth)", email: "syarif@baitkhat.com", phone_number: "08222333444", role: "tutor" as UserRole, branch_id: null },
        { id: "u-s1", name: "Fikri Arkan", email: "fikri@study.com", phone_number: "08555666777", role: "siswa" as UserRole, branch_id: "b-1" },
        { id: "u-s2", name: "Indra Lesmana", email: "indra@study.com", phone_number: "08777888999", role: "siswa" as UserRole, branch_id: "b-1" }
      ],
      branches: [
        { id: "b-1", name: "Cabang Bandung Pusat", address: "Jl. Dago No. 104, Kota Bandung" },
        { id: "b-2", name: "Cabang Jakarta Timur", address: "Jl. Kalimalang Raya No. 15, Jakarta Timur" }
      ],
      courses: [
        { id: "c-1", title: "Kelas Khat Naskhi Online", description: "Mempelajari dasar-dasar penulisan Kaligrafi Naskhi secara terstruktur, dari ukuran titik pena, kemiringan kalam, hingga sambungan ayat utuh.", type: "online_lms" as any, price: 350000, thumbnail_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=300&q=80", is_published: true },
        { id: "c-2", title: "Sains Thuluth Jamil (Premium)", description: "Kelas luksus mendalami seni kaligrafi Thuluth, aliran paling anggun untuk dekorasi masjid dan ornamen arsitektur.", type: "online_lms" as any, price: 650000, thumbnail_url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=300&q=80", is_published: true },
        { id: "c-3", title: "Lomba Khat Cabang Bandung 2026", description: "Event Lomba Kaligrafi antar provinsi untuk mengasah keahlian para murid dan seniman se-Indonesia.", type: "lomba_event" as any, price: 100000, thumbnail_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=300&q=80", is_published: true }
      ],
      lessons: [
        { id: "l-1", course_id: "c-1", title: "Pengenalan Kalam, Kertas Licin & Tinta", type: "video" as any, content: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_number: 1 },
        { id: "l-2", course_id: "c-1", title: "Kaidah Huruf Mufradah (Alif s/d Dal) & Titik Ukuran", type: "video" as any, content: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_number: 2 },
        { id: "l-3", course_id: "c-1", title: "Tugas Mandiri 1: Penulisan Huruf Tunggal", type: "text" as any, content: "Petunjuk: Buat coretan 5 kali untuk masing-masing huruf Alif, Ba, Ta, Tsa dengan ukuran 5 titik pena.", order_number: 3 },
        { id: "l-4", course_id: "c-1", title: "Ujian Akhir Kaligrafi Naskhi Ayat Pendek", type: "pdf" as any, content: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", order_number: 4 },
        { id: "l-5", course_id: "c-2", title: "Proporsi Khusus Khat Thuluth", type: "video" as any, content: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_number: 1 }
      ],
      assignments: [
        { id: "a-1", lesson_id: "l-3", title: "Tugas Huruf Alif & Ba Beraturan", instruction_text: "Unggah tulisan tangan Anda menggunakan Kalam Handam/Bambu berukuran 2mm dengan tinta hitam di atas Kertas Art Paper licin. Resolusi tinggi tanpa distorsi bayangan.", is_exam: false },
        { id: "a-2", lesson_id: "l-4", title: "Ujian Mandiri Khat Naskhi - QS Al-Qalam 1-2", instruction_text: "Tuliskan ayat 'Nun. Wal-qalami wa ma yasthurun' dengan kaidah Naskhi sempurna. Hasil akhir dinilai mutlak oleh Tutor Penanggungjawab.", is_exam: true }
      ],
      enrollments: [
        { id: "e-1", course_id: "c-1", student_id: "u-s1", tutor_id: "u-t1", status: "active" as any },
        { id: "e-2", course_id: "c-1", student_id: "u-s2", tutor_id: null, status: "pending" as any }
      ],
      submissions: [
        { 
          id: "s-1", 
          assignment_id: "a-1", 
          student_id: "u-s1", 
          submitted_file_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=90",
          status: "graded" as any, 
          grade: 88, 
          feedback_file_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=90", 
          feedback_notes: "Sangat bagus, namun perhatikan kepala huruf Ba agar melengkung alami sekitar 1.5 titik pena. Bagian ekor sudah proporsional." 
        }
      ],
      transactions: [
        { id: "t-1", user_id: "u-s1", course_id: "c-1", amount: 350000, payment_type: "manual", status: "paid" as any, proof_url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80", midtrans_snap_token: null },
        { id: "t-2", user_id: "u-s2", course_id: "c-1", amount: 350000, payment_type: "midtrans", status: "pending_verification" as any, proof_url: null, midtrans_snap_token: "mock-snap-token-123" }
      ],
      finances: [
        { id: "f-1", branch_id: "b-1", type: "income" as any, amount: 350000, description: "Pendaftaran Kelas Khat Naskhi Online - Fikri Arkan", transaction_date: "2026-06-18T10:00:00.000Z" },
        { id: "f-2", branch_id: "b-1", type: "expense" as any, amount: 120000, description: "Pembelian Kertas Art Paper & Kalam Handam Cabang", transaction_date: "2026-06-19T14:30:00.000Z" },
        { id: "f-3", branch_id: "b-1", type: "payroll" as any, amount: 150000, description: "Gaji Tutor Ust. Ahmad Naufal - Pengajaran Fikri Arkan", transaction_date: "2026-06-20T08:00:00.000Z" }
      ],
      settings: {
        payment_gateway_active: false,
        certificate_template_url: DEFAULT_CERT_BG,
        cert_coord_name: { x: 400, y: 250, font_size: 26, font_color: "#1F2937" },
        cert_coord_course: { x: 400, y: 320, font_size: 20, font_color: "#10B981" },
        cert_coord_date: { x: 400, y: 380, font_size: 14, font_color: "#4B5563" }
      }
    };
    localStorage.setItem("bait_khat_fallback_db", JSON.stringify(seeds));
    return seeds;
  };

  const saveLocalDb = (data: any) => {
    localStorage.setItem("bait_khat_fallback_db", JSON.stringify(data));
  };

  // Lexically scoped fetch wrapper that intercepts API routes and provides local simulated routing on network / file issues
  const fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const isVercel = window.location.hostname.includes("vercel.app") || window.location.hostname.includes("github.io");
    
    const mockResponse = (data: any): Response => {
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => data,
        text: async () => JSON.stringify(data)
      } as any;
    };

    if (!isVercel && !offlineActive) {
      try {
        const res = await window.fetch(url, init);
        if (res.ok) {
          if (url === "/api/db") {
            const data = await res.clone().json();
            saveLocalDb(data);
          }
          return res;
        }
        if (res.status === 404 || res.status === 500) {
          console.warn(`Server status ${res.status}, using offline simulation`);
          setOfflineActive(true);
          localStorage.setItem("bait_khat_offline_forced", "true");
        }
      } catch (err) {
        console.warn("Network error to server, using offline simulation", err);
        setOfflineActive(true);
        localStorage.setItem("bait_khat_offline_forced", "true");
      }
    }

    const path = url.split("?")[0];
    const method = init?.method || "GET";
    const body = init?.body ? JSON.parse(init.body as string) : null;
    const currentLocalDb = getLocalDb();

    if (path === "/api/db" && method === "GET") {
      return mockResponse(currentLocalDb);
    }

    if (path === "/api/reset" && method === "POST") {
      localStorage.removeItem("bait_khat_fallback_db");
      const seeds = getLocalDb();
      return mockResponse({ success: true, db: seeds });
    }

    if (path === "/api/users" && method === "POST") {
      const { action, user } = body;
      if (action === "create") {
        const newUser = { id: `u-${Date.now()}`, ...user };
        currentLocalDb.users.push(newUser);
        saveLocalDb(currentLocalDb);
        return mockResponse({ success: true, user: newUser });
      }
      if (action === "delete") {
        currentLocalDb.users = currentLocalDb.users.filter((u: any) => u.id !== user.id);
        saveLocalDb(currentLocalDb);
        return mockResponse({ success: true });
      }
    }

    if (path === "/api/courses" && method === "POST") {
      const { action, course } = body;
      if (action === "create") {
        const newCourse = { id: `c-${Date.now()}`, is_published: true, ...course };
        currentLocalDb.courses.push(newCourse);
        saveLocalDb(currentLocalDb);
        return mockResponse({ success: true, course: newCourse });
      }
    }

    if (path === "/api/lessons" && method === "POST") {
      const { action, lesson } = body;
      if (action === "create") {
        const newLesson = { 
          id: `l-${Date.now()}`, 
          ...lesson, 
          order_number: currentLocalDb.lessons.filter((l: any) => l.course_id === lesson.course_id).length + 1 
        };
        currentLocalDb.lessons.push(newLesson);
        saveLocalDb(currentLocalDb);
        return mockResponse({ success: true, lesson: newLesson });
      }
    }

    if (path === "/api/assignments" && method === "POST") {
      const { action, assignment } = body;
      if (action === "create") {
        const newAssignment = { id: `a-${Date.now()}`, ...assignment };
        currentLocalDb.assignments.push(newAssignment);
        saveLocalDb(currentLocalDb);
        return mockResponse({ success: true, assignment: newAssignment });
      }
    }

    if (path === "/api/enroll" && method === "POST") {
      const { student_id, course_id, payment_type, proof_url } = body;
      const course = currentLocalDb.courses.find((c: any) => c.id === course_id);
      
      const newTransaction = {
        id: `t-${Date.now()}`,
        user_id: student_id,
        course_id: course_id,
        amount: course?.price || 350000,
        payment_type: payment_type,
        status: payment_type === 'midtrans' && currentLocalDb.settings.payment_gateway_active ? 'paid' : 'pending_verification',
        proof_url: proof_url || null,
        midtrans_snap_token: payment_type === 'midtrans' ? `snap-${Date.now()}` : null
      };
      currentLocalDb.transactions.push(newTransaction);

      const newEnrollment = {
        id: `e-${Date.now()}`,
        course_id: course_id,
        student_id: student_id,
        tutor_id: null,
        status: newTransaction.status === 'paid' ? 'active' : 'pending'
      };
      currentLocalDb.enrollments.push(newEnrollment);

      if (newTransaction.status === 'paid') {
        currentLocalDb.finances.push({
          id: `f-${Date.now()}`,
          branch_id: "b-1",
          type: "income",
          amount: course?.price || 350000,
          description: `Pendaftaran Otomatis: ${course?.title || 'Program'}`,
          transaction_date: new Date().toISOString()
        });
      }

      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, transaction: newTransaction, enrollment: newEnrollment });
    }

    if (path === "/api/assign-tutor" && method === "POST") {
      const { enrollment_id, tutor_id } = body;
      const enrollment = currentLocalDb.enrollments.find((e: any) => e.id === enrollment_id);
      if (enrollment) {
        enrollment.tutor_id = tutor_id;
        enrollment.status = "active";
        
        const tutor = currentLocalDb.users.find((u: any) => u.id === tutor_id);
        const course = currentLocalDb.courses.find((c: any) => c.id === enrollment.course_id);
        if (tutor && course) {
          const payrollAmount = Math.round(course.price * 0.43); 
          currentLocalDb.finances.push({
            id: `f-${Date.now()}`,
            branch_id: "b-1",
            type: "payroll",
            amount: payrollAmount,
            description: `Penggajian Tutor: ${tutor.name} untuk mhs ${enrollment_id}`,
            transaction_date: new Date().toISOString()
          });
        }
      }
      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, enrollment });
    }

    if (path === "/api/verify-payment" && method === "POST") {
      const { transaction_id } = body;
      const transaction = currentLocalDb.transactions.find((t: any) => t.id === transaction_id);
      let enrollment = null;
      if (transaction) {
        transaction.status = "paid";
        enrollment = currentLocalDb.enrollments.find((e: any) => e.course_id === transaction.course_id && e.student_id === transaction.user_id);
        if (enrollment) {
          enrollment.status = "active";
        }
        const course = currentLocalDb.courses.find((c: any) => c.id === transaction.course_id);
        currentLocalDb.finances.push({
          id: `f-${Date.now()}`,
          branch_id: "b-1",
          type: "income",
          amount: transaction.amount,
          description: `Verifikasi Penjualan: ${course ? course.title : "Program"}`,
          transaction_date: new Date().toISOString()
        });
      }
      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, transaction, enrollment });
    }

    if (path === "/api/submit-assignment" && method === "POST") {
      const { assignment_id, student_id, submitted_file_url } = body;
      let submission = currentLocalDb.submissions.find((s: any) => s.assignment_id === assignment_id && s.student_id === student_id);
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
        currentLocalDb.submissions.push(submission);
      }
      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, submission });
    }

    if (path === "/api/grade-submission" && method === "POST") {
      const { submission_id, grade, feedback_notes, feedback_file_url } = body;
      const submission = currentLocalDb.submissions.find((s: any) => s.id === submission_id);
      if (submission) {
        submission.grade = Number(grade);
        submission.feedback_notes = feedback_notes;
        submission.feedback_file_url = feedback_file_url || null;
        submission.status = grade >= 75 ? "graded" : "revised";
      }
      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, submission });
    }

    if (path === "/api/update-settings" && method === "POST") {
      currentLocalDb.settings = { ...currentLocalDb.settings, ...body };
      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, settings: currentLocalDb.settings });
    }

    if (path === "/api/add-finance" && method === "POST") {
      const newFinance = {
        id: `f-${Date.now()}`,
        branch_id: body.branch_id || "b-1",
        type: body.type,
        amount: Number(body.amount),
        description: body.description,
        transaction_date: new Date().toISOString()
      };
      currentLocalDb.finances.push(newFinance);
      saveLocalDb(currentLocalDb);
      return mockResponse({ success: true, finance: newFinance });
    }

    return mockResponse({ success: false, error: "Mock route not matched" });
  };

  // Notification status simulation
  const [whatsappLogs, setWhatsappLogs] = useState<{ id: string; phone: string; text: string; date: string }[]>([]);

  // Fetch db helper
  const fetchDb = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");
      const data = await res.json();
      setDb(data);
      // Sync coordinate inputs
      if (data.settings) {
        setCertNameX(data.settings.cert_coord_name.x);
        setCertNameY(data.settings.cert_coord_name.y);
        setCertNameSize(data.settings.cert_coord_name.font_size);
        setCertNameColor(data.settings.cert_coord_name.font_color);

        setCertCourseX(data.settings.cert_coord_course.x);
        setCertCourseY(data.settings.cert_coord_course.y);
        setCertCourseSize(data.settings.cert_coord_course.font_size);
        setCertCourseColor(data.settings.cert_coord_course.font_color);

        setCertDateX(data.settings.cert_coord_date.x);
        setCertDateY(data.settings.cert_coord_date.y);
        setCertDateSize(data.settings.cert_coord_date.font_size);
        setCertDateColor(data.settings.cert_coord_date.font_color);

        setCertBackground(data.settings.certificate_template_url);
      }
      // Set initial lesson if undefined
      if (data.lessons && data.lessons.length > 0 && !selectedLesson) {
        setSelectedLesson(data.lessons.find((l: Lesson) => l.course_id === activeCourseId) || data.lessons[0]);
      }
      setErrorMsg("");
    } catch (e: any) {
      setErrorMsg(e.message || "Koneksi terputus dengan server local database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, [activeCourseId]);

  // Flash messages utils
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // Simulates third-party WhatsApp API call with standard logs
  const triggerWhatsApp = (phone: string, text: string) => {
    const newLog = {
      id: `wa-${Date.now()}`,
      phone: phone,
      text: text,
      date: new Date().toLocaleTimeString('id-ID')
    };
    setWhatsappLogs(prev => [newLog, ...prev]);
  };

  // Role switching helper
  const handleUserSwitch = (userId: string) => {
    if (!db) return;
    const found = db.users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showSuccess(`Berhasil bertukar peran menjadi: ${found.name} (${found.role.toUpperCase()})`);
    }
  };

  // 1. Reset Database State
  const handleResetDb = async () => {
    if (!confirm("Reset database kembali ke setelan pabrik (semua pendaftaran baru akan dihapus)?")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDb(data.db);
        showSuccess("Database berhasil disetel ulang (Factory Reset Completed)!");
      }
    } catch (e) {
      showError("Gagal mereset database.");
    }
  };

  // 2. Alokasi Tutor (Routing System)
  const handleAssignTutor = async (enrollmentId: string, tutorId: string) => {
    try {
      const res = await fetch("/api/assign-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: enrollmentId, tutor_id: tutorId })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDb();
        
        // Notify Tutor and Student in simulator
        const studentObj = db?.users.find(u => u.id === data.enrollment.student_id);
        const tutorObj = db?.users.find(u => u.id === tutorId);
        const courseObj = db?.courses.find(c => c.id === data.enrollment.course_id);

        if (studentObj && tutorObj && courseObj) {
          triggerWhatsApp(tutorObj.phone_number, `[TUTOR BARU] Yth. ${tutorObj.name}, murid baru ${studentObj.name} telah dialokasikan ke Anda untuk membimbing program "${courseObj.title}". Silakan periksa dasbor mengajar Anda.`);
          triggerWhatsApp(studentObj.phone_number, `[ALOKASI TUTOR] Yth. ${studentObj.name}, pembimbing Anda untuk kelas "${courseObj.title}" adalah ${tutorObj.name}. Anda kini dapat mengumpulkan tugas mandiri.`);
        }

        showSuccess(`Tutor berhasil dialokasikan! WhatsApp Notifikasi otomatis dikirim lewat Job Queue.`);
      }
    } catch (e) {
      showError("Gagal mengalokasikan tutor.");
    }
  };

  // 3. Verifikasi Transaksi Manual
  const handleVerifyPayment = async (transactionId: string) => {
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDb();

        const studentObj = db?.users.find(u => u.id === data.transaction.user_id);
        const courseObj = db?.courses.find(c => c.id === data.transaction.course_id);
        if (studentObj && courseObj) {
          triggerWhatsApp(studentObj.phone_number, `[PEMBAYARAN LUNAS] Selamat ${studentObj.name}, verifikasi pembayaran manual kelas ${courseObj.title} senilai Rp ${data.transaction.amount.toLocaleString()} BERHASIL. Kelas Anda kini aktif.`);
        }

        showSuccess("Faktur Pembayaran manual diverifikasi! Laporan Cashflow Buku Kas diperbarui.");
      }
    } catch (e) {
      showError("Gagal memverifikasi transaksi.");
    }
  };

  // 4. Tambah Kelas Baru (Super Admin)
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          course: {
            title: newCourseTitle,
            price: Number(newCoursePrice),
            type: newCourseType,
            description: "Kelas kaligrafi ekslusif terstruktur baru yang disusun oleh tim pakar kaligrafi Bait Khat.",
            thumbnail_url: PREMIUM_KHAT_SAMPLES[1].url
          }
        })
      });
      if (res.ok) {
        setNewCourseTitle("");
        await fetchDb();
        showSuccess("Kelas program baru berhasil ditambahkan!");
      }
    } catch (e) {
      showError("Gagal menambahkan kelas baru.");
    }
  };

  // 5. Tambah Materi & Tugas
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle) return;
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          lesson: {
            course_id: activeCourseId,
            title: newLessonTitle,
            type: newLessonType,
            content: newLessonContent || "https://www.youtube.com/embed/dQw4w9WgXcQ"
          }
        })
      });
      if (res.ok) {
        setNewLessonTitle("");
        setNewLessonContent("");
        await fetchDb();
        showSuccess("Materi bimbingan baru berhasil diluncurkan!");
      }
    } catch (e) {
      showError("Gagal meluncurkan materi.");
    }
  };

  // 6. Integrasi Transaksi Checkout oleh Siswa
  const handleCheckout = async (courseId: string, payType: 'midtrans' | 'manual', base64ProofUrl: string | null) => {
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: currentUser.id,
          course_id: courseId,
          payment_type: payType,
          proof_url: base64ProofUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDb();

        if (payType === 'midtrans' && db?.settings.payment_gateway_active) {
          triggerWhatsApp(currentUser.phone_number, `[NOTIFIKASI MIDTRANS SWIFT] Transaksi Anda untuk kelas ID ${courseId} telah dibayar sukses via Snap Token Virtual Account. Kelas otomatis diaktivasi.`);
        } else {
          triggerWhatsApp(currentUser.phone_number, `[BUKTI DIAJUKAN] Yth. ${currentUser.name}, bukti berkas pembayaran manual Anda telah kami simpan di Cloud R2. Mohon tunggu verifikasi admin pusat dalam 1x24 jam.`);
        }

        showSuccess(`Proses Checkout Berhasil! Metode: ${payType.toUpperCase()}`);
      }
    } catch (e) {
      showError("Gagal melakukan checkout kelas.");
    }
  };

  // 7. Unggah Tugas (Siswa)
  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!simulatedFileUrl) {
      showError("Harap pilih atau masukkan tautan/berkas gambar kaligrafi Anda.");
      return;
    }
    
    setUploadProgress(20);
    setTimeout(async () => {
      setUploadProgress(75);
      setTimeout(async () => {
        try {
          const res = await fetch("/api/submit-assignment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assignment_id: assignmentId,
              student_id: currentUser.id,
              submitted_file_url: simulatedFileUrl
            })
          });
          if (res.ok) {
            await fetchDb();
            setUploadProgress(null);
            
            // Send WA Log
            triggerWhatsApp(currentUser.phone_number, `[TUGAS DIKIRIM] Berhasil menyetor foto resolusi tinggi tugas Anda. Notifikasi otomatis dikirimkan ke Tutor penanggung jawab.`);
            
            showSuccess("Lembar kaligrafi premium Anda dikirimkan tanpa kompresi (Lossless). Menunggu penilaian tutor.");
          }
        } catch (e) {
          setUploadProgress(null);
          showError("Gagal mengunggah lembar tugas.");
        }
      }, 500);
    }, 400);
  };

  // 8. Koreksi Tugas & Penandaan Canvas oleh Tutor
  const handleSaveCorrection = async (annotatedImageBase64: string) => {
    if (!correctionTarget) return;
    try {
      const res = await fetch("/api/grade-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: correctionTarget.id,
          grade: tutorGrade,
          feedback_notes: tutorFeedback || "Koreksi terlampir pada file gambar.",
          feedback_file_url: annotatedImageBase64
        })
      });
      if (res.ok) {
        await fetchDb();
        
        // Notify Student via WA logs
        const studentObj = db?.users.find(u => u.id === correctionTarget.student_id);
        const assignmentObj = db?.assignments.find(a => a.id === correctionTarget.assignment_id);
        if (studentObj && assignmentObj) {
          triggerWhatsApp(studentObj.phone_number, `[KOREKSI SELESAI] Yth. ${studentObj.name}, tugas Anda "${assignmentObj.title}" selesai dikoreksi oleh pembimbing dengan Nilai: ${tutorGrade}. Silakan pelajari instruksi coretan revisi.`);
        }

        setCorrectionTarget(null);
        setTutorFeedback("");
        showSuccess("Lembar koreksi & nilai berhasil diunggah! WhatsApp siswa dikirimkan.");
      }
    } catch (e) {
      showError("Gagal menyimpan koreksi tugas.");
    }
  };

  // 9. Update Coordinate Settings (Admin)
  const handleUpdateSettings = async () => {
    try {
      const res = await fetch("/api/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_gateway_active: db?.settings.payment_gateway_active || false,
          certificate_template_url: certBackground,
          cert_coord_name: { x: certNameX, y: certNameY, font_size: certNameSize, font_color: certNameColor },
          cert_coord_course: { x: certCourseX, y: certCourseY, font_size: certCourseSize, font_color: certCourseColor },
          cert_coord_date: { x: certDateX, y: certDateY, font_size: certDateSize, font_color: certDateColor }
        })
      });
      showSuccess("Mapping koordinat cetak sertifikat & konfigurasi berhasil disimpan.");
    } catch (e) {
      showError("Gagal menyimpan konfigurasi.");
    }
  };

  // Toggles Payment Gateway
  const handleTogglePaymentGateway = async (val: boolean) => {
    if (!db) return;
    try {
      const res = await fetch("/api/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...db.settings,
          payment_gateway_active: val
        })
      });
      if (res.ok) {
        await fetchDb();
        showSuccess(`Payment Gateway Midtrans ${val ? "DIAKTIFKAN (Instan SNAP)" : "DINONAKTIFKAN (Manual Transfer)"}`);
      }
    } catch (e) {
      showError("Gagal memperbarui preferensi pembayaran.");
    }
  };

  // Manual finance expenses addition
  const handleAddExpenses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finDesc || finAmount <= 0) return;
    try {
      const res = await fetch("/api/add-finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: finBranch,
          type: finType,
          amount: finAmount,
          description: finDesc
        })
      });
      if (res.ok) {
        setFinDesc("");
        setFinAmount(50000);
        await fetchDb();
        showSuccess("Catatan buku kas pengeluaran/pendapatan manual berhasil disimpan.");
      }
    } catch (e) {
      showError("Gagal mencatat transaksi buku kas.");
    }
  };

  // Safe percentage helper for Student completions
  const calculateProgress = (studentId: string, courseId: string) => {
    if (!db) return 0;
    const courseLessons = db.lessons.filter(l => l.course_id === courseId);
    if (courseLessons.length === 0) return 0;
    
    // Check assignments for these lessons
    const courseAssignments = db.assignments.filter(a => courseLessons.some(l => l.id === a.lesson_id));
    if (courseAssignments.length === 0) return 100; // no homework format

    // Completed homeworks status "graded"
    const parsedCompleted = db.submissions.filter(s => s.student_id === studentId && s.status === 'graded' && courseAssignments.some(ca => ca.id === s.assignment_id));
    
    return Math.min(100, Math.round((parsedCompleted.length / courseAssignments.length) * 100));
  };


  if (!db) {
    return (
      <div className="min-h-screen bg-[#F9FBFA] flex flex-col items-center justify-center p-20 text-slate-500 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        <p className="font-semibold text-lg">Memuat Arsitektur Relasi Database & Cloud Storage...</p>
        <p className="text-sm opacity-70">Menyiapkan modul visualisasi khat lossless tanpa kompresi.</p>
        {offlineActive && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-full mt-4 font-semibold inline-flex items-center gap-1">
            💡 Mode Offline Aktif: Data berjalan langsung di browser Anda.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white text-xs py-2 px-4 shadow-sm z-50 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-teal-950 font-bold px-2 py-0.5 rounded-full text-[10px]">PROTOTIPE INTERAKTIF</span>
            <span>Sekolah Kaligrafi LMS Bait Khat - Integrasi File Lossless & Koordinat Cetak E-Sertifikat</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-90 font-mono text-emerald-300">Waktu Server: 2026-06-20</span>
            <button 
              id="btn-re-seed-db"
              onClick={handleResetDb} 
              className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-emerald-200 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Setel Ulang Data (Reset)
            </button>
          </div>
        </div>
      </div>

      {/* 2. DUAL LAYOUT CONTAINER: SIDEBAR + MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row relative">

        {/* ==================== COLLAPSIBLE SIDEBAR ==================== */}
        <aside 
          className={`bg-slate-900 text-slate-100 flex flex-col shrink-0 transition-all duration-300 border-r border-slate-800 relative z-40 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          {/* Logo Brand Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 bg-emerald-600 rounded-xl text-white flex-shrink-0 shadow-lg shadow-emerald-600/10">
                <Sparkles className="w-4 h-4" />
              </div>
              {sidebarOpen && (
                <div className="leading-tight">
                  <h1 className="text-xs font-black tracking-wider text-white">BAIT KHAT</h1>
                  <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-widest">LMS KALIGRAFI</span>
                </div>
              )}
            </div>
            
            {/* Collapse button on Desktop */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer hidden md:block"
              title={sidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Profile Summary Card */}
          <div className="p-3.5 border-b border-slate-800/60 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.name[0]}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-200 truncate leading-tight">{currentUser.name}</p>
                  <span className="inline-block bg-slate-800/60 text-emerald-400 text-[8px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 mt-1 rounded">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Responsive Sidebar Navigation Menus */}
          <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
            {sidebarOpen && (
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-2 block">
                Menu Utama ({currentUser.role === 'siswa' ? 'Siswa' : currentUser.role === 'tutor' ? 'Tutor' : 'Admin'})
              </p>
            )}

            {/* SUPER ADMIN / BRANCH ADMIN MENU */}
            {(currentUser.role === 'super_admin' || currentUser.role === 'admin_cabang') && (
              <div className="space-y-1">
                {[
                  { id: 'alokasi', label: 'Tutor Routing', icon: Navigation },
                  { id: 'keuangan', label: 'Ledger Keuangan', icon: Wallet },
                  { id: 'sertifikat', label: 'Mapping Sertifikat', icon: Award },
                  { id: 'kurikulum', label: 'Kelola Kurikulum', icon: BookOpen }
                ].map(item => {
                  const Icon = item.icon;
                  const active = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id as any)}
                      title={item.label}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                          : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TUTOR MENU */}
            {currentUser.role === 'tutor' && (
              <div className="space-y-1">
                {[
                  { id: 'beranda', label: 'Tutor Dashboard', icon: Monitor },
                  { id: 'koreksi', label: 'Koreksi Karya & Nilai', icon: Award }
                ].map(item => {
                  const Icon = item.icon;
                  const active = tutorTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTutorTab(item.id as any)}
                      title={item.label}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                          : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* SISWA MENU */}
            {currentUser.role === 'siswa' && (
              <div className="space-y-1">
                {[
                  { id: 'belajar', label: 'Ruang Belajar', icon: BookOpen },
                  { id: 'transaksi', label: 'Laporan Invoice', icon: Wallet }
                ].map(item => {
                  const Icon = item.icon;
                  const active = siswaTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSiswaTab(item.id as any)}
                      title={item.label}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                          : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Course Quick Dropdown inside sidebar instead of big tiles */}
            {sidebarOpen && (
              <div className="pt-4 border-t border-slate-800 mt-4 px-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Pilih Program Aktif:</span>
                <select 
                  value={activeCourseId} 
                  onChange={(e) => setActiveCourseId(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-slate-300 p-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {db.courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}
          </nav>

          {/* Mode Offline Alert inside Sidebar */}
          {offlineActive && sidebarOpen && (
            <div className="m-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-[10px] text-amber-400 font-bold block">💡 Mode Offline Aktif</span>
              <p className="text-[8.5px] text-slate-400 mt-1 leading-snug">
                Semua modifikasi Anda disimpan langsung ke Local Storage.
              </p>
            </div>
          )}

          {/* WhatsApp Queue at Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[10px]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-400 font-black uppercase text-[8px] tracking-wider">Redis Log Queue</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              </div>
              <div className="max-h-[80px] overflow-y-auto space-y-1.5 mt-1 text-slate-300">
                {whatsappLogs.length === 0 ? (
                  <p className="text-slate-500 italic text-[9px] text-center my-2">Belum ada antrean pesan...</p>
                ) : (
                  whatsappLogs.slice(-2).map(log => (
                    <div key={log.id} className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-[9px] leading-snug">
                      <span className="text-emerald-400 font-mono block text-[8px] mb-0.5">{log.phone}</span>
                      <p className="line-clamp-2 leading-tight">{log.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ==================== RIGHT MAIN CONTAINER WORKSPACE ==================== */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
          
          {/* Header Workspace with Account Simulation & Menu Button */}
          <header className="bg-white border-b border-rose-50/10 shadow-sm sticky top-0 z-30 shrink-0 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors block md:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  LMS BAIT KHAT 
                  <span className="hidden sm:inline bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 leading-tight">Sekolah Seni Kaligrafi Kontemporer</p>
              </div>
            </div>

            {/* SIMULATED ACCOUNT SWITCHER - MAKES IT EASY TO RE-SIMULATE ALL ROLES */}
            <div className="bg-emerald-50/60 p-1 rounded-xl border border-emerald-100/50 flex items-center gap-1">
              <span className="text-[10px] font-bold text-emerald-850 uppercase px-2 hidden lg:inline tracking-wider">Simulasi Akun:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {db.users.map(u => (
                  <button
                    key={u.id}
                    id={`btn-user-switch-${u.id}`}
                    onClick={() => handleUserSwitch(u.id)}
                    className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
                      currentUser.id === u.id 
                        ? 'bg-emerald-650 text-white shadow-sm' 
                        : 'bg-white/80 text-slate-600 hover:bg-emerald-100/40'
                    }`}
                  >
                    {u.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Main Content Workspace Layout with Notifications */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8 max-w-7xl w-full mx-auto">
            
            {/* Success and Error Indicators */}
            {successMsg && (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />
                <p className="text-xs font-semibold text-emerald-800">{successMsg}</p>
              </div>
            )}
            {errorMsg && (
              <div className="bg-rose-50 border-l-4 border-rose-550 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-800">{errorMsg}</p>
              </div>
            )}

            {/* RIGHT MAIN PANEL CONTENT WRAPPER */}
            <div className="space-y-8">
              
              {/* BRAND ADVERT HERO */}
              <div className="bg-emerald-900 rounded-3xl p-6.5 text-white shadow-xl shadow-emerald-950/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 border border-emerald-700 px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-3.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Metodologi Penilaian Khat Terbaik</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 font-serif">Al-Khattat: Keindahan Presisi Kaligrafi</h2>
                  <p className="text-emerald-100/90 text-sm max-w-xl leading-relaxed">
                    Sistem evaluasi lms dilengkapi fitur pembimbingan langsung. Murid mengunggah berkas tanpa kompresi 
                    agar tarikan kalam bambu dan ketebalan titik tinta dapat dipelajari secara presisi.
                  </p>
                </div>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-700 flex flex-col justify-center items-center text-center flex-shrink-0 w-36">
                  <p className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase mb-1">Status Gateway</p>
                  <button
                    id="btn-toggle-gw"
                    onClick={() => handleTogglePaymentGateway(!db.settings.payment_gateway_active)}
                    className={`mt-2 py-1 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer w-full text-center ${
                      db.settings.payment_gateway_active 
                        ? 'bg-emerald-500 text-teal-950 hover:bg-emerald-400' 
                        : 'bg-amber-500 text-teal-950 hover:bg-amber-400'
                    }`}
                  >
                    {db.settings.payment_gateway_active ? '✅ Midtrans SNAP' : '⚠️ Manual Upload'}
                  </button>
                  <p className="text-[10px] text-emerald-200 mt-2 block">(Klik untuk Toggle)</p>
                </div>
              </div>


              {/* ROLE BASE LAYOUTS */}
              
              {/* ==================== A. SUPER ADMIN / BRANCH ADMIN DASHBOARD ==================== */}
              {currentUser.role === 'super_admin' || currentUser.role === 'admin_cabang' ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  
                  {/* Tabs within admin */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                    <span className="font-bold text-slate-800 mr-4 text-sm uppercase tracking-wider block">Panel Admin:</span>
                    {[
                      { id: 'alokasi', label: 'Alokasi Murid (Tutor Routing)', icon: Navigation },
                      { id: 'keuangan', label: 'Ledger Keuangan & Gaji', icon: Wallet },
                      { id: 'sertifikat', label: 'Mapping E-Sertifikat', icon: Award },
                      { id: 'kurikulum', label: 'Kelola Materi & Ujian', icon: BookOpen }
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          id={`btn-adm-tab-${tab.id}`}
                          onClick={() => setAdminTab(tab.id as any)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            adminTab === tab.id 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 1. Alokasi Murid & Routing Tutor */}
                  {adminTab === 'alokasi' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">Distribusi Murid & Alokasi Tutor Penanggungjawab</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Semua pendaftaran program wajib diberikan Tutor agar progres belajar dapat dinilai. Penggajian dihitung otomatis setelah dialokasikan.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                              <th className="p-3">Siswa</th>
                              <th className="p-3">Program</th>
                              <th className="p-3">Status Kelas</th>
                              <th className="p-3">Pembimbing Ditunjuk</th>
                              <th className="p-3 text-right">Aksi Alokasi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {db.enrollments.map(en => {
                              const student = db.users.find(u => u.id === en.student_id);
                              const course = db.courses.find(c => c.id === en.course_id);
                              const tutor = db.users.find(u => u.id === en.tutor_id);

                              return (
                                <tr key={en.id} className="hover:bg-slate-50/50">
                                  <td className="p-3">
                                    <p className="font-bold text-slate-900">{student?.name || "Unknown Pupil"}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{student?.phone_number}</p>
                                  </td>
                                  <td className="p-3">
                                    <p className="font-semibold text-slate-800">{course?.title}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Rp {course?.price.toLocaleString()}</p>
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                      en.status === 'active' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {en.status}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {tutor ? (
                                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{tutor.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>Belum Ada Tutor</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <select
                                        id={`select-tutor-for-${en.id}`}
                                        className="bg-white border border-slate-200 text-xs rounded px-2 py-1 font-semibold text-slate-700"
                                        defaultValue={en.tutor_id || ""}
                                        onChange={(e) => {
                                          if (e.target.value) handleAssignTutor(en.id, e.target.value);
                                        }}
                                      >
                                        <option value="" disabled>-- Pilih Tutor --</option>
                                        {db.users.filter(u => u.role === 'tutor').map(t => (
                                          <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 2. Keuangan Ledger, Verifikasi Manual & Gaji */}
                  {adminTab === 'keuangan' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Summary Widget 1 */}
                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Total Pemasukan (Cashflow)</p>
                          <p className="text-2xl font-black text-emerald-950 mt-1">
                            Rp {db.finances.filter(f => f.type === 'income').reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                          </p>
                          <div className="text-[10px] text-emerald-700 mt-2 flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Berasal dari biaya kelas aktif & lunas
                          </div>
                        </div>

                        {/* Summary Widget 2 */}
                        <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl">
                          <p className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Total Pengeluaran & Payroll</p>
                          <p className="text-2xl font-black text-rose-950 mt-1">
                            Rp {db.finances.filter(f => f.type !== 'income').reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                          </p>
                          <div className="text-[10px] text-rose-700 mt-2 flex items-center gap-1">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Gaji tutor & operasional kelas
                          </div>
                        </div>

                        {/* Summary Widget 3 */}
                        <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl">
                          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Verifikasi Tertunda</p>
                          <p className="text-2xl font-black text-amber-950 mt-1">
                            {db.transactions.filter(t => t.status === 'pending_verification').length} Transaksi
                          </p>
                          <div className="text-[10px] text-amber-700 mt-2">
                            Memerlukan peninjauan bukti transfer manual
                          </div>
                        </div>
                      </div>

                      {/* Manual Payment Verification List */}
                      <div className="border border-slate-100 rounded-xl p-4 bg-[#FAFAF9]">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Daftar Transaksi Manual Menunggu Verifikasi</h4>
                        {db.transactions.filter(t => t.status === 'pending_verification').length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center italic">Tidak ada transaksi manual tertunda saat ini.</p>
                        ) : (
                          <div className="space-y-3">
                            {db.transactions.filter(t => t.status === 'pending_verification').map(t => {
                              const user = db.users.find(u => u.id === t.user_id);
                              const course = db.courses.find(c => c.id === t.course_id);

                              return (
                                <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{user?.name}</span>
                                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono">{t.payment_type.toUpperCase()}</span>
                                    </div>
                                    <p className="text-slate-600">Pendaftaran Kelas: <span className="font-semibold">{course?.title}</span></p>
                                    <p className="font-bold text-emerald-800">Tagihan: Rp {t.amount.toLocaleString()}</p>
                                  </div>
                                  
                                  {/* Proof of transfer preview */}
                                  <div className="flex items-center gap-3">
                                    {t.proof_url ? (
                                      <div className="text-center">
                                        <a href={t.proof_url} target="_blank" rel="noreferrer" className="block border border-slate-300 p-1 bg-white rounded hover:opacity-90">
                                          <img src={t.proof_url} alt="Proof" className="w-14 h-10 object-cover rounded" />
                                        </a>
                                        <span className="text-[9px] text-neutral-500 block mt-1">Bukti Transfer</span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-rose-500 block italic">Siswa belum unggah bukti</span>
                                    )}

                                    <div className="flex items-center gap-2">
                                      {/* WhatsApp payment reminder API trigger */}
                                      <button
                                        id={`btn-wa-remind-${t.id}`}
                                        onClick={() => triggerWhatsApp(user?.phone_number || "081", `[PENGINGAT TAGIHAN] Yth ${user?.name}, pendaftaran untuk kelas ${course?.title} belum terverifikasi. Selesaikan pembayaran sebesar Rp ${t.amount.toLocaleString()} dan unggah bukti transfer.`)}
                                        className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold py-1.5 px-3 rounded text-xs flex items-center gap-1 cursor-pointer"
                                      >
                                        <Send className="w-3 h-3 text-emerald-600" /> Kirim Tagihan (WA)
                                      </button>
                                      
                                      <button
                                        id={`btn-verify-tr-${t.id}`}
                                        onClick={() => handleVerifyPayment(t.id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4.5 rounded transition shadow-sm cursor-pointer"
                                      >
                                        Validasi Lunas
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Manual Ledger Creation & Expenses Entry */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-slate-100 rounded-xl p-4 bg-white">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Buat Catatan Buku Kas Baru</h4>
                          <form onSubmit={handleAddExpenses} className="space-y-3.5 text-xs">
                            <div>
                              <label className="block font-medium text-slate-600 mb-1">Tipe Entri Buku</label>
                              <select 
                                id="select-fin-type"
                                value={finType}
                                onChange={(e) => setFinType(e.target.value as any)}
                                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                              >
                                <option value="expense">Pengeluaran Operasional (Expense)</option>
                                <option value="income">Pendapatan Manual (Income)</option>
                                <option value="payroll">Gaji Pengajar Manual (Payroll)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium text-slate-600 mb-1">Jumlah Biaya (Rp)</label>
                              <input 
                                id="input-fin-amount"
                                type="number" 
                                value={finAmount} 
                                onChange={(e) => setFinAmount(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-slate-600 mb-1">Deskripsi / Peruntukan</label>
                              <input 
                                id="input-fin-desc"
                                type="text"
                                placeholder="Contoh: Pembelian Kalam bambu cadangan"
                                value={finDesc} 
                                onChange={(e) => setFinDesc(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                                required
                              />
                            </div>
                            <button
                              id="btn-add-ledger"
                              type="submit"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition cursor-pointer"
                            >
                              Simpan Entri Kas
                            </button>
                          </form>
                        </div>

                        {/* Ledger list */}
                        <div className="border border-slate-100 rounded-xl p-4 bg-white">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Buku Kas & Riwayat Penggajian (Finances)</h4>
                          <div className="space-y-2 max-h-[260px] overflow-y-auto">
                            {db.finances.map(f => (
                              <div key={f.id} className="flex justify-between items-center p-2.5 rounded border border-slate-50 bg-slate-50/50 text-xs">
                                <div>
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1.5 ${
                                    f.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {f.type}
                                  </span>
                                  <span className="font-semibold text-slate-700">{f.description}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Date: {new Date(f.transaction_date).toLocaleDateString()}</p>
                                </div>
                                <span className={`font-mono font-bold ${f.type === 'income' ? 'text-emerald-700' : 'text-slate-700'}`}>
                                  {f.type === 'income' ? '+' : '-'} Rp {f.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Mapping E-Sertifikat Koordinat */}
                  {adminTab === 'sertifikat' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">Modul Generator E-Sertifikat Koordinat</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Posisikan parameter teks (Nama Siswa, Kelas Program, Tanggal Kelulusan) tepat di koordinat X dan Y pada template gambar kosong di bawah.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Adjustment Sliders */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-4">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">Kontrol Koordinat Teks</h4>
                          
                          {/* Name Coord */}
                          <div className="space-y-2.5">
                            <span className="font-bold text-slate-700 block">1. Parameter NAMA SISWA</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">Koordinat X: {certNameX} px</label>
                                <input id="bar-name-x" type="range" min="50" max="750" value={certNameX} onChange={(e) => setCertNameX(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Koordinat Y: {certNameY} px</label>
                                <input id="bar-name-y" type="range" min="50" max="550" value={certNameY} onChange={(e) => setCertNameY(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">Ukuran Huruf: {certNameSize} px</label>
                                <input id="bar-name-size" type="range" min="14" max="42" value={certNameSize} onChange={(e) => setCertNameSize(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Warna Teks</label>
                                <input id="color-name-picker" type="color" value={certNameColor} onChange={(e) => setCertNameColor(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
                              </div>
                            </div>
                          </div>

                          {/* Course Coord */}
                          <div className="space-y-2.5 border-t border-slate-200 pt-3">
                            <span className="font-bold text-slate-700 block">2. Parameter NAMA PROGRAM (COURSE)</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">Koordinat X: {certCourseX} px</label>
                                <input id="bar-course-x" type="range" min="50" max="750" value={certCourseX} onChange={(e) => setCertCourseX(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Koordinat Y: {certCourseY} px</label>
                                <input id="bar-course-y" type="range" min="50" max="550" value={certCourseY} onChange={(e) => setCertCourseY(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">Ukuran Huruf: {certCourseSize} px</label>
                                <input id="bar-course-size" type="range" min="12" max="36" value={certCourseSize} onChange={(e) => setCertCourseSize(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Warna Teks</label>
                                <input id="color-course-picker" type="color" value={certCourseColor} onChange={(e) => setCertCourseColor(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
                              </div>
                            </div>
                          </div>

                          {/* Date Coord */}
                          <div className="space-y-2.5 border-t border-slate-200 pt-3">
                            <span className="font-bold text-slate-700 block">3. Parameter TANGGAL KELULUSAN</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">Koordinat X: {certDateX} px</label>
                                <input id="bar-date-x" type="range" min="50" max="750" value={certDateX} onChange={(e) => setCertDateX(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Koordinat Y: {certDateY} px</label>
                                <input id="bar-date-y" type="range" min="50" max="550" value={certDateY} onChange={(e) => setCertDateY(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">Ukuran Huruf: {certDateSize} px</label>
                                <input id="bar-date-size" type="range" min="10" max="28" value={certDateSize} onChange={(e) => setCertDateSize(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Warna Teks</label>
                                <input id="color-date-picker" type="color" value={certDateColor} onChange={(e) => setCertDateColor(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
                              </div>
                            </div>
                          </div>

                          <button
                            id="btn-save-coord-changes"
                            onClick={handleUpdateSettings}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs mt-4 transition cursor-pointer"
                          >
                            Terapkan & Simpan Koordinat
                          </button>
                        </div>

                        {/* Live Canvas Map View */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tampilan Canvas Simulasi (800x600 px)</h4>
                          <span className="text-[10px] text-slate-500 block">Siswa akan mengunduh dengan visualisasi teks berhimpitan di posisi ini:</span>
                          
                          {/* Overlay visualization container with scaling */}
                          <div className="relative border border-amber-300 rounded overflow-hidden aspect-[4/3] bg-slate-100 max-w-full">
                            <div className="absolute inset-0 w-full h-full p-2">
                              <svg viewBox="0 0 800 600" className="w-full h-full border border-dashed border-emerald-300">
                                {/* Simulated Background SVG */}
                                <rect width="800" height="600" fill="#FCFBFA" />
                                <rect x="25" y="25" width="750" height="550" fill="none" stroke="#10B981" stroke-width="4"/>
                                <rect x="35" y="35" width="730" height="530" fill="none" stroke="#FBBF24" stroke-width="2"/>
                                
                                <text x="400" y="160" font-family="serif" font-weight="bold" font-size="28" fill="#1F2937" text-anchor="middle">SERTIFIKAT KELULUSAN</text>
                                <text x="400" y="195" font-family="sans-serif" font-size="13" fill="#6B7280" text-anchor="middle">Diajukan secara resmi kepada alumnus sekolah:</text>

                                {/* Live dynamic coordinates values mapped directly on overlay */}
                                <text 
                                  x={certNameX} 
                                  y={certNameY} 
                                  font-size={certNameSize} 
                                  fill={certNameColor} 
                                  font-family="sans-serif"
                                  font-weight="bold" 
                                  text-anchor="middle"
                                >
                                  [NAMA SISWA SIMULATOR]
                                </text>

                                <text 
                                  x={certCourseX} 
                                  y={certCourseY} 
                                  font-size={certCourseSize} 
                                  fill={certCourseColor} 
                                  font-family="sans-serif"
                                  font-style="italic"
                                  font-weight="600" 
                                  text-anchor="middle"
                                >
                                  [KELAS PROGRAM KALIGRAFI]
                                </text>

                                <text 
                                  x={certDateX} 
                                  y={certDateY} 
                                  font-size={certDateSize} 
                                  fill={certDateColor} 
                                  font-family="sans-serif"
                                  text-anchor="middle"
                                >
                                  Lulus Tanggal: 20 Juni 2026
                                </text>

                                <text x="400" y="520" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">Direktur Utama Bait Khat, Jakarta</text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Kurikulum & Materi creation */}
                  {adminTab === 'kurikulum' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                        {/* Course insertion form */}
                        <div className="bg-[#FAF9F9] border border-slate-200 rounded-xl p-4 space-y-4">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase">Buat Program Belajar Baru</h4>
                          <form onSubmit={handleCreateCourse} className="space-y-3">
                            <div>
                              <label className="block text-slate-500 font-semibold mb-1">Nama Program Kelas</label>
                              <input 
                                id="input-new-co-title"
                                type="text"
                                placeholder="Contoh: Kelas Khat Riq'ah Populer" 
                                value={newCourseTitle} 
                                onChange={(e) => setNewCourseTitle(e.target.value)} 
                                className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded"
                                required 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-slate-500 font-semibold mb-1">Biaya Investasi (Rp)</label>
                                <input 
                                  id="input-new-co-price"
                                  type="number" 
                                  value={newCoursePrice} 
                                  onChange={(e) => setNewCoursePrice(Number(e.target.value))} 
                                  className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-500 font-semibold mb-1">Kategori Program</label>
                                <select 
                                  id="select-new-co-type"
                                  value={newCourseType}
                                  onChange={(e) => setNewCourseType(e.target.value as any)}
                                  className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded"
                                >
                                  <option value="online_lms">Online LMS</option>
                                  <option value="reguler_offline">Reguler Offline</option>
                                  <option value="lomba_event">Event Lomba</option>
                                </select>
                              </div>
                            </div>
                            <button id="btn-add-course" type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition cursor-pointer">
                              Tambahkan Kelas Baru
                            </button>
                          </form>
                        </div>

                        {/* Lesson insertion form */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-slate-800 text-sm uppercase">Kelola Silabus & Alur Materi</h4>
                            <span className="bg-emerald-100/80 font-bold text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                              Selected Course: {db.courses.find(c => c.id === activeCourseId)?.title}
                            </span>
                          </div>
                          <form onSubmit={handleCreateLesson} className="space-y-3">
                            <div>
                              <label className="block text-slate-500 font-semibold mb-1">Judul Bab / Urutan Pembelajaran</label>
                              <input 
                                id="input-new-les-title"
                                type="text"
                                placeholder="Contoh: Bab 2: Garis Sambung Ba-Sin"
                                value={newLessonTitle} 
                                onChange={(e) => setNewLessonTitle(e.target.value)} 
                                className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded"
                                required 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-slate-500 font-semibold mb-1">Tipe Konten</label>
                                <select 
                                  id="select-new-les-type"
                                  value={newLessonType}
                                  onChange={(e) => setNewLessonType(e.target.value as any)}
                                  className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded"
                                >
                                  <option value="video">Embed Video YouTube</option>
                                  <option value="text">Instruksi Berkas Teks</option>
                                  <option value="pdf">Modul PDF File</option>
                                  <option value="link">Tautan Luar</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-slate-500 font-semibold mb-1">Konten / URL Embed</label>
                                <input 
                                  id="input-new-les-content"
                                  type="text"
                                  placeholder="https://www.youtube.com/embed/..."
                                  value={newLessonContent} 
                                  onChange={(e) => setNewLessonContent(e.target.value)} 
                                  className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded" 
                                />
                              </div>
                            </div>
                            <button id="btn-add-lesson" type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition cursor-pointer">
                              Publikasikan Bab & Tugas Mandiri
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Displaying Current Lessons list */}
                      <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">Struktur Alur Silsilah Belajar (Sequence):</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {db.lessons.filter(l => l.course_id === activeCourseId).map(l => {
                            const isAssignment = db.assignments.find(a => a.lesson_id === l.id);

                            return (
                              <div key={l.id} className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="p-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[9px] uppercase">{l.type}</span>
                                    <span className="text-slate-400 font-mono text-[10px]">#Bab {l.order_number}</span>
                                  </div>
                                  <span className="font-bold text-slate-800 block mt-1">{l.title}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{l.content}</p>
                                </div>
                                {isAssignment ? (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded">Ada Tugas Gambar</span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 text-[9px] font-medium px-2 py-0.5 rounded">Hanya Materi</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              ) : null}


              {/* ==================== B. TUTOR (FASILITATOR) DASHBOARD ==================== */}
              {currentUser.role === 'tutor' ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  
                  {/* Tutor Navigation Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                    <span className="font-bold text-slate-800 mr-4 text-sm uppercase tracking-wider">Panel Tutor:</span>
                    <button
                      id="btn-tut-tab-beranda"
                      onClick={() => setTutorTab('beranda')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        tutorTab === 'beranda' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Daftar Murid Asuhan Saya</span>
                    </button>
                    <button
                      id="btn-tut-tab-koreksi"
                      onClick={() => setTutorTab('koreksi')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        tutorTab === 'koreksi' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Koreksi Tugas Berkas ({db.submissions.filter(s => s.status === 'submitted').length})</span>
                    </button>
                  </div>

                  {/* 1. Tutor Home List of Assigned Students */}
                  {tutorTab === 'beranda' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">Halaman Monitoring Siswa & Progres Belajar</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Anda hanya diperbolehkan melihat & mengoreksi tugas murid yang ditugaskan khusus oleh Admin Utama.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {db.enrollments.filter(e => e.tutor_id === currentUser.id).map(en => {
                          const student = db.users.find(u => u.id === en.student_id);
                          const course = db.courses.find(c => c.id === en.course_id);
                          const progress = calculateProgress(en.student_id, en.course_id);

                          return (
                            <div key={en.id} className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-200 flex flex-col justify-between text-xs">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-extrabold text-slate-900 text-sm">{student?.name}</p>
                                    <p className="text-slate-500 text-[10px] font-mono mt-0.5">Telepon: {student?.phone_number}</p>
                                  </div>
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                    {en.status}
                                  </span>
                                </div>
                                <div className="mt-4 space-y-1">
                                  <p className="text-slate-600">Kelas Program: <span className="font-semibold text-slate-800">{course?.title}</span></p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="font-bold text-slate-700">{progress}% Lunas</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400">Terdaftar Resmi</span>
                                <button
                                  id={`btn-tut-go-kor-${en.id}`}
                                  onClick={() => setTutorTab('koreksi')}
                                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                                >
                                  Periksa Tugas &gt;
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {db.enrollments.filter(e => e.tutor_id === currentUser.id).length === 0 && (
                          <div className="col-span-2 text-center py-10 bg-slate-50 rounded-lg">
                            <p className="text-slate-500 italic text-sm">Belum ada murid yang dialokasikan ke pembimbingan Anda.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Interactive Canvas Correction Segment */}
                  {tutorTab === 'koreksi' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">Modul Lembar Koreksi Tulisan Khat (Lossless Vector Canvas)</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Klik gambar tugas siswa di bawah untuk membuka modul coretan koreksi. Tulisan murid tidak dikompresi agar ornamen khat dapat dianalisis presisi.
                        </p>
                      </div>

                      {/* Canvas editor pop-up trigger or embed */}
                      {correctionTarget ? (
                        <div className="border border-slate-300 rounded-xl p-5 bg-white space-y-5">
                          <h4 className="font-bold text-slate-900 text-sm">Menilai Tugas Murid: {db.users.find(u => u.id === correctionTarget.student_id)?.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Annotation settings panel */}
                            <div className="md:col-span-1 space-y-4 text-xs">
                              <div>
                                <label className="block text-slate-600 font-semibold mb-1">Berikan Skor Nilai (0 - 100)</label>
                                <input 
                                  id="input-score-grade"
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  value={tutorGrade} 
                                  onChange={(e) => setTutorGrade(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded p-2 text-sm font-bold text-center" 
                                />
                                <span className="text-[10px] text-slate-500 block mt-1">💡 Skor minimal lulus modul kaligrafi adalah 75.</span>
                              </div>

                              <div>
                                <label className="block text-slate-600 font-semibold mb-1">Tulis Catatan / Koreksi Teks</label>
                                <textarea
                                  id="text-feedback-notes"
                                  rows={4}
                                  placeholder="Contoh: Sambungan huruf Sin ke Mim kurang melengkung, tinta berlebih di ujung kalam..."
                                  value={tutorFeedback}
                                  onChange={(e) => setTutorFeedback(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-2"
                                />
                              </div>
                            </div>

                            {/* Canvas drawing sheet */}
                            <div className="md:col-span-2">
                              {correctionTarget.submitted_file_url ? (
                                <CanvasAnnotator 
                                  imageUrl={correctionTarget.submitted_file_url}
                                  onSave={handleSaveCorrection}
                                  onCancel={() => setCorrectionTarget(null)}
                                />
                              ) : (
                                <p className="text-xs text-rose-500 italic">Gambar tugas siswa kosong / tidak ditemukan.</p>
                              )}
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Antrean Tugas Kaligrafi Murid Menunggu Koreksi</h4>
                          
                          <div className="space-y-3">
                            {db.submissions.filter(s => {
                              // Filter specifically for students managed by this Tutor
                              const enrollment = db.enrollments.find(e => e.student_id === s.student_id && e.tutor_id === currentUser.id);
                              return enrollment && s.status === 'submitted';
                            }).map(sub => {
                              const student = db.users.find(u => u.id === sub.student_id);
                              const homework = db.assignments.find(a => a.id === sub.assignment_id);

                              return (
                                <div key={sub.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-slate-900">{student?.name}</span>
                                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase">{sub.status}</span>
                                    </div>
                                    <p className="font-semibold text-slate-700 mt-1">{homework?.title}</p>
                                    <p className="text-[10px] text-slate-500 italic mt-1 font-sans">Instruksi: {homework?.instruction_text}</p>
                                  </div>
                                  <div className="flex items-center gap-3 self-end md:self-auto">
                                    <img src={sub.submitted_file_url} alt="Tulisan Siswa" className="w-16 h-12 object-cover rounded border border-slate-300" />
                                    <button
                                      id={`btn-action-grade-${sub.id}`}
                                      onClick={() => {
                                        setCorrectionTarget(sub);
                                        setTutorGrade(85);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
                                    >
                                      Buka Koreksi & Canvas
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {db.submissions.filter(s => {
                              const enrollment = db.enrollments.find(e => e.student_id === s.student_id && e.tutor_id === currentUser.id);
                              return enrollment && s.status === 'submitted';
                            }).length === 0 && (
                              <p className="text-slate-500 italic py-6 text-center">Tidak ada antrean tugas penulisan menunggu evaluasi.</p>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              ) : null}


              {/* ==================== C. SISWA (PENGGUNA UTAMA) DASHBOARD ==================== */}
              {currentUser.role === 'siswa' ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-8">
                  
                  {/* Siswa Submenu */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <span className="font-bold text-slate-800 mr-4 text-sm uppercase tracking-wider">Panel Siswa:</span>
                    <button
                      id="btn-sis-tab-belajar"
                      onClick={() => setSiswaTab('belajar')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        siswaTab === 'belajar' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Ruang Belajar (Video & Tugas)
                    </button>
                    <button
                      id="btn-sis-tab-transaksi"
                      onClick={() => setSiswaTab('transaksi')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        siswaTab === 'transaksi' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 inline mr-1" /> Riwayat Transaksi & Pendaftaran Belajar
                    </button>
                  </div>

                  {/* 1. Siswa Classroom, video integration & Homework upload */}
                  {siswaTab === 'belajar' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Side: Lesson materials navigation list */}
                      <div className="md:col-span-1 space-y-3.5 text-xs">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">Materi Alur Pembelajaran (Sequence)</h4>
                        <div className="space-y-2">
                          {db.lessons.filter(l => l.course_id === activeCourseId).map(l => (
                            <button
                              key={l.id}
                              id={`btn-view-lesson-${l.id}`}
                              onClick={() => setSelectedLesson(l)}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                selectedLesson?.id === l.id 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-semibold">
                                <span className="opacity-80">Bab {l.order_number}</span>
                                <span>•</span>
                                <span className="font-mono text-emerald-800">{l.type}</span>
                              </div>
                              <span>{l.title}</span>
                            </button>
                          ))}
                        </div>

                        {/* Certificates Auto Unlocker segment */}
                        {(() => {
                          const courseObj = db.courses.find(c => c.id === activeCourseId);
                          const progress = calculateProgress(currentUser.id, activeCourseId);
                          const userEnroll = db.enrollments.find(e => e.student_id === currentUser.id && e.course_id === activeCourseId);

                          return (
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border border-amber-200 space-y-3">
                              <span className="font-bold text-amber-900 block text-xs">Apresiasi E-Sertifikat Kelulusan</span>
                              <div className="flex items-center justify-between text-[11px] text-slate-600">
                                <span>Progres Penilaian:</span>
                                <span className="font-bold text-emerald-800">{progress}% Lulus</span>
                              </div>
                              <div className="w-full bg-amber-200/55 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>

                              {progress === 100 && userEnroll ? (
                                <CertificateDownloader 
                                  studentName={currentUser.name} 
                                  courseTitle={courseObj?.title || "Seni Kaligrafi Naskhi"} 
                                  completionDate={new Date().toISOString()} 
                                  settings={db.settings}
                                />
                              ) : (
                                <p className="text-[10px] text-amber-800 leading-relaxed italic">
                                  *Sertifikat otomatis terbuka apabila semua tugas bab dinilai lulus (&gt;75) oleh Tutor Anda.
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Right View: Video contents and upload submissions */}
                      <div className="md:col-span-2 space-y-6">
                        {selectedLesson ? (
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5 text-sm">
                            
                            {/* Materials display */}
                            <div>
                              <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <span>BAB {selectedLesson.order_number} SILABUS MATERI</span>
                                <span>•</span>
                                <span className="uppercase text-emerald-700 font-mono font-bold">{selectedLesson.type}</span>
                              </div>
                              <h3 className="font-extrabold text-slate-900 text-lg mt-1">{selectedLesson.title}</h3>
                            </div>

                            {/* Embed Video display or Text modules */}
                            {selectedLesson.type === 'video' ? (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow border border-slate-300">
                                <iframe 
                                  width="100%" 
                                  height="100%" 
                                  src={selectedLesson.content} 
                                  title={selectedLesson.title} 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowFullScreen
                                  className="border-0"
                                />
                              </div>
                            ) : (
                              <div className="bg-white p-4 rounded-xl border border-slate-200 leading-relaxed text-slate-700">
                                <p className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-2">Instruksi Pembelajaran:</p>
                                <p className="whitespace-pre-line text-xs font-serif">{selectedLesson.content}</p>
                              </div>
                            )}

                            {/* Linked homework prompt */}
                            {(() => {
                              const assignment = db.assignments.find(a => a.lesson_id === selectedLesson.id);
                              if (!assignment) return null;

                              const studentSubmission = db.submissions.find(s => s.assignment_id === assignment.id && s.student_id === currentUser.id);

                              return (
                                <div className="border border-emerald-100 bg-white p-4 rounded-xl space-y-4">
                                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800 flex items-center gap-1">
                                      <FileText className="w-4 h-4 text-emerald-600" /> Lembar Tugas Mandiri (Lossless Format)
                                    </span>
                                    {studentSubmission ? (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        studentSubmission.status === 'graded' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {studentSubmission.status}
                                      </span>
                                    ) : (
                                      <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">Belum Dikumpul</span>
                                    )}
                                  </div>

                                  <div className="space-y-1 text-xs">
                                    <p className="font-bold text-slate-900">{assignment.title}</p>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 italic">{assignment.instruction_text}</p>
                                  </div>

                                  {/* Submission view logs if uploaded already */}
                                  {studentSubmission && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-semibold text-slate-500 mb-2">Berkas Tulisan Anda (Lossless):</p>
                                        <img src={studentSubmission.submitted_file_url} alt="Subm" className="h-32 object-contain bg-white rounded border border-slate-200" />
                                      </div>
                                      
                                      {studentSubmission.status === 'graded' && (
                                        <div className="space-y-2">
                                          <p className="font-semibold text-slate-500">Koreksi & Lembar Coretan Tutor:</p>
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-slate-500">Nilai Kelulusan:</span>
                                            <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded text-xs">{studentSubmission.grade} / 100</span>
                                          </div>
                                          {studentSubmission.feedback_file_url && (
                                            <a href={studentSubmission.feedback_file_url} target="_blank" rel="noreferrer" className="block">
                                              <img src={studentSubmission.feedback_file_url} alt="Feedback" className="h-20 object-contain bg-slate-900 rounded border border-red-300" />
                                              <span className="text-[9px] text-emerald-800 hover:underline mt-1 block">🔍 Klik untuk memperbesar file koreksian</span>
                                            </a>
                                          )}
                                          <p className="text-slate-700 bg-white p-2 rounded border border-slate-100 font-mono text-[11px] leading-relaxed">
                                            Feedback: "{studentSubmission.feedback_notes}"
                                          </p>
                                        </div>
                                      )}

                                      {studentSubmission.status === 'submitted' && (
                                        <div className="flex flex-col justify-center items-center text-center text-slate-500">
                                          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mb-1" />
                                          <p className="font-semibold text-[11px]">Tugas Sedang Ditinjau Tutor</p>
                                          <p className="text-[9px] opacity-75">Tutor akan menandai langsung di atas kanvas.</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* UPLOAD ACTION SECTION (drag-n-drop simulated simulator) */}
                                  <div className="bg-[#FAF9F8] border border-dashed border-slate-300 p-4 rounded-xl text-center text-xs space-y-3">
                                    <p className="font-bold text-slate-700">Simulasi Unggah Gambar Beresolusi Tinggi Lossless JPEG/PNG</p>
                                    
                                    {/* Preset Calligraphy file sample selectors */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5">
                                      {PREMIUM_KHAT_SAMPLES.map((s, i) => (
                                        <button
                                          key={i}
                                          id={`btn-sample-khat-${i}`}
                                          type="button"
                                          onClick={() => setSimulatedFileUrl(s.url)}
                                          className={`p-2 bg-white rounded border text-left transition-all group hover:border-emerald-500 cursor-pointer ${
                                            simulatedFileUrl === s.url ? 'border-emerald-600 ring-1 ring-emerald-600 font-bold' : 'border-slate-200'
                                          }`}
                                        >
                                          <img src={s.url} alt="sample" className="w-full h-10 object-cover rounded mb-1" />
                                          <span className="text-[10px] text-slate-600 block line-clamp-1">{s.name}</span>
                                        </button>
                                      ))}
                                    </div>

                                    {/* Custom Upload input support */}
                                    <div>
                                      <span className="text-[10px] text-slate-400 block mb-1">Atau masukkan URL / Base64 File Gambar Kaligrafi Lainnya:</span>
                                      <input 
                                        id="input-custom-file-url"
                                        type="text" 
                                        placeholder="data:image/png;base64,... atau https://..." 
                                        value={manualFileInput}
                                        onChange={(e) => {
                                          setManualFileInput(e.target.value);
                                          if (e.target.value) setSimulatedFileUrl(e.target.value);
                                        }}
                                        className="w-full bg-white border border-slate-200 p-1.5 rounded text-[11px]" 
                                      />
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Integrasi Cloud R2 (Lossless Image)
                                      </span>
                                      <button
                                        id={`btn-submit-hw-${assignment.id}`}
                                        onClick={() => handleSubmitAssignment(assignment.id)}
                                        disabled={uploadProgress !== null}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded transition cursor-pointer"
                                      >
                                        {uploadProgress !== null ? `Unggah berkas (${uploadProgress}%)` : 'Unggah Tugas Mandiri'}
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              );
                            })()}

                          </div>
                        ) : (
                          <p className="text-center py-10 bg-slate-50 text-slate-500 italic">Harap pilih materi di modul navigasi sebelah kiri.</p>
                        )}
                      </div>

                    </div>
                  )}

                  {/* 2. Siswa Transaksi list & Course purchasing options */}
                  {siswaTab === 'transaksi' && (
                    <div className="space-y-6">
                      
                      {/* Catalog selection */}
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">Katalog Kelas & Pelatihan Tersedia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {db.courses.map(c => {
                            // Check if student enrolled
                            const hasEnrolled = db.enrollments.find(e => e.student_id === currentUser.id && e.course_id === c.id);

                            return (
                              <div key={c.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 text-xs flex flex-col justify-between">
                                <img src={c.thumbnail_url} alt="Cover" className="w-full h-32 object-cover" />
                                <div className="p-4 space-y-2 flex-grow">
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase italic">Online LMS</span>
                                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{c.title}</h4>
                                  <p className="text-slate-600 leading-relaxed block text-[11px] line-clamp-3">{c.description}</p>
                                </div>
                                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                                  <span className="font-bold text-emerald-700 text-sm">Rp {c.price.toLocaleString()}</span>
                                  {hasEnrolled ? (
                                    <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded">Sudah Terdaftar</span>
                                  ) : (
                                    <div className="flex gap-1.5">
                                      {/* Midtrans Instant pay option button */}
                                      <button
                                        id={`btn-pay-midtrans-${c.id}`}
                                        onClick={() => handleCheckout(c.id, 'midtrans', null)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                                        title="Bulan ini aktif"
                                      >
                                        Snap (Gate)
                                      </button>
                                      
                                      {/* Manual upload bukti transfer */}
                                      <button
                                        id={`btn-pay-manual-${c.id}`}
                                        onClick={() => handleCheckout(c.id, 'manual', PREMIUM_KHAT_SAMPLES[2].url)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                                      >
                                        Unggah Bukti
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Purchased Courses Logs */}
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">Status Pembayaran Transaksi Anda:</h3>
                        <div className="space-y-3.5">
                          {db.transactions.filter(t => t.user_id === currentUser.id).map(tr => {
                            const matchingCourse = db.courses.find(c => c.id === tr.course_id);

                            return (
                              <div key={tr.id} className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-slate-400">ID: {tr.id}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      tr.status === 'paid' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {tr.status}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-slate-900 mt-1">{matchingCourse?.title}</h4>
                                  <p className="text-slate-600 mt-0.5">Biaya: <span className="font-bold text-slate-800">Rp {tr.amount.toLocaleString()}</span> • Metode: <span className="capitalize">{tr.payment_type}</span></p>
                                </div>

                                <div className="space-y-1 self-end sm:self-auto text-right">
                                  {tr.proof_url ? (
                                    <div className="inline-block text-right">
                                      <img src={tr.proof_url} alt="Proof" className="w-16 h-10 object-cover rounded border" />
                                      <span className="text-[9px] text-emerald-800 block mt-0.5">Sudah Lampirkan Bukti</span>
                                    </div>
                                  ) : (
                                    <span className="italic text-[10px] text-slate-400 block">Tidak melampirkan berkas</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              ) : null}

            </div>

          </main>
        </div>
      </div>

      {/* 4. FOOTER CREDITS */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm">Sekolah Kaligrafi Bait Khat</h5>
            <p className="leading-relaxed opacity-75">
              Pusat keahlian seni kaligrafi khat Islami modern terpadu di Indonesia. 
              Membangun peradaban seni lewat tulisan indah yang diawasi langsung oleh para Tutor bersertifikat.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm">Alokasi & Koordinat PDF</h5>
            <p className="leading-relaxed opacity-75">
              Dilengkapi generator sertifikat dinamis dengan overlay koordinat piksel, background queue job monitoring, 
              dan lossles upload detail tinggi.
            </p>
          </div>
          <div className="space-y-2.5">
            <h5 className="font-bold text-white text-sm">Status Server Antigravity</h5>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] bg-emerald-900/40 border border-emerald-800 text-emerald-300 font-mono py-1 px-2.5 rounded inline-block w-48">
                ● Koneksi database: PostgreSQL
              </span>
              <span className="text-[10px] bg-emerald-900/40 border border-emerald-800 text-emerald-300 font-mono py-1 px-2.5 rounded inline-block w-48">
                ● Object Storage: Cloudflare R2
              </span>
            </div>
            <p className="text-[10px] opacity-60">Sistem terkonfigurasi pada port 3000</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
