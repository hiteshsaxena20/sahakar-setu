# ERP Service - FastAPI Application
# Institution/Programme/Nomination/Trainee Management

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List
from datetime import datetime

# Import models
from app.models import (
    Institution, Programme, Nomination, Trainee, Trainer,
    Timetable, HostelAllocation,
    InstitutionType, NominationStatus, ProgrammeStatus
)

# Import shared types
import sys
sys.path.append('/app/../../packages/shared/types')
from models import PaginationParams, PaginatedResponse, HealthResponse


# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
SERVICE_NAME = os.getenv("SERVICE_NAME", "erp-service")
PORT = int(os.getenv("PORT", "8001"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(
        database=db,
        document_models=[
            Institution, Programme, Nomination, Trainee, Trainer,
            Timetable, HostelAllocation
        ]
    )
    app.state.db = db
    app.state.client = client
    print(f"[{SERVICE_NAME}] Connected to MongoDB: {MONGO_DB}")
    yield
    # Shutdown
    client.close()
    print(f"[{SERVICE_NAME}] Disconnected from MongoDB")


app = FastAPI(
    title="ERP Service",
    description="Institution, Programme, Nomination, Trainee Management for NCCT",
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
# Institution Endpoints
# ==========================================

@app.post("/institutions", response_model=Institution, status_code=status.HTTP_201_CREATED)
async def create_institution(institution: Institution):
    await institution.insert()
    return institution


@app.get("/institutions", response_model=PaginatedResponse)
async def list_institutions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[InstitutionType] = None,
    state: Optional[str] = None,
    district: Optional[str] = None
):
    query = {}
    if type:
        query["type"] = type
    if state:
        query["state"] = state
    if district:
        query["district"] = district

    total = await Institution.find(query).count()
    institutions = await Institution.find(query) \
        .sort(-Institution.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=institutions,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/institutions/{institution_id}", response_model=Institution)
async def get_institution(institution_id: str):
    institution = await Institution.get(institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution


@app.put("/institutions/{institution_id}", response_model=Institution)
async def update_institution(institution_id: str, data: dict):
    institution = await Institution.get(institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    for key, value in data.items():
        if hasattr(institution, key) and key not in ["_id", "created_at"]:
            setattr(institution, key, value)
    institution.updated_at = datetime.utcnow()
    await institution.save()
    return institution


@app.delete("/institutions/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(institution_id: str):
    institution = await Institution.get(institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    await institution.delete()


# ==========================================
# Programme Endpoints
# ==========================================

@app.post("/programmes", response_model=Programme, status_code=status.HTTP_201_CREATED)
async def create_programme(programme: Programme):
    await programme.insert()
    return programme


@app.get("/programmes", response_model=PaginatedResponse)
async def list_programmes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    institution_id: Optional[str] = None,
    status: Optional[ProgrammeStatus] = None
):
    query = {}
    if institution_id:
        query["institution_id"] = institution_id
    if status:
        query["status"] = status

    total = await Programme.find(query).count()
    programmes = await Programme.find(query) \
        .sort(-Programme.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=programmes,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/programmes/{programme_id}", response_model=Programme)
async def get_programme(programme_id: str):
    programme = await Programme.get(programme_id)
    if not programme:
        raise HTTPException(status_code=404, detail="Programme not found")
    return programme


@app.put("/programmes/{programme_id}", response_model=Programme)
async def update_programme(programme_id: str, data: dict):
    programme = await Programme.get(programme_id)
    if not programme:
        raise HTTPException(status_code=404, detail="Programme not found")

    for key, value in data.items():
        if hasattr(programme, key) and key not in ["_id", "created_at"]:
            setattr(programme, key, value)
    programme.updated_at = datetime.utcnow()
    await programme.save()
    return programme


@app.post("/programmes/{programme_id}/publish", response_model=Programme)
async def publish_programme(programme_id: str):
    programme = await Programme.get(programme_id)
    if not programme:
        raise HTTPException(status_code=404, detail="Programme not found")
    programme.status = ProgrammeStatus.PUBLISHED
    programme.updated_at = datetime.utcnow()
    await programme.save()
    return programme


# ==========================================
# Nomination Endpoints
# ==========================================

@app.post("/nominations", response_model=Nomination, status_code=status.HTTP_201_CREATED)
async def create_nomination(nomination: Nomination):
    # Verify programme exists
    programme = await Programme.get(nomination.programme_id)
    if not programme:
        raise HTTPException(status_code=404, detail="Programme not found")

    await nomination.insert()

    # Update nominee count
    programme.nominee_count += 1
    await programme.save()

    return nomination


@app.get("/nominations", response_model=PaginatedResponse)
async def list_nominations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    programme_id: Optional[str] = None,
    status: Optional[NominationStatus] = None
):
    query = {}
    if programme_id:
        query["programme_id"] = programme_id
    if status:
        query["status"] = status

    total = await Nomination.find(query).count()
    nominations = await Nomination.find(query) \
        .sort(-Nomination.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=nominations,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.post("/nominations/{nomination_id}/approve", response_model=Nomination)
async def approve_nomination(nomination_id: str, approved_by: str):
    nomination = await Nomination.get(nomination_id)
    if not nomination:
        raise HTTPException(status_code=404, detail="Nomination not found")

    nomination.status = NominationStatus.APPROVED
    nomination.approved_by = approved_by
    nomination.approved_at = datetime.utcnow()
    nomination.updated_at = datetime.utcnow()
    await nomination.save()
    return nomination


@app.post("/nominations/{nomination_id}/reject", response_model=Nomination)
async def reject_nomination(nomination_id: str, rejection_reason: str):
    nomination = await Nomination.get(nomination_id)
    if not nomination:
        raise HTTPException(status_code=404, detail="Nomination not found")

    nomination.status = NominationStatus.REJECTED
    nomination.rejection_reason = rejection_reason
    nomination.updated_at = datetime.utcnow()
    await nomination.save()
    return nomination


# ==========================================
# Trainee Endpoints
# ==========================================

@app.post("/trainees", response_model=Trainee, status_code=status.HTTP_201_CREATED)
async def create_trainee(trainee: Trainee):
    # Check if user_id already exists
    existing = await Trainee.find_one(Trainee.user_id == trainee.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Trainee with this user_id already exists")
    await trainee.insert()
    return trainee


@app.get("/trainees", response_model=PaginatedResponse)
async def list_trainees(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    institution_id: Optional[str] = None,
    district: Optional[str] = None
):
    query = {}
    if institution_id:
        query["institution_id"] = institution_id
    if district:
        query["profile.district"] = district

    total = await Trainee.find(query).count()
    trainees = await Trainee.find(query) \
        .sort(-Trainee.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=trainees,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@app.get("/trainees/{trainee_id}", response_model=Trainee)
async def get_trainee(trainee_id: str):
    trainee = await Trainee.get(trainee_id)
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return trainee


@app.get("/trainees/by-user/{user_id}", response_model=Trainee)
async def get_trainee_by_user_id(user_id: str):
    trainee = await Trainee.find_one(Trainee.user_id == user_id)
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return trainee


@app.put("/trainees/{trainee_id}", response_model=Trainee)
async def update_trainee(trainee_id: str, data: dict):
    trainee = await Trainee.get(trainee_id)
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")

    for key, value in data.items():
        if hasattr(trainee, key) and key not in ["_id", "created_at", "user_id"]:
            setattr(trainee, key, value)
    trainee.updated_at = datetime.utcnow()
    await trainee.save()
    return trainee


# ==========================================
# Trainer Endpoints
# ==========================================

@app.post("/trainers", response_model=Trainer, status_code=status.HTTP_201_CREATED)
async def create_trainer(trainer: Trainer):
    existing = await Trainer.find_one(Trainer.user_id == trainer.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Trainer with this user_id already exists")
    await trainer.insert()
    return trainer


@app.get("/trainers", response_model=PaginatedResponse)
async def list_trainers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    institution_id: Optional[str] = None
):
    query = {}
    if institution_id:
        query["institution_id"] = institution_id

    total = await Trainer.find(query).count()
    trainers = await Trainer.find(query) \
        .sort(-Trainer.created_at) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=trainers,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


# ==========================================
# Timetable Endpoints
# ==========================================

@app.post("/timetables", response_model=Timetable, status_code=status.HTTP_201_CREATED)
async def create_timetable(timetable: Timetable):
    await timetable.insert()
    return timetable


@app.get("/timetables", response_model=PaginatedResponse)
async def list_timetables(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    programme_id: Optional[str] = None,
    trainer_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    query = {}
    if programme_id:
        query["programme_id"] = programme_id
    if trainer_id:
        query["trainer_id"] = trainer_id
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        query["date"] = date_query

    total = await Timetable.find(query).count()
    timetables = await Timetable.find(query) \
        .sort(Timetable.date, Timetable.start_time) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=timetables,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


# ==========================================
# Hostel Allocation Endpoints
# ==========================================

@app.post("/hostel-allocations", response_model=HostelAllocation, status_code=status.HTTP_201_CREATED)
async def create_hostel_allocation(allocation: HostelAllocation):
    # Check if trainee already allocated for this programme
    existing = await HostelAllocation.find_one({
        "programme_id": allocation.programme_id,
        "trainee_id": allocation.trainee_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Trainee already allocated for this programme")
    await allocation.insert()
    return allocation


@app.get("/hostel-allocations", response_model=PaginatedResponse)
async def list_hostel_allocations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    programme_id: Optional[str] = None
):
    query = {}
    if programme_id:
        query["programme_id"] = programme_id

    total = await HostelAllocation.find(query).count()
    allocations = await HostelAllocation.find(query) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=allocations,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)