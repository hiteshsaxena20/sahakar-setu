# Employment Service - FastAPI Application
# Job Postings, Applications, Skill Matching, Career Chatbot

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List
from datetime import datetime
import httpx

# Import models
from app.models import (
    Employer, JobPosting, JobApplication, SkillProfile,
    JobApplicationStatus
)

# Import shared types (from local copy)
from app.shared_models import PaginationParams, PaginatedResponse, HealthResponse


# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-service:8006")
SERVICE_NAME = os.getenv("SERVICE_NAME", "employment-service")
PORT = int(os.getenv("PORT", "8004"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(
        database=db,
        document_models=[Employer, JobPosting, JobApplication, SkillProfile]
    )
    app.state.db = db
    app.state.client = client
    print(f"[{SERVICE_NAME}] Connected to MongoDB: {MONGO_DB}")
    yield
    client.close()
    print(f"[{SERVICE_NAME}] Disconnected from MongoDB")


app = FastAPI(
    title="Employment Service",
    description="Job Postings, Applications, Matching, Career Chatbot for NCCT",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(service=SERVICE_NAME)


# ==========================================
# Employer Endpoints
# ==========================================

@app.post("/employers", response_model=Employer, status_code=status.HTTP_201_CREATED)
async def create_employer(employer: Employer):
    await employer.insert()
    return employer


@app.get("/employers", response_model=PaginatedResponse)
async def list_employers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    verified: Optional[bool] = None,
    company_type: Optional[str] = None
):
    query = {}
    if verified is not None:
        query["verified"] = verified
    if company_type:
        query["company_type"] = company_type

    total = await Employer.find(query).count()
    employers = await Employer.find(query) \
        .sort(-Employer.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=employers,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/employers/{employer_id}", response_model=Employer)
async def get_employer(employer_id: str):
    employer = await Employer.get(employer_id)
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    return employer


# ==========================================
# Job Posting Endpoints
# ==========================================

@app.post("/jobs", response_model=JobPosting, status_code=status.HTTP_201_CREATED)
async def create_job(job: JobPosting):
    await job.insert()
    return job


@app.get("/jobs", response_model=PaginatedResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    employer_id: Optional[str] = None,
    location: Optional[str] = None,
    is_active: Optional[bool] = True,
    search: Optional[str] = None
):
    query = {}
    if employer_id:
        query["employer_id"] = employer_id
    if location:
        query["location"] = location
    if is_active is not None:
        query["is_active"] = is_active
    if search:
        query["$text"] = {"$search": search}

    total = await JobPosting.find(query).count()
    jobs = await JobPosting.find(query) \
        .sort(-JobPosting.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=jobs,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/jobs/{job_id}", response_model=JobPosting)
async def get_job(job_id: str):
    job = await JobPosting.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.put("/jobs/{job_id}", response_model=JobPosting)
async def update_job(job_id: str, data: dict):
    job = await JobPosting.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in data.items():
        if hasattr(job, key) and key not in ["_id", "created_at", "employer_id"]:
            setattr(job, key, value)
    job.updated_at = datetime.utcnow()
    await job.save()
    return job


# ==========================================
# Job Application Endpoints
# ==========================================

@app.post("/applications", response_model=JobApplication, status_code=status.HTTP_201_CREATED)
async def apply_to_job(application: JobApplication):
    # Check if already applied
    existing = await JobApplication.find_one({
        "trainee_id": application.trainee_id,
        "job_id": application.job_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    # Get job for match score calculation
    job = await JobPosting.get(application.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get trainee skill profile
    skill_profile = await SkillProfile.find_one(SkillProfile.trainee_id == application.trainee_id)
    trainee_skills = skill_profile.skills if skill_profile else []

    # Calculate match score (simple overlap)
    required_skills = set(job.required_skills)
    trainee_skill_set = set(trainee_skills)
    match = len(required_skills & trainee_skill_set) / len(required_skills) if required_skills else 0
    application.match_score = round(match * 100, 2)

    await application.insert()
    return application


@app.get("/applications", response_model=PaginatedResponse)
async def list_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    trainee_id: Optional[str] = None,
    job_id: Optional[str] = None,
    status: Optional[JobApplicationStatus] = None
):
    query = {}
    if trainee_id:
        query["trainee_id"] = trainee_id
    if job_id:
        query["job_id"] = job_id
    if status:
        query["status"] = status

    total = await JobApplication.find(query).count()
    applications = await JobApplication.find(query) \
        .sort(-JobApplication.match_score) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=applications,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.put("/applications/{application_id}/status", response_model=JobApplication)
async def update_application_status(
    application_id: str,
    new_status: JobApplicationStatus,
    reviewed_by: str
):
    application = await JobApplication.get(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = new_status
    application.reviewed_by = reviewed_by
    application.reviewed_at = datetime.utcnow()
    application.updated_at = datetime.utcnow()
    await application.save()
    return application


# ==========================================
# Skill Profile Endpoints
# ==========================================

@app.get("/skill-profiles/{trainee_id}", response_model=SkillProfile)
async def get_skill_profile(trainee_id: str):
    profile = await SkillProfile.find_one(SkillProfile.trainee_id == trainee_id)
    if not profile:
        # Create empty profile
        profile = SkillProfile(trainee_id=trainee_id)
        await profile.insert()
    return profile


@app.post("/skill-profiles/{trainee_id}/refresh")
async def refresh_skill_profile(trainee_id: str):
    """Refresh skill profile from certificates and assessments"""
    # This would be called by a background job or after certificate issuance
    # For now, return existing profile
    profile = await SkillProfile.find_one(SkillProfile.trainee_id == trainee_id)
    if not profile:
        profile = SkillProfile(trainee_id=trainee_id)

    # In real implementation:
    # 1. Fetch certificates from LMS service
    # 2. Fetch assessment scores
    # 3. Extract skills from certificates
    # 4. Update profile

    profile.updated_at = datetime.utcnow()
    await profile.save()
    return profile


# ==========================================
# AI-Powered Job Matching
# ==========================================

@app.post("/jobs/{job_id}/match-candidates")
async def match_candidates(job_id: str, top_k: int = 10):
    """Get AI-ranked candidates for a job"""
    job = await JobPosting.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Call AI service for matching
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{AI_SERVICE_URL}/job-match",
                json={"job_id": job_id, "top_k": top_k},
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass

    # Fallback: Simple skill-based matching
    all_profiles = await SkillProfile.find_all().to_list()
    candidates = []

    required_skills = set(job.required_skills)
    for profile in all_profiles:
        trainee_skills = set(profile.skills)
        match_count = len(required_skills & trainee_skills)
        match_score = (match_count / len(required_skills) * 100) if required_skills else 0

        candidates.append({
            "trainee_id": profile.trainee_id,
            "skills": profile.skills,
            "match_score": round(match_score, 2),
            "certifications_count": len(profile.certifications)
        })

    # Sort by match score
    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return {"ranked_candidates": candidates[:top_k]}


# ==========================================
# Career Chatbot Endpoint
# ==========================================

@app.post("/chatbot/chat")
async def chat_with_career_bot(
    trainee_id: str,
    message: str,
    language: str = "en"
):
    """Career counseling chatbot"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{AI_SERVICE_URL}/chat",
                json={
                    "trainee_id": trainee_id,
                    "message": message,
                    "language": language
                },
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass

    # Fallback response
    return {
        "response": "I'm here to help with your career questions! Ask me about job opportunities, skill development, or training programmes.",
        "sources": [],
        "session_id": f"fallback-{trainee_id}-{datetime.utcnow().timestamp()}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)