# Combined Backend Service — all 6 microservices unified into one FastAPI app
# Routes: /erp/*, /lms/*, /attendance/*, /employment/*, /analytics/*, /ai/*

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx
import uuid
import json
import hashlib
import hmac
import io
import base64

# Import ALL document models
from app.shared_models import (
    # ERP
    Institution, Programme, Nomination, Trainee, Trainer,
    Timetable, HostelAllocation,
    InstitutionType, NominationStatus, ProgrammeStatus,
    # LMS
    Course, Module, Assessment, Question, Enrollment, Certificate,
    AssessmentType,
    # Attendance
    AttendanceLog, FaceEmbedding, AttendanceMethod,
    # Employment
    Employer, JobPosting, JobApplication, SkillProfile,
    JobApplicationStatus,
    # Analytics
    AnalyticsEvent,
    # AI
    EmbeddingDocument, ChatSession, ChatMessage,
    # Shared
    PaginationParams, PaginatedResponse, HealthResponse,
)

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
PORT = int(os.getenv("PORT", "8000"))

ALL_DOCUMENT_MODELS = [
    Institution, Programme, Nomination, Trainee, Trainer, Timetable, HostelAllocation,
    Course, Module, Assessment, Question, Enrollment, Certificate,
    AttendanceLog, FaceEmbedding,
    Employer, JobPosting, JobApplication, SkillProfile,
    AnalyticsEvent,
    EmbeddingDocument, ChatSession,
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(database=db, document_models=ALL_DOCUMENT_MODELS)
    app.state.db = db
    app.state.client = client
    print(f"[combined-backend] Connected to MongoDB: {MONGO_DB}")
    yield
    client.close()


app = FastAPI(
    title="Sahakar Setu — Combined Backend",
    description="All microservices unified: ERP, LMS, Attendance, Employment, Analytics, AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "combined-backend", "timestamp": datetime.utcnow().isoformat()}


# ══════════════════════════════════════════════════════════════════════════════
# ERP ROUTES  (prefix: /institutions, /programmes, /nominations, /trainees, etc.)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/institutions", response_model=Institution, status_code=201)
async def create_institution(inst: Institution):
    await inst.insert(); return inst

@app.get("/institutions")
async def list_institutions(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                            type: Optional[InstitutionType] = None, state: Optional[str] = None, district: Optional[str] = None):
    q = {}
    if type: q["type"] = type
    if state: q["state"] = state
    if district: q["district"] = district
    total = await Institution.find(q).count()
    items = await Institution.find(q).sort(-Institution.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/institutions/{iid}", response_model=Institution)
async def get_institution(iid: str):
    i = await Institution.get(iid)
    if not i: raise HTTPException(404, "Institution not found")
    return i

@app.put("/institutions/{iid}", response_model=Institution)
async def update_institution(iid: str, data: dict):
    i = await Institution.get(iid)
    if not i: raise HTTPException(404, "Institution not found")
    for k,v in data.items():
        if hasattr(i,k) and k not in ["_id","created_at"]: setattr(i,k,v)
    i.updated_at = datetime.utcnow(); await i.save(); return i

@app.delete("/institutions/{iid}", status_code=204)
async def delete_institution(iid: str):
    i = await Institution.get(iid)
    if not i: raise HTTPException(404, "Institution not found")
    await i.delete()

# Programmes
@app.post("/programmes", response_model=Programme, status_code=201)
async def create_programme(p: Programme):
    await p.insert(); return p

@app.get("/programmes")
async def list_programmes(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                          institution_id: Optional[str] = None, status: Optional[ProgrammeStatus] = None):
    q = {}
    if institution_id: q["institution_id"] = institution_id
    if status: q["status"] = status
    total = await Programme.find(q).count()
    items = await Programme.find(q).sort(-Programme.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/programmes/{pid}", response_model=Programme)
async def get_programme(pid: str):
    p = await Programme.get(pid)
    if not p: raise HTTPException(404, "Programme not found")
    return p

@app.put("/programmes/{pid}", response_model=Programme)
async def update_programme(pid: str, data: dict):
    p = await Programme.get(pid)
    if not p: raise HTTPException(404, "Programme not found")
    for k,v in data.items():
        if hasattr(p,k) and k not in ["_id","created_at"]: setattr(p,k,v)
    p.updated_at = datetime.utcnow(); await p.save(); return p

@app.post("/programmes/{pid}/publish", response_model=Programme)
async def publish_programme(pid: str):
    p = await Programme.get(pid)
    if not p: raise HTTPException(404, "Programme not found")
    p.status = ProgrammeStatus.PUBLISHED; p.updated_at = datetime.utcnow(); await p.save(); return p

# Nominations
@app.post("/nominations", response_model=Nomination, status_code=201)
async def create_nomination(n: Nomination):
    prog = await Programme.get(n.programme_id)
    if not prog: raise HTTPException(404, "Programme not found")
    await n.insert(); prog.nominee_count += 1; await prog.save(); return n

@app.get("/nominations")
async def list_nominations(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                           programme_id: Optional[str] = None, status: Optional[NominationStatus] = None):
    q = {}
    if programme_id: q["programme_id"] = programme_id
    if status: q["status"] = status
    total = await Nomination.find(q).count()
    items = await Nomination.find(q).sort(-Nomination.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

# Trainees
@app.post("/trainees", response_model=Trainee, status_code=201)
async def create_trainee(t: Trainee):
    existing = await Trainee.find_one(Trainee.user_id == t.user_id)
    if existing: raise HTTPException(400, "Trainee with this user_id already exists")
    await t.insert(); return t

@app.get("/trainees")
async def list_trainees(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                        institution_id: Optional[str] = None, district: Optional[str] = None):
    q = {}
    if institution_id: q["institution_id"] = institution_id
    if district: q["profile.district"] = district
    total = await Trainee.find(q).count()
    items = await Trainee.find(q).sort(-Trainee.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/trainees/{tid}", response_model=Trainee)
async def get_trainee(tid: str):
    t = await Trainee.get(tid)
    if not t: raise HTTPException(404, "Trainee not found")
    return t

@app.get("/trainees/by-user/{uid}", response_model=Trainee)
async def get_trainee_by_user(uid: str):
    t = await Trainee.find_one(Trainee.user_id == uid)
    if not t: raise HTTPException(404, "Trainee not found")
    return t

# Trainers
@app.post("/trainers", response_model=Trainer, status_code=201)
async def create_trainer(t: Trainer):
    existing = await Trainer.find_one(Trainer.user_id == t.user_id)
    if existing: raise HTTPException(400, "Trainer exists")
    await t.insert(); return t

@app.get("/trainers")
async def list_trainers(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                        institution_id: Optional[str] = None):
    q = {}
    if institution_id: q["institution_id"] = institution_id
    total = await Trainer.find(q).count()
    items = await Trainer.find(q).sort(-Trainer.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

# Timetables
@app.post("/timetables", response_model=Timetable, status_code=201)
async def create_timetable(t: Timetable):
    await t.insert(); return t

@app.get("/timetables")
async def list_timetables(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                          programme_id: Optional[str] = None, trainer_id: Optional[str] = None):
    q = {}
    if programme_id: q["programme_id"] = programme_id
    if trainer_id: q["trainer_id"] = trainer_id
    total = await Timetable.find(q).count()
    items = await Timetable.find(q).sort(Timetable.date).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

# Hostel Allocations
@app.post("/hostel-allocations", response_model=HostelAllocation, status_code=201)
async def create_hostel_allocation(a: HostelAllocation):
    existing = await HostelAllocation.find_one({"programme_id": a.programme_id, "trainee_id": a.trainee_id})
    if existing: raise HTTPException(400, "Already allocated")
    await a.insert(); return a

@app.get("/hostel-allocations")
async def list_hostel_allocations(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                                  programme_id: Optional[str] = None):
    q = {}
    if programme_id: q["programme_id"] = programme_id
    total = await HostelAllocation.find(q).count()
    items = await HostelAllocation.find(q).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)


# ══════════════════════════════════════════════════════════════════════════════
# LMS ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/courses", response_model=Course, status_code=201)
async def create_course(c: Course):
    await c.insert(); return c

@app.get("/courses")
async def list_courses(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                       programme_id: Optional[str] = None, language: Optional[str] = None):
    q = {}
    if programme_id: q["programme_id"] = programme_id
    if language: q["language"] = language
    total = await Course.find(q).count()
    items = await Course.find(q).sort(Course.order).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/courses/{cid}", response_model=Course)
async def get_course(cid: str):
    c = await Course.get(cid)
    if not c: raise HTTPException(404, "Course not found")
    return c

@app.post("/modules", response_model=Module, status_code=201)
async def create_module(m: Module):
    await m.insert(); return m

@app.get("/modules")
async def list_modules(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                       course_id: Optional[str] = None):
    q = {}
    if course_id: q["course_id"] = course_id
    total = await Module.find(q).count()
    items = await Module.find(q).sort(Module.order).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.post("/enrollments", response_model=Enrollment, status_code=201)
async def create_enrollment(e: Enrollment):
    await e.insert(); return e

@app.get("/enrollments")
async def list_enrollments(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                           trainee_id: Optional[str] = None, course_id: Optional[str] = None):
    q = {}
    if trainee_id: q["trainee_id"] = trainee_id
    if course_id: q["course_id"] = course_id
    total = await Enrollment.find(q).count()
    items = await Enrollment.find(q).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.post("/assessments", response_model=Assessment, status_code=201)
async def create_assessment(a: Assessment):
    await a.insert(); return a

@app.get("/assessments")
async def list_assessments(module_id: Optional[str] = None):
    q = {}
    if module_id: q["module_id"] = module_id
    return await Assessment.find(q).to_list()

@app.post("/certificates", response_model=Certificate, status_code=201)
async def create_certificate(c: Certificate):
    await c.insert(); return c

@app.get("/certificates")
async def list_certificates(trainee_id: Optional[str] = None, programme_id: Optional[str] = None):
    q = {}
    if trainee_id: q["trainee_id"] = trainee_id
    if programme_id: q["programme_id"] = programme_id
    return await Certificate.find(q).to_list()

@app.get("/certificates/verify/{cert_number}")
async def verify_certificate(cert_number: str):
    c = await Certificate.find_one(Certificate.certificate_number == cert_number)
    if not c: raise HTTPException(404, "Certificate not found")
    return {"valid": True, "certificate": c}


# ══════════════════════════════════════════════════════════════════════════════
# ATTENDANCE ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/attendance/mark")
async def mark_attendance_qr(programme_id: str, trainee_id: str, method: str = "QR",
                             lat: Optional[float] = None, long: Optional[float] = None):
    log = AttendanceLog(
        programme_id=programme_id, trainee_id=trainee_id,
        method=AttendanceMethod(method), lat=lat, long=long
    )
    await log.insert()
    return {"success": True, "attendance_id": str(log.id), "message": "Attendance recorded"}

@app.get("/attendance/logs")
async def list_attendance(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                          programme_id: Optional[str] = None, trainee_id: Optional[str] = None):
    q = {}
    if programme_id: q["programme_id"] = programme_id
    if trainee_id: q["trainee_id"] = trainee_id
    total = await AttendanceLog.find(q).count()
    items = await AttendanceLog.find(q).sort(-AttendanceLog.timestamp).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/attendance/stats/{programme_id}")
async def attendance_stats(programme_id: str):
    total = await AttendanceLog.find(AttendanceLog.programme_id == programme_id).count()
    unique = len(set([str(l.trainee_id) async for l in AttendanceLog.find(AttendanceLog.programme_id == programme_id)]))
    return {"programme_id": programme_id, "total_records": total, "unique_trainees": unique}


# ══════════════════════════════════════════════════════════════════════════════
# EMPLOYMENT ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/employers", response_model=Employer, status_code=201)
async def create_employer(e: Employer):
    await e.insert(); return e

@app.get("/employers")
async def list_employers(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    total = await Employer.find_all().count()
    items = await Employer.find_all().sort(-Employer.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.post("/jobs", response_model=JobPosting, status_code=201)
async def create_job(j: JobPosting):
    await j.insert(); return j

@app.get("/jobs")
async def list_jobs(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                    employer_id: Optional[str] = None, location: Optional[str] = None):
    q = {"is_active": True}
    if employer_id: q["employer_id"] = employer_id
    if location: q["location"] = location
    total = await JobPosting.find(q).count()
    items = await JobPosting.find(q).sort(-JobPosting.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/jobs/{jid}", response_model=JobPosting)
async def get_job(jid: str):
    j = await JobPosting.get(jid)
    if not j: raise HTTPException(404, "Job not found")
    return j

@app.post("/applications", response_model=JobApplication, status_code=201)
async def create_application(a: JobApplication):
    await a.insert(); return a

@app.get("/applications")
async def list_applications(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                            trainee_id: Optional[str] = None, job_id: Optional[str] = None):
    q = {}
    if trainee_id: q["trainee_id"] = trainee_id
    if job_id: q["job_id"] = job_id
    total = await JobApplication.find(q).count()
    items = await JobApplication.find(q).sort(-JobApplication.created_at).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.post("/skill-profiles", response_model=SkillProfile, status_code=201)
async def create_skill_profile(sp: SkillProfile):
    await sp.insert(); return sp

@app.get("/skill-profiles/{trainee_id}")
async def get_skill_profile(trainee_id: str):
    sp = await SkillProfile.find_one(SkillProfile.trainee_id == trainee_id)
    if not sp: raise HTTPException(404, "Skill profile not found")
    return sp


# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/analytics/events", response_model=AnalyticsEvent, status_code=201)
async def create_event(event: AnalyticsEvent):
    await event.insert(); return event

@app.get("/analytics/events")
async def list_events(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
                      event_type: Optional[str] = None, entity_type: Optional[str] = None):
    q = {}
    if event_type: q["event_type"] = event_type
    if entity_type: q["entity_type"] = entity_type
    total = await AnalyticsEvent.find(q).count()
    items = await AnalyticsEvent.find(q).sort(-AnalyticsEvent.timestamp).skip((page-1)*limit).limit(limit).to_list()
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total+limit-1)//limit)

@app.get("/dashboard/summary")
async def dashboard_summary():
    return {
        "institutions": await Institution.find_all().count(),
        "programmes": await Programme.find_all().count(),
        "trainees": await Trainee.find_all().count(),
        "trainers": await Trainer.find_all().count(),
        "courses": await Course.find_all().count(),
        "enrollments": await Enrollment.find_all().count(),
        "certificates": await Certificate.find_all().count(),
        "jobs": await JobPosting.find(JobPosting.is_active == True).count(),
        "applications": await JobApplication.find_all().count(),
        "attendance_records": await AttendanceLog.find_all().count(),
    }

@app.get("/dashboard/recent-activity")
async def recent_activity(days: int = Query(7, ge=1, le=90)):
    since = datetime.utcnow() - timedelta(days=days)
    events = await AnalyticsEvent.find(AnalyticsEvent.timestamp >= since).sort(-AnalyticsEvent.timestamp).limit(50).to_list()
    return {"period_days": days, "events": events}


# ══════════════════════════════════════════════════════════════════════════════
# AI ROUTES (stub — works without API keys, returns mock data)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/ai/quiz/generate")
async def generate_quiz(content: str = "", language: str = "en", num_questions: int = 5):
    return {
        "questions": [
            {"id": i+1, "text": f"Sample question {i+1} about cooperative management",
             "options": ["A", "B", "C", "D"], "correct": "A", "explanation": "Sample explanation"}
            for i in range(num_questions)
        ],
        "metadata": {"language": language, "source": "demo"}
    }

@app.post("/ai/skill-gap")
async def skill_gap(trainee_id: str = "", target_role: str = ""):
    return {
        "missing_skills": ["Financial Reporting", "Cooperative Law", "Digital Marketing"],
        "recommended_courses": [
            {"title": "Cooperative Financial Management", "duration": "4 weeks"},
            {"title": "PACS Digital Transformation", "duration": "2 weeks"},
        ],
        "skill_match_percentage": 68.5,
    }

@app.post("/ai/chat")
async def chat(message: str = "", trainee_id: str = "", language: str = "en"):
    return {
        "response": f"Thank you for your question about '{message[:50]}'. This is a demo response. In production, this will be powered by RAG + LLM.",
        "sources": [],
        "session_id": str(uuid.uuid4()),
    }

@app.post("/ai/job-match")
async def job_match(job_id: str = "", top_k: int = 5):
    return {"ranked_candidates": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
