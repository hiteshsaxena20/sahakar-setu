# Shared Validators - Zod Schemas (TypeScript)
# These mirror the Pydantic models for frontend validation
# Generated from Pydantic via pydantic2ts or maintained manually

import { z } from "zod";

// ==========================================
// Enums
// ==========================================

export const InstitutionType = z.enum(["VAMNICOM", "RICM", "ICM"]);
export type InstitutionType = z.infer<typeof InstitutionType>;

export const NominationStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type NominationStatus = z.infer<typeof NominationStatus>;

export const ProgrammeStatus = z.enum(["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"]);
export type ProgrammeStatus = z.infer<typeof ProgrammeStatus>;

export const AssessmentType = z.enum(["MCQ", "SUBJECTIVE"]);
export type AssessmentType = z.infer<typeof AssessmentType>;

export const AttendanceMethod = z.enum(["FACE", "QR"]);
export type AttendanceMethod = z.infer<typeof AttendanceMethod>;

export const JobApplicationStatus = z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED", "ACCEPTED"]);
export type JobApplicationStatus = z.infer<typeof JobApplicationStatus>;

export const UserRole = z.enum(["ncct_admin", "institution_admin", "trainer", "trainee", "employer", "recruiter"]);
export type UserRole = z.infer<typeof UserRole>;


// ==========================================
// Base Schemas
// ==========================================

export const TimestampSchema = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Timestamp = z.infer<typeof TimestampSchema>;


// ==========================================
// ERP Schemas
// ==========================================

export const InstitutionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  type: InstitutionType,
  state: z.string(),
  district: z.string(),
  contact: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Institution = z.infer<typeof InstitutionSchema>;

export const ProgrammeSchema = z.object({
  _id: z.string(),
  institution_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  capacity: z.number().int().positive(),
  status: ProgrammeStatus.default("DRAFT"),
  nominee_count: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Programme = z.infer<typeof ProgrammeSchema>;

export const NominationSchema = z.object({
  _id: z.string(),
  programme_id: z.string(),
  nominating_body: z.string(),
  nominee_name: z.string(),
  nominee_phone: z.string(),
  nominee_email: z.string().email().optional(),
  nominee_district: z.string().optional(),
  nominee_pacs_id: z.string().optional(),
  status: NominationStatus.default("PENDING"),
  approved_by: z.string().optional(),
  approved_at: z.string().datetime().optional(),
  rejection_reason: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Nomination = z.infer<typeof NominationSchema>;

export const TraineeProfileSchema = z.object({
  name: z.string(),
  phone: z.string(),
  district: z.string(),
  pacs_id: z.string().optional(),
  skills: z.array(z.string()).default([]),
  education: z.string().optional(),
  experience_years: z.number().int().optional(),
});
export type TraineeProfile = z.infer<typeof TraineeProfileSchema>;

export const TraineeSchema = z.object({
  _id: z.string(),
  user_id: z.string(),
  institution_id: z.string(),
  profile: TraineeProfileSchema,
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Trainee = z.infer<typeof TraineeSchema>;

export const TrainerSchema = z.object({
  _id: z.string(),
  user_id: z.string(),
  institution_id: z.string(),
  specialization: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Trainer = z.infer<typeof TrainerSchema>;

export const TimetableSchema = z.object({
  _id: z.string(),
  programme_id: z.string(),
  date: z.string().datetime(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  topic: z.string(),
  trainer_id: z.string().optional(),
  room: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Timetable = z.infer<typeof TimetableSchema>;

export const HostelAllocationSchema = z.object({
  _id: z.string(),
  programme_id: z.string(),
  trainee_id: z.string(),
  room_no: z.string(),
  bed_no: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type HostelAllocation = z.infer<typeof HostelAllocationSchema>;


// ==========================================
// LMS Schemas
// ==========================================

export const CourseSchema = z.object({
  _id: z.string(),
  programme_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  language: z.string().default("en"),
  order: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Course = z.infer<typeof CourseSchema>;

export const ModuleSchema = z.object({
  _id: z.string(),
  course_id: z.string(),
  title: z.string(),
  video_url: z.string().url().optional(),
  document_url: z.string().url().optional(),
  order: z.number().int().default(0),
  duration_min: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Module = z.infer<typeof ModuleSchema>;

export const AssessmentSchema = z.object({
  _id: z.string(),
  module_id: z.string(),
  title: z.string(),
  type: AssessmentType.default("MCQ"),
  passing_score: z.number().int().min(0).max(100).default(60),
  time_limit: z.number().int().positive().default(30),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

export const QuestionSchema = z.object({
  _id: z.string(),
  assessment_id: z.string(),
  text: z.string(),
  options: z.array(z.string()).default([]),
  correct_answer: z.any(),
  explanation: z.string().optional(),
  language: z.string().default("en"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const EnrollmentSchema = z.object({
  _id: z.string(),
  trainee_id: z.string(),
  course_id: z.string(),
  progress: z.record(z.any()).default({}),
  completed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Enrollment = z.infer<typeof EnrollmentSchema>;

export const CertificateSchema = z.object({
  _id: z.string(),
  trainee_id: z.string(),
  programme_id: z.string(),
  course_id: z.string().optional(),
  issue_date: z.string().datetime(),
  certificate_number: z.string(),
  pdf_url: z.string().url().optional(),
  hash: z.string(),
  verification_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Certificate = z.infer<typeof CertificateSchema>;


// ==========================================
// Attendance Schemas
// ==========================================

export const AttendanceLogSchema = z.object({
  _id: z.string(),
  programme_id: z.string(),
  trainee_id: z.string(),
  method: AttendanceMethod,
  timestamp: z.string().datetime(),
  lat: z.number().optional(),
  long: z.number().optional(),
  verified: z.boolean().default(true),
  device_info: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type AttendanceLog = z.infer<typeof AttendanceLogSchema>;

export const FaceEmbeddingSchema = z.object({
  _id: z.string(),
  trainee_id: z.string(),
  embedding: z.array(z.number()),
  image_url: z.string().url().optional(),
  quality_score: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type FaceEmbedding = z.infer<typeof FaceEmbeddingSchema>;


// ==========================================
// Employment Schemas
// ==========================================

export const EmployerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  contact: z.record(z.any()),
  company_type: z.string(),
  verified: z.boolean().default(false),
  verified_by: z.string().optional(),
  verified_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Employer = z.infer<typeof EmployerSchema>;

export const JobPostingSchema = z.object({
  _id: z.string(),
  employer_id: z.string(),
  title: z.string(),
  description: z.string(),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  location: z.string(),
  stipend: z.record(z.any()).optional(),
  deadline: z.string().datetime(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type JobPosting = z.infer<typeof JobPostingSchema>;

export const JobApplicationSchema = z.object({
  _id: z.string(),
  trainee_id: z.string(),
  job_id: z.string(),
  status: JobApplicationStatus.default("APPLIED"),
  match_score: z.number().default(0),
  cover_letter: z.string().optional(),
  resume_url: z.string().url().optional(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type JobApplication = z.infer<typeof JobApplicationSchema>;

export const SkillProfileSchema = z.object({
  _id: z.string(),
  trainee_id: z.string(),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.record(z.any())).default([]),
  assessment_scores: z.array(z.record(z.any())).default([]),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
});
export type SkillProfile = z.infer<typeof SkillProfileSchema>;


// ==========================================
// AI/Analytics Schemas
// ==========================================

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatSessionSchema = z.object({
  _id: z.string(),
  trainee_id: z.string(),
  messages: z.array(ChatMessageSchema).default([]),
  context: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type ChatSession = z.infer<typeof ChatSessionSchema>;

export const EmbeddingDocumentSchema = z.object({
  _id: z.string(),
  content_type: z.string(),
  content_id: z.string(),
  embedding: z.array(z.number()),
  metadata: z.record(z.any()).default({}),
  text_content: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type EmbeddingDocument = z.infer<typeof EmbeddingDocumentSchema>;

export const AnalyticsEventSchema = z.object({
  _id: z.string(),
  event_type: z.string(),
  entity_id: z.string(),
  entity_type: z.string(),
  metadata: z.record(z.any()).default({}),
  timestamp: z.string().datetime(),
  created_at: z.string().datetime(),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;


// ==========================================
// API Common Schemas
// ==========================================

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    pages: z.number().int().nonnegative(),
  });
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodTypeAny>>>;

export const HealthResponseSchema = z.object({
  status: z.string().default("healthy"),
  service: z.string(),
  version: z.string().default("1.0.0"),
  timestamp: z.string().datetime(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;


// ==========================================
// AI Service Schemas
// ==========================================

export const QuizGenerationRequestSchema = z.object({
  content: z.string(),
  language: z.string().default("en"),
  num_questions: z.number().int().positive().max(50).default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  question_type: z.enum(["MCQ", "SUBJECTIVE"]).default("MCQ"),
});
export type QuizGenerationRequest = z.infer<typeof QuizGenerationRequestSchema>;

export const QuizGenerationResponseSchema = z.object({
  questions: z.array(z.record(z.any())),
  metadata: z.record(z.any()),
});
export type QuizGenerationResponse = z.infer<typeof QuizGenerationResponseSchema>;

export const SkillGapRequestSchema = z.object({
  trainee_id: z.string(),
  target_role: z.string(),
  target_skills: z.array(z.string()).optional(),
});
export type SkillGapRequest = z.infer<typeof SkillGapRequestSchema>;

export const SkillGapResponseSchema = z.object({
  missing_skills: z.array(z.string()),
  recommended_courses: z.array(z.record(z.any())),
  skill_match_percentage: z.number(),
});
export type SkillGapResponse = z.infer<typeof SkillGapResponseSchema>;

export const JobMatchRequestSchema = z.object({
  job_id: z.string(),
  top_k: z.number().int().positive().default(10),
});
export type JobMatchRequest = z.infer<typeof JobMatchRequestSchema>;

export const JobMatchResponseSchema = z.object({
  ranked_candidates: z.array(z.record(z.any())),
});
export type JobMatchResponse = z.infer<typeof JobMatchResponseSchema>;

export const ChatRequestSchema = z.object({
  trainee_id: z.string(),
  message: z.string(),
  context: z.record(z.any()).optional(),
  language: z.string().default("en"),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  response: z.string(),
  sources: z.array(z.record(z.any())).default([]),
  session_id: z.string(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const EmbeddingRequestSchema = z.object({
  texts: z.array(z.string()),
  content_type: z.string(),
  metadata: z.array(z.record(z.any())).optional(),
});
export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>;

export const EmbeddingResponseSchema = z.object({
  embeddings: z.array(z.array(z.number())),
  ids: z.array(z.string()),
});
export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;


// ==========================================
// Attendance API Schemas
// ==========================================

export const FaceAttendanceRequestSchema = z.object({
  programme_id: z.string(),
  image_base64: z.string(),
  trainee_id: z.string().optional(),
});
export type FaceAttendanceRequest = z.infer<typeof FaceAttendanceRequestSchema>;

export const QRAttendanceRequestSchema = z.object({
  programme_id: z.string(),
  qr_code: z.string(),
  lat: z.number().optional(),
  long: z.number().optional(),
});
export type QRAttendanceRequest = z.infer<typeof QRAttendanceRequestSchema>;

export const AttendanceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  attendance_id: z.string().optional(),
  trainee: z.record(z.any()).optional(),
});
export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;


// ==========================================
// Export all
// ==========================================

export const schemas = {
  Institution: InstitutionSchema,
  Programme: ProgrammeSchema,
  Nomination: NominationSchema,
  TraineeProfile: TraineeProfileSchema,
  Trainee: TraineeSchema,
  Trainer: TrainerSchema,
  Timetable: TimetableSchema,
  HostelAllocation: HostelAllocationSchema,
  Course: CourseSchema,
  Module: ModuleSchema,
  Assessment: AssessmentSchema,
  Question: QuestionSchema,
  Enrollment: EnrollmentSchema,
  Certificate: CertificateSchema,
  AttendanceLog: AttendanceLogSchema,
  FaceEmbedding: FaceEmbeddingSchema,
  Employer: EmployerSchema,
  JobPosting: JobPostingSchema,
  JobApplication: JobApplicationSchema,
  SkillProfile: SkillProfileSchema,
  ChatMessage: ChatMessageSchema,
  ChatSession: ChatSessionSchema,
  EmbeddingDocument: EmbeddingDocumentSchema,
  AnalyticsEvent: AnalyticsEventSchema,
  PaginationParams: PaginationParamsSchema,
  HealthResponse: HealthResponseSchema,
  QuizGenerationRequest: QuizGenerationRequestSchema,
  QuizGenerationResponse: QuizGenerationResponseSchema,
  SkillGapRequest: SkillGapRequestSchema,
  SkillGapResponse: SkillGapResponseSchema,
  JobMatchRequest: JobMatchRequestSchema,
  JobMatchResponse: JobMatchResponseSchema,
  ChatRequest: ChatRequestSchema,
  ChatResponse: ChatResponseSchema,
  EmbeddingRequest: EmbeddingRequestSchema,
  EmbeddingResponse: EmbeddingResponseSchema,
  FaceAttendanceRequest: FaceAttendanceRequestSchema,
  QRAttendanceRequest: QRAttendanceRequestSchema,
  AttendanceResponse: AttendanceResponseSchema,
};