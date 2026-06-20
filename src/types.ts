export type UserRole = 'super_admin' | 'admin_cabang' | 'tutor' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  branch_id: string | null;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
}

export type CourseType = 'reguler_offline' | 'online_lms' | 'lomba_event';

export interface Course {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  price: number;
  thumbnail_url: string;
  is_published: boolean;
}

export type LessonType = 'video' | 'audio' | 'text' | 'pdf' | 'link';

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type: LessonType;
  content: string; // URL or Text
  order_number: number;
}

export type EnrollmentStatus = 'pending' | 'active' | 'completed';

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  tutor_id: string | null;
  status: EnrollmentStatus;
}

export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  instruction_text: string;
  is_exam: boolean;
}

export type SubmissionStatus = 'submitted' | 'graded' | 'revised';

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_file_url: string; // base64 or URL
  status: SubmissionStatus;
  grade: number | null;
  feedback_file_url: string | null;
  feedback_notes: string | null;
}

export type PaymentType = 'midtrans' | 'manual';
export type TransactionStatus = 'unpaid' | 'pending_verification' | 'paid' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  payment_type: PaymentType;
  status: TransactionStatus;
  proof_url: string | null; // Proof of payment (base64)
  midtrans_snap_token: string | null;
}

export type FinanceType = 'income' | 'expense' | 'payroll';

export interface Finance {
  id: string;
  branch_id: string | null;
  type: FinanceType;
  amount: number;
  description: string;
  transaction_date: string; // ISO date string
}

export interface SystemSettings {
  payment_gateway_active: boolean;
  certificate_template_url: string; // blank certificate base64 or SVG
  cert_coord_name: { x: number; y: number; font_size: number; font_color: string };
  cert_coord_course: { x: number; y: number; font_size: number; font_color: string };
  cert_coord_date: { x: number; y: number; font_size: number; font_color: string };
}
