# LMS Service - FastAPI Application
# Courses, Assessments, Certificates Management

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List
from datetime import datetime
import httpx
import uuid

# Import models
from app.models import (
    Course, Module, Assessment, Question, Enrollment, Certificate,
    AssessmentType
)

# Import shared types
import sys
sys.path.append('/app/../../packages/shared/types')
from models import PaginationParams, PaginatedResponse, HealthResponse


# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-service:8006")
SERVICE_NAME = os.getenv("SERVICE_NAME", "lms-service")
PORT = int(os.getenv("PORT", "8002"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(
        database=db,
        document_models=[
            Course, Module, Assessment, Question, Enrollment, Certificate
        ]
    )
    app.state.db = db
    app.state.client = client
    print(f"[{SERVICE_NAME}] Connected to MongoDB: {MONGO_DB}")
    yield
    client.close()
    print(f"[{SERVICE_NAME}] Disconnected from MongoDB")


app = FastAPI(
    title="LMS Service",
    description="Courses, Assessments, Certificates Management for NCCT",
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
# Course Endpoints
# ==========================================

@app.post("/courses", response_model=Course, status_code=status.HTTP_201_CREATED)
async def create_course(course: Course):
    await course.insert()
    return course


@app.get("/courses", response_model=PaginatedResponse)
async def list_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    programme_id: Optional[str] = None,
    language: Optional[str] = None
):
    query = {}
    if programme_id:
        query["programme_id"] = programme_id
    if language:
        query["language"] = language

    total = await Course.find(query).count()
    courses = await Course.find(query) \
        .sort(Course.order) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=courses,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, data: dict):
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for key, value in data.items():
        if hasattr(course, key) and key not in ["_id", "created_at"]:
            setattr(course, key, value)
    course.updated_at = datetime.utcnow()
    await course.save()
    return course


# ==========================================
# Module Endpoints
# ==========================================

@app.post("/modules", response_model=Module, status_code=status.HTTP_201_CREATED)
async def create_module(module: Module):
    await module.insert()
    return module


@app.get("/modules", response_model=PaginatedResponse)
async def list_modules(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    course_id: Optional[str] = None
):
    query = {}
    if course_id:
        query["course_id"] = course_id

    total = await Module.find(query).count()
    modules = await Module.find(query) \
        .sort(Module.order) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=modules,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


# ==========================================
# Assessment Endpoints
# ==========================================

@app.post("/assessments", response_model=Assessment, status_code=status.HTTP_201_CREATED)
async def create_assessment(assessment: Assessment):
    await assessment.insert()
    return assessment


@app.get("/assessments", response_model=PaginatedResponse)
async def list_assessments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    module_id: Optional[str] = None
):
    query = {}
    if module_id:
        query["module_id"] = module_id

    total = await Assessment.find(query).count()
    assessments = await Assessment.find(query) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=assessments,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.post("/assessments/{assessment_id}/generate-questions")
async def generate_questions(assessment_id: str, num_questions: int = 10):
    """Generate AI questions for an assessment"""
    assessment = await Assessment.get(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Get module content for context
    module = await Module.get(assessment.module_id)
    content = ""
    if module:
        content = f"Module: {module.title}\n"
        if module.document_url:
            content += f"Document: {module.document_url}\n"

    # Call AI service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{AI_SERVICE_URL}/quiz/generate",
                json={
                    "content": content,
                    "num_questions": num_questions,
                    "difficulty": "medium",
                    "question_type": assessment.type.value
                },
                timeout=60.0
            )
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="AI service error")

            ai_result = response.json()
            questions_data = ai_result.get("questions", [])

            # Save questions
            questions = []
            for q_data in questions_data:
                question = Question(
                    assessment_id=assessment_id,
                    text=q_data.get("text", ""),
                    options=q_data.get("options", []),
                    correct_answer=q_data.get("correct_answer"),
                    explanation=q_data.get("explanation", ""),
                    language=q_data.get("language", "en")
                )
                await question.insert()
                questions.append(question)

            return {"message": f"Generated {len(questions)} questions", "questions": questions}

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="AI service timeout")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")


# ==========================================
# Question Endpoints
# ==========================================

@app.post("/questions", response_model=Question, status_code=status.HTTP_201_CREATED)
async def create_question(question: Question):
    await question.insert()
    return question


@app.get("/questions", response_model=PaginatedResponse)
async def list_questions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    assessment_id: Optional[str] = None
):
    query = {}
    if assessment_id:
        query["assessment_id"] = assessment_id

    total = await Question.find(query).count()
    questions = await Question.find(query) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=questions,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


# ==========================================
# Enrollment Endpoints
# ==========================================

@app.post("/enrollments", response_model=Enrollment, status_code=status.HTTP_201_CREATED)
async def create_enrollment(enrollment: Enrollment):
    # Check if already enrolled
    existing = await Enrollment.find_one({
        "trainee_id": enrollment.trainee_id,
        "course_id": enrollment.course_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    await enrollment.insert()
    return enrollment


@app.get("/enrollments", response_model=PaginatedResponse)
async def list_enrollments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    trainee_id: Optional[str] = None,
    course_id: Optional[str] = None
):
    query = {}
    if trainee_id:
        query["trainee_id"] = trainee_id
    if course_id:
        query["course_id"] = course_id

    total = await Enrollment.find(query).count()
    enrollments = await Enrollment.find(query) \
        .sort(-Enrollment.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=enrollments,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.post("/enrollments/{enrollment_id}/submit-assessment")
async def submit_assessment(enrollment_id: str, answers: dict):
    """Submit assessment answers and auto-grade"""
    enrollment = await Enrollment.get(enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    # Get assessment for this course (simplified - first assessment)
    course = await Course.get(enrollment.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Find assessment (in real app, would be specific assessment)
    # For now, calculate score based on submitted answers
    score = 0
    total_questions = len(answers)
    correct_count = 0

    # This would compare with correct answers in database
    # Simplified for demo
    for q_id, answer in answers.items():
        # In real implementation, fetch question and check answer
        pass

    percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0

    # Update progress
    enrollment.progress["last_assessment_score"] = percentage
    enrollment.progress["last_assessment_date"] = datetime.utcnow().isoformat()

    if percentage >= 60:  # Passing score
        enrollment.completed_at = datetime.utcnow()

    enrollment.updated_at = datetime.utcnow()
    await enrollment.save()

    return {
        "score": percentage,
        "passed": percentage >= 60,
        "enrollment": enrollment
    }


# ==========================================
# Certificate Endpoints
# ==========================================

@app.post("/certificates", response_model=Certificate, status_code=status.HTTP_201_CREATED)
async def issue_certificate(certificate: Certificate):
    await certificate.insert()
    return certificate


@app.get("/certificates", response_model=PaginatedResponse)
async def list_certificates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    trainee_id: Optional[str] = None,
    programme_id: Optional[str] = None
):
    query = {}
    if trainee_id:
        query["trainee_id"] = trainee_id
    if programme_id:
        query["programme_id"] = programme_id

    total = await Certificate.find(query).count()
    certificates = await Certificate.find(query) \
        .sort(-Certificate.issue_date) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=certificates,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/certificates/verify/{certificate_number}")
async def verify_certificate(certificate_number: str):
    """Public certificate verification endpoint"""
    certificate = await Certificate.find_one(Certificate.certificate_number == certificate_number)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    return {
        "valid": True,
        "certificate_number": certificate.certificate_number,
        "trainee_name": "Trainee Name",  # Would fetch from ERP
        "programme": "Programme Name",
        "issue_date": certificate.issue_date,
        "verification_url": certificate.verification_url
    }


@app.post("/certificates/{certificate_id}/generate-pdf")
async def generate_certificate_pdf(certificate_id: str):
    """Generate PDF certificate with QR code"""
    certificate = await Certificate.get(certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Generate PDF using reportlab
    # This is a placeholder - actual implementation would generate PDF
    # and upload to MinIO

    return {
        "message": "PDF generation initiated",
        "certificate_id": certificate_id,
        "pdf_url": certificate.pdf_url
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)