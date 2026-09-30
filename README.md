# Sahakar Setu / NCCT-Connect

**Unified Training Institution ERP + AI-LMS + Employment Exchange** for NCCT's VAMNICOM/RICM/ICM network.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Apps                               │
│  Web Admin (React)  |  Mobile (Flutter, offline-first)          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ REST/GraphQL (API Gateway :3000)
        ┌──────────────┼───────────────┬───────────────┬──────────┐
        │              │               │               │          │
 ┌──────▼─────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼────┐ ┌──▼────┐
 │ ERP Svc    │ │ LMS Svc     │ │ Attendance  │ │ Employment │ │Analytics│
 │ :8001      │ │ :8002       │ │ Svc :8003   │ │ Svc :8004  │ │Svc:8005│
 └──────┬─────┘ └──────┬──────┘ └──────┬──────┘ └───────┬────┘ └──┬────┘
        │              │               │               │         │
        └──────────────┴───────┬───────┴───────────────┴─────────┘
                               │
                    ┌──────────▼──────────┐
                    │    AI Service :8006  │
                    │ - Quiz Generation   │
                    │ - Skill Gap Engine  │
                    │ - Job Matching      │
                    │ - RAG Chatbot       │
                    │ - Embeddings        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     Data Layer       │
                    │ MongoDB + Redis +    │
                    │ MinIO + Pinecone     │
                    └─────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **API Gateway** | Node.js/Express + JWT + RBAC |
| **Auth** | Keycloak (OAuth2/OIDC) |
| **Backend Services** | FastAPI (Python) + Beanie ODM + Motor |
| **Database** | MongoDB 7.0 (replica set) |
| **Cache** | Redis 7 |
| **File Storage** | MinIO (S3-compatible) |
| **Vector Search** | Pinecone (or MongoDB Atlas Vector Search) |
| **AI/ML** | LangChain + OpenAI/Gemini + sentence-transformers |
| **Face Recognition** | face_recognition (dlib) |
| **Frontend Web** | React 18 + TypeScript + Tailwind + Vite + TanStack Query |
| **Mobile** | Flutter + sqflite (offline) + dio + freezed |
| **Translation** | Bhashini API + IndicTrans2 fallback |
| **CI/CD** | GitHub Actions |

## Quick Start

### Prerequisites
- Docker Desktop / Docker Compose
- Node.js 20+ (for API Gateway & Web Admin)
- Python 3.11+ (for local FastAPI development)
- Flutter 3.16+ (for mobile)

### 1. Clone & Configure
```bash
cd sahakar-setu
cp .env.example .env
# Edit .env with your API keys (OPENAI_API_KEY, BHASHINI_API_KEY, etc.)
```

### 2. Start All Services
```bash
docker compose up -d
```

### 3. Verify Health
```bash
# Check all containers
docker compose ps

# Check individual service health
curl http://localhost:3000/health           # API Gateway
curl http://localhost:8001/health           # ERP Service
curl http://localhost:8002/health           # LMS Service
curl http://localhost:8003/health           # Attendance Service
curl http://localhost:8004/health           # Employment Service
curl http://localhost:8005/health           # Analytics Service
curl http://localhost:8006/health           # AI Service
```

### 4. Access Keycloak
- URL: http://localhost:8080
- Admin: `admin` / `admin` (from .env)
- Realm: `sahakar` (pre-configured with roles)

### 5. Seed Demo Data
```bash
docker compose exec erp-service python scripts/seed_demo.py
```

### 6. Start Frontend (Development)
```bash
# API Gateway (if not using Docker)
cd services/api-gateway && npm install && npm run dev

# Web Admin
cd clients/web-admin && npm install && npm run dev

# Mobile
cd clients/mobile && flutter pub get && flutter run
```

## Service Endpoints

| Service | Port | Swagger Docs | Health |
|---------|------|--------------|--------|
| API Gateway | 3000 | - | `/health` |
| ERP Service | 8001 | `/docs` | `/health` |
| LMS Service | 8002 | `/docs` | `/health` |
| Attendance Service | 8003 | `/docs` | `/health` |
| Employment Service | 8004 | `/docs` | `/health` |
| Analytics Service | 8005 | `/docs` | `/health` |
| AI Service | 8006 | `/docs` | `/health` |
| Keycloak | 8080 | - | `/health/ready` |
| MinIO Console | 9001 | - | `/minio/health/live` |

## Keycloak Roles

| Role | Description |
|------|-------------|
| `ncct_admin` | National-level admin, full access |
| `institution_admin` | VAMNICOM/RICM/ICM admin |
| `trainer` | Course content, assessments, attendance |
| `trainee` | Learn, take quizzes, view certificates |
| `employer` | Post jobs, view candidates |
| `recruiter` | Review applications, interview scheduling |

## Demo Script (6 minutes)

1. **NCCT Admin** creates "Dairy Coop Management" programme at VAMNICOM, nominates 5 trainees
2. **Trainee** logs in on mobile (offline mode), views Hindi course, takes AI-generated quiz
3. **Live face attendance** (webcam) → QR fallback demo
4. **Certificate issued** instantly, PDF + QR verify page shown
5. **Employer** posts "Dairy Supervisor" job → AI ranks trainee #1
6. **Career chatbot** answers: "What jobs after dairy certification?"
7. **Analytics dashboard**: Maharashtra heatmap, 87% completion, 62% placement

## Project Structure

```
sahakar-setu/
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── api-contracts.md
│   └── demo-script.md
├── packages/
│   └── shared/           # Shared types (Pydantic → TS), validators, i18n
├── services/
│   ├── api-gateway/      # Express + JWT + RBAC
│   ├── auth-service/     # Keycloak realm config
│   ├── erp-service/      # FastAPI: Institution/Programme/Nomination/Trainee
│   ├── lms-service/      # FastAPI: Courses/Assessments/Certificates
│   ├── attendance-service/ # FastAPI: Face/QR attendance
│   ├── employment-service/ # FastAPI: Jobs/Matching/Chatbot
│   ├── analytics-service/  # FastAPI: Aggregations/Dashboards
│   └── ai-service/       # FastAPI: Quiz gen, Skill gap, Embeddings, RAG
├── clients/
│   ├── web-admin/        # React + TS + Tailwind
│   └── mobile/           # Flutter (offline-first)
└── scripts/
    ├── seed-demo-data.py
    ├── mongo-init.js
    └── dev-setup.sh
```

## Development

### Running Individual Services Locally
```bash
# ERP Service
cd services/erp-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# API Gateway
cd services/api-gateway
npm install
npm run dev
```

### Type Generation (Shared Types)
```bash
# Generate TS interfaces from Pydantic models
cd packages/shared
pydantic2ts --input ../../services/erp-service/app/models --output types
```

### Testing
```bash
# Backend tests
docker compose exec erp-service pytest
docker compose exec ai-service pytest

# Frontend tests
cd clients/web-admin && npm test
cd clients/mobile && flutter test
```

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `OPENAI_API_KEY` / `GEMINI_API_KEY` - For AI quiz generation, chatbot, embeddings
- `BHASHINI_API_KEY` - For multilingual translation (Govt-aligned)
- `PINECONE_API_KEY` - For vector search (RAG, skill matching)
- `JWT_SECRET` - Must be 32+ chars for production

## License

MIT License - Built for NCCT Hackathon / Cooperative Training Ecosystem