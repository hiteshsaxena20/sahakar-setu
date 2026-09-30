# AI Service - FastAPI Application
# Quiz Generation, Skill Gap, Embeddings, RAG Chatbot, Job Matching

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
import httpx
import json

# Import models
from app.models import EmbeddingDocument, ChatSession, ChatMessage

# Import shared types (from local copy)
from app.shared_models import PaginationParams, PaginatedResponse, HealthResponse


# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY")
BHASHINI_PIPELINE_ID = os.getenv("BHASHINI_PIPELINE_ID")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "sahakar-embeddings")
SERVICE_NAME = os.getenv("SERVICE_NAME", "ai-service")
PORT = int(os.getenv("PORT", "8006"))


# Initialize AI clients
openai_client = None
gemini_model = None
sentence_transformer = None
pinecone_index = None

try:
    if OPENAI_API_KEY:
        from openai import AsyncOpenAI
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
except:
    pass

try:
    if GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
except:
    pass

try:
    from sentence_transformers import SentenceTransformer
    sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dim
except:
    pass

try:
    if PINECONE_API_KEY:
        from pinecone import Pinecone
        pc = Pinecone(api_key=PINECONE_API_KEY)
        pinecone_index = pc.Index(PINECONE_INDEX)
except:
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(
        database=db,
        document_models=[EmbeddingDocument, ChatSession]
    )
    app.state.db = db
    app.state.client = client
    print(f"[{SERVICE_NAME}] Connected to MongoDB: {MONGO_DB}")
    yield
    client.close()
    print(f"[{SERVICE_NAME}] Disconnected from MongoDB")


app = FastAPI(
    title="AI Service",
    description="Quiz Generation, Skill Gap, Embeddings, RAG Chatbot, Job Matching for NCCT",
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
# Helper Functions
# ==========================================

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using sentence-transformers or OpenAI"""
    if sentence_transformer:
        embeddings = sentence_transformer.encode(texts)
        return embeddings.tolist()
    elif openai_client:
        response = await openai_client.embeddings.create(
            input=texts,
            model="text-embedding-3-small"
        )
        return [d.embedding for d in response.data]
    else:
        # Fallback: random embeddings for demo
        import random
        return [[random.random() for _ in range(384)] for _ in texts]


async def call_llm(prompt: str, system_prompt: str = "", max_tokens: int = 2000) -> str:
    """Call LLM (OpenAI or Gemini)"""
    if openai_client:
        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response.choices[0].message.content
    elif gemini_model:
        response = gemini_model.generate_content(f"{system_prompt}\n\n{prompt}")
        return response.text
    else:
        return "AI service not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY."


# ==========================================
# Quiz Generation
# ==========================================

@app.post("/quiz/generate")
async def generate_quiz(
    content: str,
    language: str = "en",
    num_questions: int = 10,
    difficulty: str = "medium",
    question_type: str = "MCQ"
):
    """Generate quiz questions from content using LLM"""
    system_prompt = f"""You are an expert educator creating {question_type} questions for cooperative training programmes in India.
Generate {num_questions} {difficulty} difficulty questions in {language} language.
Return ONLY valid JSON array of questions with this structure:
[{{"text": "Question text", "options": ["A", "B", "C", "D"], "correct_answer": "A", "explanation": "Why this is correct", "language": "{language}"}}]"""

    prompt = f"""Content to create questions from:
{content[:4000]}

Generate {num_questions} {question_type} questions."""

    try:
        response_text = await call_llm(prompt, system_prompt, max_tokens=3000)
        # Parse JSON from response
        import re
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            questions = json.loads(json_match.group())
        else:
            questions = json.loads(response_text)

        return {
            "questions": questions[:num_questions],
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "num_questions": len(questions),
                "language": language,
                "difficulty": difficulty
            }
        }
    except Exception as e:
        # Fallback questions
        return {
            "questions": [
                {
                    "text": f"Sample question {i+1} about the content",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "Option A",
                    "explanation": "This is a sample explanation",
                    "language": language
                }
                for i in range(min(num_questions, 5))
            ],
            "metadata": {"error": str(e), "fallback": True}
        }


# ==========================================
# Skill Gap Analysis
# ==========================================

@app.post("/skill-gap")
async def analyze_skill_gap(
    trainee_id: str,
    target_role: str,
    target_skills: Optional[List[str]] = None
):
    """Analyze skill gap and recommend courses"""
    # In real implementation, fetch trainee's current skills from SkillProfile
    current_skills = ["cooperative management", "basic accounting", "communication"]

    if not target_skills:
        # Default skills for common roles
        role_skills = {
            "dairy supervisor": ["dairy farming", "milk procurement", "quality control", "team management", "financial reporting"],
            "cooperative manager": ["cooperative law", "financial management", "governance", "member relations", "audit compliance"],
            "marketing executive": ["agri marketing", "digital marketing", "brand management", "market research", "sales strategy"],
            "field officer": ["field survey", "data collection", "farmer mobilization", "scheme implementation", "reporting"]
        }
        target_skills = role_skills.get(target_role.lower(), ["leadership", "project management", "communication"])

    missing_skills = [s for s in target_skills if s.lower() not in [cs.lower() for cs in current_skills]]
    match_pct = round((len(target_skills) - len(missing_skills)) / len(target_skills) * 100, 1) if target_skills else 0

    # Recommend courses (mock)
    recommended_courses = [
        {"course_id": "course-1", "title": f"Advanced {skill.title()}", "duration_hours": 20}
        for skill in missing_skills[:3]
    ]

    return {
        "missing_skills": missing_skills,
        "recommended_courses": recommended_courses,
        "skill_match_percentage": match_pct,
        "current_skills": current_skills,
        "target_skills": target_skills
    }


# ==========================================
# Embeddings
# ==========================================

@app.post("/embed")
async def create_embeddings(
    texts: List[str],
    content_type: str,
    metadata: Optional[List[Dict[str, Any]]] = None
):
    """Create and store embeddings"""
    embeddings = await generate_embeddings(texts)

    docs = []
    for i, (text, embedding) in enumerate(zip(texts, embeddings)):
        doc = EmbeddingDocument(
            content_type=content_type,
            content_id=metadata[i].get("content_id", f"{content_type}-{datetime.utcnow().timestamp()}-{i}") if metadata else f"{content_type}-{i}",
            embedding=embedding,
            metadata=metadata[i] if metadata else {},
            text_content=text
        )
        await doc.insert()
        docs.append(doc)

    # Also upsert to Pinecone if available
    if pinecone_index:
        vectors = [
            {
                "id": str(doc.id),
                "values": embedding,
                "metadata": {**(metadata[i] if metadata else {}), "text": text[:500], "content_type": content_type}
            }
            for i, (doc, embedding) in enumerate(zip(docs, embeddings))
        ]
        pinecone_index.upsert(vectors=vectors)

    return {
        "embeddings": embeddings,
        "ids": [str(doc.id) for doc in docs]
    }


# ==========================================
# RAG Chatbot
# ==========================================

@app.post("/chat")
async def rag_chat(
    trainee_id: str,
    message: str,
    context: Optional[Dict[str, Any]] = None,
    language: str = "en"
):
    """RAG-based career counseling chatbot"""
    # Get or create chat session
    session = await ChatSession.find_one(ChatSession.trainee_id == trainee_id)
    if not session:
        session = ChatSession(trainee_id=trainee_id, messages=[])
        await session.insert()

    # Add user message
    user_msg = ChatMessage(role="user", content=message, timestamp=datetime.utcnow())
    session.messages.append(user_msg)

    # Retrieve relevant context from embeddings
    query_embedding = (await generate_embeddings([message]))[0]
    relevant_docs = []

    if pinecone_index:
        results = pinecone_index.query(vector=query_embedding, top_k=5, include_metadata=True)
        relevant_docs = [r.metadata.get("text", "") for r in results.matches]

    # Build context for LLM
    context_text = "\n".join(relevant_docs) if relevant_docs else "No specific context available."
    system_prompt = f"""You are a career counselor for cooperative sector trainees in India.
Use the following context from NCCT schemes and training materials to answer:
{context_text}

Answer in {language} language. Be helpful, specific, and encouraging.
If you don't know, say so and suggest relevant training programmes."""

    # Get LLM response
    response_text = await call_llm(message, system_prompt)

    # Add assistant message
    assistant_msg = ChatMessage(role="assistant", content=response_text, timestamp=datetime.utcnow())
    session.messages.append(assistant_msg)
    session.updated_at = datetime.utcnow()
    await session.save()

    return {
        "response": response_text,
        "sources": relevant_docs[:3],
        "session_id": str(session.id)
    }


# ==========================================
# Job Matching
# ==========================================

@app.post("/job-match")
async def match_job_candidates(
    job_id: str,
    top_k: int = 10
):
    """Match candidates to job using embeddings"""
    # In real implementation:
    # 1. Fetch job from employment service
    # 2. Generate embedding for job requirements
    # 3. Query Pinecone for similar trainee profiles
    # 4. Return ranked candidates

    # Mock response for demo
    return {
        "ranked_candidates": [
            {
                "trainee_id": f"trainee-{i}",
                "name": f"Trainee {i}",
                "match_score": round(90 - i * 5, 1),
                "skills": ["cooperative management", "dairy farming", "financial reporting"],
                "certificates": ["Dairy Coop Management", "Financial Literacy"]
            }
            for i in range(1, min(top_k + 1, 6))
        ]
    }


# ==========================================
# Translation (Bhashini)
# ==========================================

@app.post("/translate")
async def translate_text(
    text: str,
    source_language: str = "en",
    target_language: str = "hi"
):
    """Translate text using Bhashini API"""
    if not BHASHINI_API_KEY:
        return {
            "translated_text": f"[{target_language}] {text}",
            "source_language": source_language,
            "target_language": target_language,
            "fallback": True
        }

    # Bhashini API call (simplified)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://bhashini-api-endpoint/translate",
                headers={"Authorization": f"Bearer {BHASHINI_API_KEY}"},
                json={
                    "pipeline_id": BHASHINI_PIPELINE_ID,
                    "input": text,
                    "source_lang": source_language,
                    "target_lang": target_language
                },
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass

    return {
        "translated_text": f"[{target_language}] {text}",
        "source_language": source_language,
        "target_language": target_language,
        "fallback": True
    }


# ==========================================
# Embedding Search
# ==========================================

@app.get("/embeddings/search")
async def search_embeddings(
    query: str,
    content_type: Optional[str] = None,
    top_k: int = 10
):
    """Semantic search over embeddings"""
    query_embedding = (await generate_embeddings([query]))[0]

    if pinecone_index:
        filter_dict = {"content_type": content_type} if content_type else None
        results = pinecone_index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict
        )
        return {
            "results": [
                {
                    "id": r.id,
                    "score": r.score,
                    "text": r.metadata.get("text", ""),
                    "content_type": r.metadata.get("content_type", "")
                }
                for r in results.matches
            ]
        }

    # Fallback: MongoDB vector search (if available)
    return {"results": [], "message": "Vector search not configured"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)