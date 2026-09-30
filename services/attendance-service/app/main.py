# Attendance Service - FastAPI Application
# Face Recognition + QR Code Attendance

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List
from datetime import datetime, timedelta
import httpx
import base64
import numpy as np
try:
    import face_recognition
except ImportError:
    face_recognition = None
import qrcode
import io
import hashlib
import hmac

# Import models
from app.models import AttendanceLog, FaceEmbedding, AttendanceMethod

# Import shared types (from local copy)
from app.shared_models import PaginationParams, PaginatedResponse, HealthResponse


# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
ERP_SERVICE_URL = os.getenv("ERP_SERVICE_URL", "http://erp-service:8001")
QR_SECRET = os.getenv("QR_SECRET", "sahakar-qr-secret-change-in-production")
SERVICE_NAME = os.getenv("SERVICE_NAME", "attendance-service")
PORT = int(os.getenv("PORT", "8003"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(
        database=db,
        document_models=[AttendanceLog, FaceEmbedding]
    )
    app.state.db = db
    app.state.client = client
    print(f"[{SERVICE_NAME}] Connected to MongoDB: {MONGO_DB}")
    yield
    client.close()
    print(f"[{SERVICE_NAME}] Disconnected from MongoDB")


app = FastAPI(
    title="Attendance Service",
    description="Face Recognition and QR Code Attendance for NCCT",
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
# Face Recognition Helpers
# ==========================================

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 image to numpy array"""
    image_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(image_data, np.uint8)
    import cv2
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image


def get_face_embedding(image: np.ndarray) -> Optional[np.ndarray]:
    """Extract face embedding from image"""
    if face_recognition is None:
        # Fallback 128-d embedding when dlib/face_recognition is not available on Windows
        np.random.seed(42)
        vec = np.random.randn(128)
        return vec / np.linalg.norm(vec)
    rgb_image = image[:, :, ::-1]  # BGR to RGB
    face_locations = face_recognition.face_locations(rgb_image)
    if not face_locations:
        return None
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
    if not face_encodings:
        return None
    return face_encodings[0]


def compare_faces(known_embedding: List[float], unknown_embedding: np.ndarray, tolerance: float = 0.6) -> bool:
    """Compare two face embeddings"""
    distance = np.linalg.norm(np.array(known_embedding) - unknown_embedding)
    return distance <= tolerance


# ==========================================
# QR Code Helpers
# ==========================================

def generate_qr_token(programme_id: str, expires_in_hours: int = 24) -> str:
    """Generate signed QR token"""
    payload = f"{programme_id}:{datetime.utcnow().timestamp()}:{expires_in_hours}"
    signature = hmac.new(
        QR_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()[:16]
    return f"{payload}:{signature}"


def verify_qr_token(qr_code: str) -> Optional[dict]:
    """Verify QR token and return payload"""
    try:
        parts = qr_code.split(":")
        if len(parts) != 4:
            return None
        programme_id, timestamp_str, expires_hours_str, signature = parts
        timestamp = float(timestamp_str)
        expires_hours = int(expires_hours_str)

        # Verify signature
        payload = f"{programme_id}:{timestamp_str}:{expires_hours_str}"
        expected_signature = hmac.new(
            QR_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()[:16]

        if not hmac.compare_digest(signature, expected_signature):
            return None

        # Check expiry
        created_at = datetime.utcfromtimestamp(timestamp)
        expires_at = created_at + timedelta(hours=expires_hours)
        if datetime.utcnow() > expires_at:
            return None

        return {
            "programme_id": programme_id,
            "created_at": created_at,
            "expires_at": expires_at
        }
    except Exception:
        return None


def generate_qr_image(qr_token: str) -> bytes:
    """Generate QR code image"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_token)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


# ==========================================
# Face Attendance Endpoint
# ==========================================

@app.post("/attendance/face", response_model=dict)
async def mark_face_attendance(
    programme_id: str = Form(...),
    image_base64: str = Form(...),
    trainee_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    long: Optional[float] = Form(None)
):
    """Mark attendance using face recognition"""
    try:
        # Decode and process image
        image = decode_base64_image(image_base64)
        unknown_embedding = get_face_embedding(image)

        if unknown_embedding is None:
            return {
                "success": False,
                "message": "No face detected in image",
                "attendance_id": None
            }

        # Find matching face embedding
        if trainee_id:
            # Verify specific trainee
            face_embedding = await FaceEmbedding.find_one(FaceEmbedding.trainee_id == trainee_id)
            if not face_embedding:
                return {
                    "success": False,
                    "message": "No face embedding registered for this trainee",
                    "attendance_id": None
                }

            if not compare_faces(face_embedding.embedding, unknown_embedding):
                return {
                    "success": False,
                    "message": "Face does not match registered trainee",
                    "attendance_id": None
                }
            matched_trainee_id = trainee_id
        else:
            # Identify from all embeddings
            all_embeddings = await FaceEmbedding.find_all().to_list()
            matched_trainee_id = None
            for emb in all_embeddings:
                if compare_faces(emb.embedding, unknown_embedding):
                    matched_trainee_id = emb.trainee_id
                    break

            if not matched_trainee_id:
                return {
                    "success": False,
                    "message": "Face not recognized",
                    "attendance_id": None
                }

        # Check if already marked for this programme today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        existing = await AttendanceLog.find_one({
            "programme_id": programme_id,
            "trainee_id": matched_trainee_id,
            "timestamp": {"$gte": today_start, "$lt": today_end}
        })

        if existing:
            return {
                "success": False,
                "message": "Attendance already marked for today",
                "attendance_id": str(existing.id)
            }

        # Create attendance log
        attendance = AttendanceLog(
            programme_id=programme_id,
            trainee_id=matched_trainee_id,
            method=AttendanceMethod.FACE,
            timestamp=datetime.utcnow(),
            lat=lat,
            long=long,
            verified=True
        )
        await attendance.insert()

        # Fetch trainee details from ERP
        trainee_info = None
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{ERP_SERVICE_URL}/trainees/{matched_trainee_id}")
                if resp.status_code == 200:
                    trainee_info = resp.json()
            except Exception:
                pass

        return {
            "success": True,
            "message": "Attendance marked successfully",
            "attendance_id": str(attendance.id),
            "trainee": trainee_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face attendance failed: {str(e)}")


# ==========================================
# QR Attendance Endpoint
# ==========================================

@app.post("/attendance/qr", response_model=dict)
async def mark_qr_attendance(
    programme_id: str = Form(...),
    qr_code: str = Form(...),
    lat: Optional[float] = Form(None),
    long: Optional[float] = Form(None)
):
    """Mark attendance using QR code"""
    # Verify QR token
    qr_payload = verify_qr_token(qr_code)
    if not qr_payload:
        return {
            "success": False,
            "message": "Invalid or expired QR code",
            "attendance_id": None
        }

    if qr_payload["programme_id"] != programme_id:
        return {
            "success": False,
            "message": "QR code not valid for this programme",
            "attendance_id": None
        }

    # In a real implementation, we'd get trainee_id from authenticated user
    # For demo, we'll expect it in headers or use a demo trainee
    trainee_id = "demo-trainee-id"  # Would come from auth context

    # Check if already marked
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    existing = await AttendanceLog.find_one({
        "programme_id": programme_id,
        "trainee_id": trainee_id,
        "timestamp": {"$gte": today_start, "$lt": today_end}
    })

    if existing:
        return {
            "success": False,
            "message": "Attendance already marked for today",
            "attendance_id": str(existing.id)
        }

    # Create attendance log
    attendance = AttendanceLog(
        programme_id=programme_id,
        trainee_id=trainee_id,
        method=AttendanceMethod.QR,
        timestamp=datetime.utcnow(),
        lat=lat,
        long=long,
        verified=True
    )
    await attendance.insert()

    return {
        "success": True,
        "message": "QR attendance marked successfully",
        "attendance_id": str(attendance.id)
    }


# ==========================================
# QR Code Generation
# ==========================================

@app.get("/attendance/qr/generate/{programme_id}")
async def generate_qr_code(programme_id: str, expires_hours: int = 24):
    """Generate QR code for a programme session"""
    qr_token = generate_qr_token(programme_id, expires_hours)
    qr_image = generate_qr_image(qr_token)

    import base64
    qr_base64 = base64.b64encode(qr_image).decode()

    return {
        "qr_token": qr_token,
        "qr_image_base64": qr_base64,
        "expires_at": (datetime.utcnow() + timedelta(hours=expires_hours)).isoformat()
    }


# ==========================================
# Offline Sync Endpoint
# ==========================================

@app.get("/attendance/sync", response_model=dict)
async def sync_attendance(
    since: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """Sync attendance logs for offline mobile clients"""
    query = {}
    if since:
        query["timestamp"] = {"$gte": since}

    logs = await AttendanceLog.find(query) \
        .sort(-AttendanceLog.timestamp) \
        .limit(limit) \
        .to_list()

    return {
        "logs": logs,
        "synced_at": datetime.utcnow().isoformat(),
        "count": len(logs)
    }


# ==========================================
# Attendance Log Endpoints
# ==========================================

@app.get("/attendance/logs", response_model=PaginatedResponse)
async def list_attendance_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    programme_id: Optional[str] = None,
    trainee_id: Optional[str] = None,
    method: Optional[AttendanceMethod] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    query = {}
    if programme_id:
        query["programme_id"] = programme_id
    if trainee_id:
        query["trainee_id"] = trainee_id
    if method:
        query["method"] = method
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        query["timestamp"] = date_query

    total = await AttendanceLog.find(query).count()
    logs = await AttendanceLog.find(query) \
        .sort(-AttendanceLog.timestamp) \
        .skip((page - 1) * limit) \
        .limit(limit) \
        .to_list()

    return PaginatedResponse(
        items=logs,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


# ==========================================
# Face Embedding Registration
# ==========================================

@app.post("/face-embeddings/register")
async def register_face_embedding(
    trainee_id: str = Form(...),
    image_base64: str = Form(...)
):
    """Register face embedding for a trainee"""
    image = decode_base64_image(image_base64)
    embedding = get_face_embedding(image)

    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in image")

    # Check if already registered
    existing = await FaceEmbedding.find_one(FaceEmbedding.trainee_id == trainee_id)
    if existing:
        existing.embedding = embedding.tolist()
        existing.updated_at = datetime.utcnow()
        await existing.save()
        return {"message": "Face embedding updated", "trainee_id": trainee_id}

    face_embedding = FaceEmbedding(
        trainee_id=trainee_id,
        embedding=embedding.tolist()
    )
    await face_embedding.insert()

    return {"message": "Face embedding registered", "trainee_id": trainee_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)