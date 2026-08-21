// Multi-Tenant School SaaS Core Types

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';

export type SchoolStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export type DocType = 
  | 'MARKSHEET'
  | 'CERTIFICATE'
  | 'TRANSFER_CERTIFICATE'
  | 'BONAFIDE_CERTIFICATE'
  | 'CHARACTER_CERTIFICATE'
  | 'ADMIT_CARD'
  | 'ID_CARD'
  | 'ACHIEVEMENT_CERTIFICATE'
  | 'FEE_RECEIPT'
  | 'CUSTOM_DOCUMENT';

export type DocStatus = 'VALID' | 'REVOKED';

export type AdmissionStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: UserRole;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  max_students: number;
  max_teachers: number;
  max_storage_mb: number;
  features: {
    qr_verification: boolean;
    custom_templates: boolean;
    bulk_documents: boolean;
    sms_alerts: boolean;
    white_label: boolean;
    custom_domain?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  principal_name: string;
  principal_photo_url?: string | null;
  principal_signature_url?: string | null;
  stamp_url?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  admission_banner_url?: string | null;
  announcement_banner_url?: string | null;
  header_banner_url?: string | null;
  certificate_bg_url?: string | null;
  marksheet_bg_url?: string | null;
  tagline?: string | null;
  established_year?: string | number | null;
  school_type?: string | null;
  academic_pattern?: string | null;
  classes_offered?: string | null;
  facebook_url?: string | null;
  about?: string | null;
  website?: string | null;
  status: SchoolStatus;
  subscription_plan_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  user_id: string;
  role: UserRole;
  status: string;
  created_at: string;
  profile?: Profile;
  school?: School;
}

export interface GradeScale {
  grade: string;
  min_percentage: number;
  max_percentage: number;
  gpa: number;
  description: string;
}

export interface NumberingPatterns {
  marksheet_pattern: string; // e.g. "{CLASS}/{YEAR}/MS-{SEQ}"
  certificate_pattern: string; // e.g. "{CLASS}/{YEAR}/{SEQ}"
  admit_card_pattern: string; // e.g. "AC/{CLASS}/{YEAR}/{SEQ}"
  id_card_pattern: string; // e.g. "ID/{YEAR}/{ROLL}"
  current_sequence: number;
}

export interface SchoolSettings {
  school_id: string;
  grading_system: GradeScale[];
  attendance_type: 'daily' | 'subject';
  currency_symbol: string;
  timezone: string;
  date_format: string;
  theme_color: string;
  custom_domain?: string | null;
  numbering_patterns?: NumberingPatterns;
  default_certificate_body?: string;
  default_marksheet_remarks?: string;
  updated_at: string;
}

export interface AcademicSession {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  school_id: string;
  name: string;
  numeric_grade?: number | null;
  class_teacher_id?: string | null;
  class_teacher_name?: string | null;
  created_at: string;
}

export interface Section {
  id: string;
  school_id: string;
  class_id: string;
  name: string;
  room_no?: string | null;
  capacity: number;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  type: 'theory' | 'practical' | 'both';
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  user_id?: string | null;
  employee_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  qualification?: string | null;
  phone: string;
  email: string;
  joining_date: string;
  photo_url?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface TeacherAllocation {
  id: string;
  school_id: string;
  teacher_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  created_at: string;
  teacher?: Teacher;
  class_name?: string;
  section_name?: string;
  subject_name?: string;
}

export interface Student {
  id: string;
  school_id: string;
  user_id?: string | null;
  admission_number: string;
  roll_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group?: string | null;
  photo_url?: string | null;
  father_name: string;
  mother_name: string;
  guardian_name?: string | null;
  parent_phone: string;
  parent_email?: string | null;
  address: string;
  city: string;
  state: string;
  current_class_id?: string | null;
  current_section_id?: string | null;
  current_session_id?: string | null;
  admission_date: string;
  status: 'active' | 'inactive' | 'archived' | 'graduated';
  created_at: string;
  updated_at: string;
  // Joins
  class_name?: string;
  section_name?: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  section_id?: string | null;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
  marked_by?: string | null;
  created_at: string;
  student?: Student;
}

export interface FeeStructure {
  id: string;
  school_id: string;
  session_id: string;
  class_id?: string | null;
  title: string;
  amount: number;
  due_date: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  created_at: string;
  class_name?: string;
}

export interface FeePayment {
  id: string;
  school_id: string;
  student_id: string;
  fee_structure_id?: string | null;
  receipt_no: string;
  amount_paid: number;
  discount: number;
  fine: number;
  payment_method: 'Cash' | 'Bank Transfer' | 'Card' | 'UPI' | 'Cheque';
  transaction_ref?: string | null;
  payment_date: string;
  status: 'paid' | 'partial' | 'pending';
  received_by?: string | null;
  remarks?: string | null;
  created_at: string;
  student?: Student;
  fee_title?: string;
}

export interface Exam {
  id: string;
  school_id: string;
  session_id: string;
  name: string;
  exam_type: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  created_at: string;
}

export interface ExamSubject {
  id: string;
  school_id: string;
  exam_id: string;
  class_id: string;
  subject_id: string;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  max_theory_marks: number;
  max_practical_marks: number;
  pass_marks: number;
  created_at: string;
  subject_name?: string;
  subject_code?: string;
  class_name?: string;
}

export interface MarkRecord {
  id: string;
  school_id: string;
  exam_subject_id: string;
  student_id: string;
  theory_marks: number;
  practical_marks: number;
  total_marks: number;
  grade?: string | null;
  remarks?: string | null;
  is_absent: boolean;
  created_at: string;
  student?: Student;
}

export interface ExamResult {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  class_id: string;
  total_max_marks: number;
  total_obtained_marks: number;
  percentage: number;
  gpa?: number | null;
  grade: string;
  result_status: 'PASS' | 'FAIL' | 'COMPARTMENT';
  rank_in_class?: number | null;
  remarks?: string | null;
  created_at: string;
  student?: Student;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocType;
  description?: string | null;
  thumbnail_url?: string | null;
  html_content: string;
  css_content: string;
  variables: string[];
  page_size: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'ID_CARD_PORTRAIT' | 'ID_CARD_LANDSCAPE' | 'CUSTOM';
  orientation: 'portrait' | 'landscape';
  version: number;
  is_system: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolTemplate {
  id: string;
  school_id: string;
  category: DocType;
  template_id: string;
  custom_html?: string | null;
  custom_css?: string | null;
  custom_config: Record<string, any>;
  is_active: boolean;
  updated_at: string;
  template?: DocumentTemplate;
}

export interface GeneratedDocument {
  id: string;
  school_id: string;
  student_id?: string | null;
  template_id?: string | null;
  doc_type: DocType;
  certificate_no: string;
  verification_code: string;
  title: string;
  metadata: Record<string, any>;
  file_url?: string | null;
  status: DocStatus;
  issued_by?: string | null;
  issued_at: string;
  created_at?: string;
  revoked_at?: string | null;
  revocation_reason?: string | null;
  student?: Student;
  school?: School;
}

export interface DocumentVerification {
  id: string;
  verification_code: string;
  document_id: string;
  school_id: string;
  verified_count: number;
  last_verified_at?: string | null;
}

export interface AdmissionApplication {
  id: string;
  school_id: string;
  application_no: string;
  receipt_no?: string;
  exam_name?: string;
  academic_year?: string;
  subjects?: string[];
  is_verified?: boolean;
  verified_at?: string;
  rejection_reason?: string;
  student_name: string;
  dob: string;
  gender: string;
  applying_class_id?: string | null;
  previous_school?: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email?: string | null;
  address?: string | null;
  documents?: { name: string; url: string }[];
  status: AdmissionStatus;
  notes?: string | null;
  created_at: string;
  class_name?: string;
}

export interface Notice {
  id: string;
  school_id: string;
  title: string;
  content: string;
  category?: 'ACADEMIC' | 'EXAM' | 'ADMISSION' | 'HOLIDAY' | 'EVENTS' | 'GENERAL' | string;
  attachment_url?: string | null;
  target_role: 'ALL' | 'TEACHER' | 'STUDENT' | 'PARENT';
  class_id?: string | null;
  publish_date: string;
  expiry_date?: string | null;
  is_pinned: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface Homework {
  id: string;
  school_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  teacher_id?: string | null;
  title: string;
  description: string;
  attachment_url?: string | null;
  assigned_date: string;
  due_date: string;
  created_at: string;
  class_name?: string;
  section_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

export interface TimetableEntry {
  id: string;
  school_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  teacher_id?: string | null;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period_number: number;
  start_time: string;
  end_time: string;
  room_no?: string | null;
  subject_name?: string;
  teacher_name?: string;
}

export interface AuditLog {
  id: string;
  school_id?: string | null;
  user_id?: string | null;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export type ExamLinkType = 'ADMIT_CARD_FORM' | 'ADMIT_CARD_DOWNLOAD' | 'RESULT_PORTAL' | 'CERTIFICATE_RECORDS';

export interface PublishableExamLink {
  id: string;
  school_id: string;
  title: string;
  slug: string;
  link_type: ExamLinkType;
  academic_year: string;
  exam_name: string;
  description: string;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  target_classes?: string[];
  admit_cards_issued?: boolean;
  results_published?: boolean;
  certificates_issued?: boolean;
  exam_center?: string;
  instructions?: string[];
  created_at: string;
  applications_count?: number;
}

export interface ExamApplication {
  id: string;
  link_id: string;
  school_id: string;
  student_id?: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  gender: string;
  class_name: string;
  section_name: string;
  roll_number: string;
  admission_number: string;
  contact_phone: string;
  address: string;
  photo_url?: string;
  application_no: string;
  receipt_no?: string;
  exam_name?: string;
  academic_year?: string;
  subjects?: string[];
  is_verified?: boolean;
  verified_at?: string;
  rejection_reason?: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'ADMIT_CARD_ISSUED' | 'REJECTED';
  admit_card_no?: string;
  submitted_at: string;
}
