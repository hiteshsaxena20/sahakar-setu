# Analytics Service - FastAPI Application
# Aggregations, Dashboards, Reports

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

# Import models
from app.models import AnalyticsEvent

# Import shared types
import sys
sys.path.append('/app/../../packages/shared/types')
from models import PaginationParams, PaginatedResponse, HealthResponse


# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
SERVICE_NAME = os.getenv("SERVICE_NAME", "analytics-service")
PORT = int(os.getenv("PORT", "8005"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(
        database=db,
        document_models=[AnalyticsEvent]
    )
    app.state.db = db
    app.state.client = client
    print(f"[{SERVICE_NAME}] Connected to MongoDB: {MONGO_DB}")
    yield
    client.close()
    print(f"[{SERVICE_NAME}] Disconnected from MongoDB")


app = FastAPI(
    title="Analytics Service",
    description="Aggregations, Dashboards, Reports for NCCT",
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
# Event Tracking
# ==========================================

@app.post("/events", status_code=status.HTTP_201_CREATED)
async def track_event(
    event_type: str,
    entity_id: str,
    entity_type: str,
    metadata: Optional[Dict[str, Any]] = None
):
    """Track analytics event"""
    event = AnalyticsEvent(
        event_type=event_type,
        entity_id=entity_id,
        entity_type=entity_type,
        metadata=metadata or {},
        timestamp=datetime.utcnow()
    )
    await event.insert()
    return {"success": True, "event_id": str(event.id)}


# ==========================================
# Dashboard Endpoints
# ==========================================

@app.get("/dashboard/summary")
async def get_dashboard_summary(
    institution_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Get summary metrics for dashboard"""
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=30)
    if not date_to:
        date_to = datetime.utcnow()

    # This would aggregate from various collections
    # For now, return mock structure
    return {
        "period": {"from": date_from.isoformat(), "to": date_to.isoformat()},
        "total_trainees": 0,
        "active_programmes": 0,
        "total_certificates": 0,
        "total_placements": 0,
        "completion_rate": 0.0,
        "placement_rate": 0.0,
        "dropout_rate": 0.0
    }


@app.get("/dashboard/enrollment-trends")
async def get_enrollment_trends(
    institution_id: Optional[str] = None,
    granularity: str = "monthly",  # daily, weekly, monthly
    months: int = 12
):
    """Get enrollment trends over time"""
    # MongoDB aggregation pipeline
    pipeline = [
        {"$match": {
            "event_type": "enrollment",
            "timestamp": {"$gte": datetime.utcnow() - timedelta(days=months*30)}
        }},
        {"$group": {
            "_id": {
                "year": {"$year": "$timestamp"},
                "month": {"$month": "$timestamp"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]

    db = app.state.db
    results = await db.analyticsEvents.aggregate(pipeline).to_list(length=None)

    return {
        "granularity": granularity,
        "data": [
            {
                "period": f"{r['_id']['year']}-{r['_id']['month']:02d}",
                "enrollments": r["count"]
            }
            for r in results
        ]
    }


@app.get("/dashboard/dropout-heatmap")
async def get_dropout_heatmap(
    institution_id: Optional[str] = None,
    state: Optional[str] = None
):
    """Get dropout rate by district/region"""
    # This would join with trainee data to get district
    # Return mock structure
    return {
        "regions": [
            {"district": "Ahmednagar", "state": "Maharashtra", "dropout_rate": 12.5, "total_trainees": 45},
            {"district": "Pune", "state": "Maharashtra", "dropout_rate": 8.2, "total_trainees": 67},
            {"district": "Nashik", "state": "Maharashtra", "dropout_rate": 15.3, "total_trainees": 32},
        ]
    }


@app.get("/dashboard/placement-rates")
async def get_placement_rates(
    institution_id: Optional[str] = None,
    programme_id: Optional[str] = None
):
    """Get placement rates by programme/institution"""
    return {
        "programmes": [
            {"programme_id": "prog-1", "title": "Dairy Coop Management", "placement_rate": 62.5, "total_trainees": 40},
            {"programme_id": "prog-2", "title": "Agri Marketing", "placement_rate": 45.0, "total_trainees": 35},
        ]
    }


@app.get("/dashboard/completion-rates")
async def get_completion_rates(
    institution_id: Optional[str] = None,
    programme_id: Optional[str] = None
):
    """Get course completion rates"""
    return {
        "courses": [
            {"course_id": "course-1", "title": "Cooperative Principles", "completion_rate": 87.3},
            {"course_id": "course-2", "title": "Financial Management", "completion_rate": 72.1},
        ]
    }


# ==========================================
# Report Endpoints
# ==========================================

@app.get("/reports/trainee-progress/{trainee_id}")
async def get_trainee_progress_report(trainee_id: str):
    """Get detailed progress report for a trainee"""
    return {
        "trainee_id": trainee_id,
        "enrolled_courses": [],
        "completed_courses": [],
        "certificates": [],
        "assessments": [],
        "attendance_rate": 0.0,
        "skill_profile": {}
    }


@app.get("/reports/programme-performance/{programme_id}")
async def get_programme_performance_report(programme_id: str):
    """Get performance report for a programme"""
    return {
        "programme_id": programme_id,
        "total_nominations": 0,
        "approved_nominations": 0,
        "enrolled_trainees": 0,
        "completed_trainees": 0,
        "certificates_issued": 0,
        "placements": 0,
        "avg_attendance": 0.0,
        "avg_assessment_score": 0.0
    }


@app.get("/reports/institution-performance")
async def get_institution_performance(
    institution_type: Optional[str] = None,
    state: Optional[str] = None
):
    """Get performance report across institutions"""
    return {
        "institutions": [
            {
                "institution_id": "inst-1",
                "name": "VAMNICOM",
                "type": "VAMNICOM",
                "state": "Maharashtra",
                "total_programmes": 15,
                "total_trainees": 450,
                "completion_rate": 87.5,
                "placement_rate": 62.0
            }
        ]
    }


# ==========================================
# Analytics Events
# ==========================================

@app.get("/events", response_model=PaginatedResponse)
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    event_type: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    query = {}
    if event_type:
        query["event_type"] = event_type
    if entity_type:
        query["entity_type"] = entity_type
    if entity_id:
        query["entity_id"] = entity_id
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        query["timestamp"] = date_query

    total = await AnalyticsEvent.find(query).count()
    events = await AnalyticsEvent.find(query) \
        .sort(-AnalyticsEvent.timestamp) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=events,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)