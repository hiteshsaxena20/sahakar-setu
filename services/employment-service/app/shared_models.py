# Shared Types - Pydantic Models (Source of Truth)
# These are used by all FastAPI services
# TypeScript interfaces are generated from these via pydantic2ts

from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, EmailStr
from beanie import Document, Indexed
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT


# ==========================================
# Enums
# ==========================================

class InstitutionType(str, Enum):
    VAMNICOM = "VAMNICOM"
    RICM = "RICM"
    ICM = "ICM"

class NominationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ProgrammeStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class AssessmentType(str, Enum):
    MCQ = "MCQ"
    SUBJECTIVE = "SUBJECTIVE"

class AttendanceMethod(str, Enum):
    FACE = "FACE"
    QR = "QR"

class JobApplicationStatus(str, Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    OFFERED = "OFFERED"
    REJECTED = "REJECTED"
    ACCEPTED = "ACCEPTED"

class UserRole(str, Enum):
    NCCT_ADMIN = "ncct_admin"
    INSTITUTION_ADMIN = "institution_admin"
    TRAINER = "trainer"
    TRAINEE = "trainee"
    EMPLOYER = "employer"
    RECRUITER = "recruiter"


# ==========================================
# Base Models
# ==========================================

class BaseDocument(Document):
    class Settings:
        use_state_management = True

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ==========================================
# ERP Models
# ==========================================

class Institution(BaseDocument):
    name: str
    type: InstitutionType
    state: str
    district: str
    contact: Optional[Dict[str, Any]] = None  # phone, email, address
    is_active: bool = True

    class Settings:
        name = "institutions"
        indexes = [
            IndexModel([("type", ASCENDING), ("state", ASCENDING), ("district", ASCENDING)]),
            IndexModel([("name", TEXT)]),
        ]


class Programme(BaseDocument):
    institution_id: str
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    capacity: int
    status: ProgrammeStatus = ProgrammeStatus.DRAFT
    nominee_count: int = 0

    class Settings:
        name = "programmes"
        indexes = [
            IndexModel([("institution_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("start_date", ASCENDING), ("end_date", ASCENDING)]),
            IndexModel([("title", TEXT)]),
        ]


class Nomination(BaseDocument):
    programme_id: str
    nominating_body: str  # State Cooperative Department, etc.
    nominee_name: str
    nominee_phone: str
    nominee_email: Optional[EmailStr] = None
    nominee_district: Optional[str] = None
    nominee_pacs_id: Optional[str] = None
    status: NominationStatus = NominationStatus.PENDING
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Settings:
        name = "nominations"
        indexes = [
            IndexModel([("programme_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("nominee_phone", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]


class TraineeProfile(BaseModel):
    name: str
    phone: str
    district: str
    pacs_id: Optional[str] = None
    skills: List[str] = []
    education: Optional[str] = None
    experience_years: Optional[int] = None


class Trainee(BaseDocument):
    user_id: str  # Keycloak user ID
    institution_id: str
    profile: TraineeProfile
    is_active: bool = True

    class Settings:
        name = "trainees"
        indexes = [
            IndexModel([("user_id", ASCENDING)], unique=True),
            IndexModel([("institution_id", ASCENDING)]),
            IndexModel([("profile.pacs_id", ASCENDING)]),
            IndexModel([("profile.district", ASCENDING)]),
        ]


class Trainer(BaseDocument):
    user_id: str
    institution_id: str
    specialization: List[str] = []
    is_active: bool = True

    class Settings:
        name = "trainers"
        indexes = [
            IndexModel([("user_id", ASCENDING)], unique=True),
            IndexModel([("institution_id", ASCENDING)]),
        ]


class Timetable(BaseDocument):
    programme_id: str
    date: datetime
    start_time: str  # HH:MM format
    end_time: str
    topic: str
    trainer_id: Optional[str] = None
    room: Optional[str] = None

    class Settings:
        name = "timetables"
        indexes = [
            IndexModel([("programme_id", ASCENDING), ("date", ASCENDING)]),
            IndexModel([("trainer_id", ASCENDING), ("date", ASCENDING)]),
        ]


class HostelAllocation(BaseDocument):
    programme_id: str
    trainee_id: str
    room_no: str
    bed_no: str

    class Settings:
        name = "hostelAllocations"
        indexes = [
            IndexModel([("programme_id", ASCENDING), ("trainee_id", ASCENDING)], unique=True),
        ]


# ==========================================
# LMS Models
# ==========================================

class Course(BaseDocument):
    programme_id: str
    title: str
    description: Optional[str] = None
    language: str = "en"  # en, hi, ta, te
    order: int = 0

    class Settings:
        name = "courses"
        indexes = [
            IndexModel([("programme_id", ASCENDING), ("order", ASCENDING)]),
            IndexModel([("language", ASCENDING)]),
        ]


class Module(BaseDocument):
    course_id: str
    title: str
    video_url: Optional[str] = None
    document_url: Optional[str] = None
    order: int = 0
    duration_min: int = 0

    class Settings:
        name = "modules"
        indexes = [
            IndexModel([("course_id", ASCENDING), ("order", ASCENDING)]),
        ]


class Assessment(BaseDocument):
    module_id: str
    title: str
    type: AssessmentType = AssessmentType.MCQ
    passing_score: int = 60  # percentage
    time_limit: int = 30  # minutes

    class Settings:
        name = "assessments"
        indexes = [
            IndexModel([("module_id", ASCENDING)]),
        ]


class Question(BaseDocument):
    assessment_id: str
    text: str
    options: List[str] = []  # For MCQ
    correct_answer: Any  # string for MCQ, text for subjective
    explanation: Optional[str] = None
    language: str = "en"

    class Settings:
        name = "questions"
        indexes = [
            IndexModel([("assessment_id", ASCENDING)]),
        ]


class Enrollment(BaseDocument):
    trainee_id: str
    course_id: str
    progress: Dict[str, Any] = {}  # module_id -> completion %
    completed_at: Optional[datetime] = None

    class Settings:
        name = "enrollments"
        indexes = [
            IndexModel([("trainee_id", ASCENDING), ("course_id", ASCENDING)], unique=True),
            IndexModel([("trainee_id", ASCENDING)]),
        ]


class Certificate(BaseDocument):
    trainee_id: str
    programme_id: str
    course_id: Optional[str] = None
    issue_date: datetime = Field(default_factory=datetime.utcnow)
    certificate_number: str  # Unique, e.g., "NCCT-2024-VAM-00123"
    pdf_url: Optional[str] = None
    hash: str  # SHA256 for verification
    verification_url: Optional[str] = None  # Public verify endpoint

    class Settings:
        name = "certificates"
        indexes = [
            IndexModel([("trainee_id", ASCENDING)]),
            IndexModel([("programme_id", ASCENDING)]),
            IndexModel([("certificate_number", ASCENDING)], unique=True),
            IndexModel([("hash", ASCENDING)], unique=True),
        ]


# ==========================================
# Attendance Models
# ==========================================

class AttendanceLog(BaseDocument):
    programme_id: str
    trainee_id: str
    method: AttendanceMethod
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    lat: Optional[float] = None
    long: Optional[float] = None
    verified: bool = True
    device_info: Optional[Dict[str, Any]] = None

    class Settings:
        name = "attendanceLogs"
        indexes = [
            IndexModel([("programme_id", ASCENDING), ("trainee_id", ASCENDING), ("timestamp", DESCENDING)]),
            IndexModel([("trainee_id", ASCENDING), ("timestamp", DESCENDING)]),
            IndexModel([("method", ASCENDING)]),
        ]


class FaceEmbedding(BaseDocument):
    trainee_id: str
    embedding: List[float]  # 128-dim from face_recognition
    image_url: Optional[str] = None
    quality_score: Optional[float] = None

    class Settings:
        name = "faceEmbeddings"
        indexes = [
            IndexModel([("trainee_id", ASCENDING)]),
        ]


# ==========================================
# Employment Models
# ==========================================

class Employer(BaseDocument):
    name: str
    contact: Dict[str, Any]  # email, phone, address, website
    company_type: str  # cooperative, corporate, government, ngo
    verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None

    class Settings:
        name = "employers"
        indexes = [
            IndexModel([("verified", ASCENDING)]),
            IndexModel([("name", TEXT)]),
        ]


class JobPosting(BaseDocument):
    employer_id: str
    title: str
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    location: str
    stipend: Optional[Dict[str, Any]] = None  # amount, currency, period
    deadline: datetime
    is_active: bool = True

    class Settings:
        name = "jobPostings"
        indexes = [
            IndexModel([("employer_id", ASCENDING), ("deadline", ASCENDING)]),
            IndexModel([("location", ASCENDING)]),
            IndexModel([("required_skills", ASCENDING)]),
            IndexModel([("title", TEXT), ("description", TEXT)]),
        ]


class JobApplication(BaseDocument):
    trainee_id: str
    job_id: str
    status: JobApplicationStatus = JobApplicationStatus.APPLIED
    match_score: float = 0.0
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Settings:
        name = "jobApplications"
        indexes = [
            IndexModel([("trainee_id", ASCENDING), ("job_id", ASCENDING)], unique=True),
            IndexModel([("job_id", ASCENDING), ("match_score", DESCENDING)]),
            IndexModel([("status", ASCENDING)]),
        ]


class SkillProfile(BaseDocument):
    trainee_id: str
    skills: List[str] = []
    certifications: List[Dict[str, Any]] = []  # certificate_id, title, issue_date
    assessment_scores: List[Dict[str, Any]] = []  # assessment_id, score, date
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "skillProfiles"
        indexes = [
            IndexModel([("trainee_id", ASCENDING)], unique=True),
            IndexModel([("skills", ASCENDING)]),
            IndexModel([("updated_at", DESCENDING)]),
        ]


# ==========================================
# AI / Analytics Models
# ==========================================

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None


class ChatSession(BaseDocument):
    trainee_id: str
    messages: List[ChatMessage] = []
    context: Optional[Dict[str, Any]] = None  # programme_id, course_id, etc.

    class Settings:
        name = "chatSessions"
        indexes = [
            IndexModel([("trainee_id", ASCENDING), ("created_at", DESCENDING)]),
        ]


class EmbeddingDocument(BaseDocument):
    content_type: str  # "scheme", "faq", "course", "job"
    content_id: str
    embedding: List[float]  # 384-dim (sentence-transformers) or 1536-dim (OpenAI)
    metadata: Dict[str, Any] = {}  # title, language, tags, etc.
    text_content: str  # Original text for reference

    class Settings:
        name = "embeddings"
        indexes = [
            IndexModel([("content_type", ASCENDING), ("content_id", ASCENDING)]),
        ]


class AnalyticsEvent(BaseDocument):
    event_type: str  # "enrollment", "completion", "attendance", "application", "placement"
    entity_id: str
    entity_type: str  # "trainee", "programme", "course", "job"
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "analyticsEvents"
        indexes = [
            IndexModel([("event_type", ASCENDING), ("timestamp", DESCENDING)]),
            IndexModel([("entity_type", ASCENDING), ("entity_id", ASCENDING)]),
            IndexModel([("timestamp", DESCENDING)]),
        ]


# ==========================================
# Request/Response Models (API)
# ==========================================

class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20
    sort_by: Optional[str] = None
    sort_order: Literal["asc", "desc"] = "desc"


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ==========================================
# AI Service Models
# ==========================================

class QuizGenerationRequest(BaseModel):
    content: str  # PDF text or uploaded document content
    language: str = "en"
    num_questions: int = 10
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    question_type: Literal["MCQ", "SUBJECTIVE"] = "MCQ"


class QuizGenerationResponse(BaseModel):
    questions: List[Dict[str, Any]]  # Generated questions
    metadata: Dict[str, Any]


class SkillGapRequest(BaseModel):
    trainee_id: str
    target_role: str
    target_skills: Optional[List[str]] = None


class SkillGapResponse(BaseModel):
    missing_skills: List[str]
    recommended_courses: List[Dict[str, Any]]
    skill_match_percentage: float


class JobMatchRequest(BaseModel):
    job_id: str
    top_k: int = 10


class JobMatchResponse(BaseModel):
    ranked_candidates: List[Dict[str, Any]]  # trainee_id, name, match_score, skills


class ChatRequest(BaseModel):
    trainee_id: str
    message: str
    context: Optional[Dict[str, Any]] = None
    language: str = "en"


class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = []
    session_id: str


class EmbeddingRequest(BaseModel):
    texts: List[str]
    content_type: str
    metadata: Optional[List[Dict[str, Any]]] = None


class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    ids: List[str]


# ==========================================
# Attendance Models
# ==========================================

class FaceAttendanceRequest(BaseModel):
    programme_id: str
    image_base64: str  # Base64 encoded image
    trainee_id: Optional[str] = None  # If not provided, identify from face


class QRAttendanceRequest(BaseModel):
    programme_id: str
    qr_code: str  # Decoded QR content
    lat: Optional[float] = None
    long: Optional[float] = None


class AttendanceResponse(BaseModel):
    success: bool
    message: str
    attendance_id: Optional[str] = None
    trainee: Optional[Dict[str, Any]] = None


# ==========================================
# Export all models
# ==========================================

__all__ = [
    # Enums
    "InstitutionType",
    "NominationStatus",
    "ProgrammeStatus",
    "AssessmentType",
    "AttendanceMethod",
    "JobApplicationStatus",
    "UserRole",
    # Base
    "BaseDocument",
    "TimestampMixin",
    # ERP
    "Institution",
    "Programme",
    "Nomination",
    "TraineeProfile",
    "Trainee",
    "Trainer",
    "Timetable",
    "HostelAllocation",
    # LMS
    "Course",
    "Module",
    "Assessment",
    "Question",
    "Enrollment",
    "Certificate",
    # Attendance
    "AttendanceLog",
    "FaceEmbedding",
    # Employment
    "Employer",
    "JobPosting",
    "JobApplication",
    "SkillProfile",
    # AI/Analytics
    "ChatMessage",
    "ChatSession",
    "EmbeddingDocument",
    "AnalyticsEvent",
    # API
    "PaginationParams",
    "PaginatedResponse",
    "HealthResponse",
    # AI Service
    "QuizGenerationRequest",
    "QuizGenerationResponse",
    "SkillGapRequest",
    "SkillGapResponse",
    "JobMatchRequest",
    "JobMatchResponse",
    "ChatRequest",
    "ChatResponse",
    "EmbeddingRequest",
    "EmbeddingResponse",
    # Attendance
    "FaceAttendanceRequest",
    "QRAttendanceRequest",
    "AttendanceResponse",
]