#!/usr/bin/env python3
"""
Seed demo data for Sahakar Setu
Run with: docker compose exec erp-service python scripts/seed_demo.py
"""

import asyncio
import random
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

import sys
import os
from pathlib import Path
shared_dir = Path(__file__).resolve().parent.parent / "packages" / "shared" / "types"
if str(shared_dir) not in sys.path:
    sys.path.insert(0, str(shared_dir))

from models import (
    Institution, Programme, Nomination, Trainee, TraineeProfile,
    Trainer, Timetable, HostelAllocation,
    Course, Module, Assessment, Question, Enrollment, Certificate,
    AttendanceLog, FaceEmbedding,
    Employer, JobPosting, JobApplication, SkillProfile,
    AnalyticsEvent,
    InstitutionType, NominationStatus, ProgrammeStatus,
    AssessmentType, AttendanceMethod, JobApplicationStatus
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "sahakar")

# Realistic Indian data
PACS_NAMES = [
    "Mahila Dairy Cooperative", "Gramin Krishi Cooperative", "Sahyadri Farmers Coop",
    "Green Valley Dairy", "Sunrise Agri Coop", "Progressive Farmers Union",
    "Rural Women Cooperative", "Organic Farming Collective", "Milk Producers Union",
    "Coastal Fisheries Coop", "Hill Area Farmers Society", "Tribal Craft Cooperative"
]

DISTRICTS = [
    ("Ahmednagar", "Maharashtra"), ("Pune", "Maharashtra"), ("Nashik", "Maharashtra"),
    ("Bangalore Rural", "Karnataka"), ("Mysore", "Karnataka"), ("Belgaum", "Karnataka"),
    ("Chennai", "Tamil Nadu"), ("Coimbatore", "Tamil Nadu"), ("Madurai", "Tamil Nadu"),
    ("Hyderabad", "Telangana"), ("Warangal", "Telangana"), ("Nizamabad", "Telangana"),
    ("Jaipur", "Rajasthan"), ("Jodhpur", "Rajasthan"), ("Udaipur", "Rajasthan"),
    ("Lucknow", "Uttar Pradesh"), ("Kanpur", "Uttar Pradesh"), ("Varanasi", "Uttar Pradesh"),
    ("Bhopal", "Madhya Pradesh"), ("Indore", "Madhya Pradesh"), ("Gwalior", "Madhya Pradesh"),
    ("Guwahati", "Assam"), ("Dibrugarh", "Assam"), ("Silchar", "Assam"),
    ("Patna", "Bihar"), ("Gaya", "Bihar"), ("Muzaffarpur", "Bihar"),
]

INDIAN_NAMES = [
    "Priya Patil", "Rajesh Kumar", "Sunita Devi", "Amit Shah", "Neha Singh",
    "Vikram Reddy", "Anjali Nair", "Suresh Yadav", "Kavita Joshi", "Manoj Tiwari",
    "Pooja Sharma", "Rahul Verma", "Deepika Rao", "Sanjay Gupta", "Meera Iyer",
    "Arjun Malhotra", "Shreya Desai", "Kiran Pawar", "Divya Menon", "Rohit Bansal",
    "Swati Kulkarni", "Nitin Agarwal", "Rashmi Bhatt", "Prakash Nayak", "Geeta Pillai",
    "Harish Chandra", "Lakshmi Narayan", "Vijayalakshmi", "Mahesh Babu", "Sita Ram",
    "Ganesh Prasad", "Durga Devi", "Shiva Kumar", "Parvati Bai", "Hanuman Singh",
    "Laxmi Kant", "Saraswati Devi", "Krishna Murthy", "Radha Krishna", "Gopal Das",
]

SKILLS_POOL = [
    "Dairy Farming", "Cooperative Management", "Financial Accounting", "Marketing & Sales",
    "Quality Control", "Animal Husbandry", "Milk Procurement", "Rural Development",
    "Women Empowerment", "Digital Literacy", "Organic Farming", "Agri Business",
    "Supply Chain", "Project Management", "Community Mobilization", "Governance",
    "Audit & Compliance", "Member Relations", "Credit Management", "Insurance",
]

COMPANIES = [
    ("Amul (GCMMF)", "cooperative", "Anand, Gujarat"),
    ("Mother Dairy", "cooperative", "Delhi NCR"),
    ("NABARD", "government", "Mumbai, Maharashtra"),
    ("Maharashtra State Cooperative Bank", "cooperative", "Mumbai, Maharashtra"),
    ("Karnataka Milk Federation", "cooperative", "Bangalore, Karnataka"),
    ("Tamil Nadu Cooperative Milk Producers", "cooperative", "Chennai, Tamil Nadu"),
    ("Telangana Dairy Development", "cooperative", "Hyderabad, Telangana"),
    ("Rajasthan Cooperative Dairy", "cooperative", "Jaipur, Rajasthan"),
    ("UP Cooperative Federation", "cooperative", "Lucknow, Uttar Pradesh"),
    ("Bihar State Milk Coop", "cooperative", "Patna, Bihar"),
    ("Tata Trusts", "ngo", "Mumbai, Maharashtra"),
    ("Reliance Foundation", "corporate", "Mumbai, Maharashtra"),
    ("ITC Limited", "corporate", "Kolkata, West Bengal"),
    ("Hindustan Unilever", "corporate", "Mumbai, Maharashtra"),
    ("Godrej Agrovet", "corporate", "Mumbai, Maharashtra"),
]

JOB_TITLES = [
    "Dairy Supervisor", "Field Officer", "Quality Assurance Officer",
    "Procurement Officer", "Plant Operator", "Marketing Executive",
    "Finance Assistant", "Cooperative Manager", "Project Coordinator",
    "Training Coordinator", "Extension Officer", "Veterinary Assistant",
    "Lab Technician", "Accounts Assistant", "Sales Representative",
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    
    await init_beanie(
        database=db,
        document_models=[
            Institution, Programme, Nomination, Trainee, Trainer,
            Timetable, HostelAllocation,
            Course, Module, Assessment, Question, Enrollment, Certificate,
            AttendanceLog, FaceEmbedding,
            Employer, JobPosting, JobApplication, SkillProfile,
            AnalyticsEvent,
        ]
    )
    
    print("Connected to MongoDB. Seeding data...")
    
    # Clear existing data
    await Institution.delete_all()
    await Programme.delete_all()
    await Nomination.delete_all()
    await Trainee.delete_all()
    await Trainer.delete_all()
    await Timetable.delete_all()
    await HostelAllocation.delete_all()
    await Course.delete_all()
    await Module.delete_all()
    await Assessment.delete_all()
    await Question.delete_all()
    await Enrollment.delete_all()
    await Certificate.delete_all()
    await AttendanceLog.delete_all()
    await FaceEmbedding.delete_all()
    await Employer.delete_all()
    await JobPosting.delete_all()
    await JobApplication.delete_all()
    await SkillProfile.delete_all()
    await AnalyticsEvent.delete_all()
    
    print("Cleared existing data.")
    
    # Create Institutions
    institutions = []
    for i, (name, type_val) in enumerate([
        ("VAMNICOM", "VAMNICOM"),
        ("RICM Bangalore", "RICM"),
        ("RICM Chandigarh", "RICM"),
        ("RICM Gandhinagar", "RICM"),
        ("RICM Kalyani", "RICM"),
        ("RICM Patna", "RICM"),
        ("ICM Chennai", "ICM"),
        ("ICM Dehradun", "ICM"),
        ("ICM Guwahati", "ICM"),
        ("ICM Hyderabad", "ICM"),
        ("ICM Imphal", "ICM"),
        ("ICM Jaipur", "ICM"),
        ("ICM Kannur", "ICM"),
        ("ICM Lucknow", "ICM"),
        ("ICM Madurai", "ICM"),
        ("ICM Nagpur", "ICM"),
        ("ICM Pune", "ICM"),
        ("ICM Trivandrum", "ICM"),
    ]):
        # Find matching district/state
        district, state = DISTRICTS[i % len(DISTRICTS)]
        inst = Institution(
            name=name,
            type=InstitutionType(type_val),
            state=state,
            district=district,
            contact={"phone": f"+91-{random.randint(1000000000, 9999999999)}", "email": f"info@{name.lower().replace(' ', '')}.gov.in"},
            is_active=True
        )
        await inst.insert()
        institutions.append(inst)
    
    print(f"Created {len(institutions)} institutions.")
    
    # Create Programmes
    programme_titles = [
        "Dairy Cooperative Management", "Agricultural Marketing", "Financial Management for Cooperatives",
        "Digital Skills for Rural Youth", "Women Leadership in Cooperatives", "Organic Farming Certification",
        "Milk Processing Technology", "Cooperative Banking & Finance", "Agri Business Management",
        "Rural Entrepreneurship", "Sustainable Agriculture", "Cooperative Governance"
    ]
    
    programmes = []
    for inst in institutions:
        for j in range(random.randint(1, 2)):
            title = random.choice(programme_titles)
            start = datetime.utcnow() + timedelta(days=random.randint(-60, 30))
            end = start + timedelta(days=random.randint(30, 90))
            prog = Programme(
                institution_id=str(inst.id),
                title=f"{title} - Batch {random.randint(1, 5)}",
                description=f"Comprehensive training programme on {title.lower()} for cooperative sector professionals.",
                start_date=start,
                end_date=end,
                capacity=random.randint(30, 60),
                status=random.choice(list(ProgrammeStatus)),
                nominee_count=0
            )
            await prog.insert()
            programmes.append(prog)
    
    print(f"Created {len(programmes)} programmes.")
    
    # Create Nominations & Trainees
    trainees = []
    nominations = []
    
    for prog in programmes:
        num_nominees = random.randint(5, min(15, prog.capacity))
        for k in range(num_nominees):
            name = random.choice(INDIAN_NAMES)
            district, state = random.choice(DISTRICTS)
            pacs = random.choice(PACS_NAMES)
            
            nom = Nomination(
                programme_id=str(prog.id),
                nominating_body=f"{state} State Cooperative Department",
                nominee_name=name,
                nominee_phone=f"+91-{random.randint(7000000000, 9999999999)}",
                nominee_email=f"{name.lower().replace(' ', '.')}@email.com",
                nominee_district=district,
                nominee_pacs_id=f"{state[:3].upper()}-{random.randint(100, 999)}",
                status=random.choice([NominationStatus.APPROVED, NominationStatus.PENDING])
            )
            await nom.insert()
            nominations.append(nom)
            
            if nom.status == NominationStatus.APPROVED:
                trainee = Trainee(
                    user_id=f"user-{prog.id}-{k}",
                    institution_id=prog.institution_id,
                    profile=TraineeProfile(
                        name=name,
                        phone=nom.nominee_phone,
                        district=district,
                        pacs_id=nom.nominee_pacs_id,
                        skills=random.sample(SKILLS_POOL, random.randint(2, 5)),
                        education=random.choice(["10th", "12th", "Diploma", "Graduate", "Post Graduate"]),
                        experience_years=random.randint(0, 10)
                    ),
                    is_active=True
                )
                await trainee.insert()
                trainees.append(trainee)
                prog.nominee_count += 1
    
    # Update programme nominee counts
    for prog in programmes:
        await prog.save()
    
    print(f"Created {len(nominations)} nominations and {len(trainees)} trainees.")
    
    # Create Trainers
    for inst in institutions:
        for j in range(random.randint(2, 4)):
            trainer = Trainer(
                user_id=f"trainer-{inst.id}-{j}",
                institution_id=str(inst.id),
                specialization=random.sample(SKILLS_POOL, random.randint(2, 4)),
                is_active=True
            )
            await trainer.insert()
    
    print("Created trainers.")
    
    # Create Timetables
    for prog in programmes:
        for day in range(random.randint(5, 15)):
            date = prog.start_date + timedelta(days=day)
            if date > prog.end_date:
                break
            for session in range(random.randint(1, 3)):
                tt = Timetable(
                    programme_id=str(prog.id),
                    date=date,
                    start_time=f"{9 + session * 3}:00",
                    end_time=f"{11 + session * 3}:00",
                    topic=f"Session {session + 1}: {random.choice(['Theory', 'Practical', 'Case Study', 'Group Discussion'])}",
                    trainer_id=None,
                    room=f"Room {random.randint(101, 110)}"
                )
                await tt.insert()
    
    print("Created timetables.")
    
    # Create Courses & Modules
    for prog in programmes:
        for order, title in enumerate(["Module 1: Introduction", "Module 2: Core Concepts", "Module 3: Practical Applications", "Module 4: Assessment"]):
            course = Course(
                programme_id=str(prog.id),
                title=title,
                description=f"Course covering {title.lower()}",
                language=random.choice(["en", "hi", "ta", "te"]),
                order=order
            )
            await course.insert()
            
            for m_order in range(random.randint(2, 5)):
                module = Module(
                    course_id=str(course.id),
                    title=f"Lesson {m_order + 1}",
                    video_url=f"https://example.com/video/{course.id}/{m_order}",
                    document_url=f"https://example.com/doc/{course.id}/{m_order}",
                    order=m_order,
                    duration_min=random.randint(30, 90)
                )
                await module.insert()
                
                # Assessment
                assessment = Assessment(
                    module_id=str(module.id),
                    title=f"{title} - Assessment",
                    type=AssessmentType.MCQ,
                    passing_score=60,
                    time_limit=30
                )
                await assessment.insert()
                
                # Questions
                for q in range(random.randint(5, 10)):
                    question = Question(
                        assessment_id=str(assessment.id),
                        text=f"Sample question {q + 1} for {title}?",
                        options=["Option A", "Option B", "Option C", "Option D"],
                        correct_answer="Option A",
                        explanation="This is the correct answer because...",
                        language=course.language
                    )
                    await question.insert()
    
    print("Created courses, modules, assessments, and questions.")
    
    # Create Enrollments & Certificates
    for trainee in trainees:
        prog = next((p for p in programmes if p.institution_id == trainee.institution_id), None)
        if not prog:
            continue
        
        courses = await Course.find(Course.programme_id == prog.id).to_list()
        for course in courses:
            enrollment = Enrollment(
                trainee_id=str(trainee.id),
                course_id=str(course.id),
                progress={},
                completed_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)) if random.random() > 0.3 else None
            )
            await enrollment.insert()
            
            if enrollment.completed_at:
                cert = Certificate(
                    trainee_id=str(trainee.id),
                    programme_id=str(prog.id),
                    course_id=str(course.id),
                    issue_date=enrollment.completed_at,
                    certificate_number=f"NCCT-2024-{prog.institution_id[:3].upper()}-{random.randint(10000, 99999)}",
                    pdf_url=f"https://minio:9000/sahakar-files/certificates/{trainee.id}_{course.id}.pdf",
                    hash=f"sha256:{random.getrandbits(256):064x}",
                    verification_url=f"https://verify.sahakar-setu.in/cert/NCCT-2024-{prog.institution_id[:3].upper()}-{random.randint(10000, 99999)}"
                )
                await cert.insert()
    
    print("Created enrollments and certificates.")
    
    # Create Attendance Logs
    for trainee in trainees:
        prog = next((p for p in programmes if p.institution_id == trainee.institution_id), None)
        if not prog:
            continue
        
        for day in range(random.randint(10, 20)):
            date = prog.start_date + timedelta(days=day)
            if date > prog.end_date:
                break
            
            if random.random() > 0.1:  # 90% attendance
                attendance = AttendanceLog(
                    programme_id=str(prog.id),
                    trainee_id=str(trainee.id),
                    method=random.choice([AttendanceMethod.FACE, AttendanceMethod.QR]),
                    timestamp=date,
                    lat=None,
                    long=None,
                    verified=True
                )
                await attendance.insert()
    
    # Face Embeddings (demo)
    for trainee in trainees[:10]:  # Only first 10 for demo
        embedding = [random.random() for _ in range(128)]
        face_emb = FaceEmbedding(
            trainee_id=str(trainee.id),
            embedding=embedding,
            quality_score=round(random.uniform(0.7, 1.0), 2)
        )
        await face_emb.insert()
    
    print("Created attendance logs and face embeddings.")
    
    # Create Employers & Jobs
    employers = []
    for name, ctype, location in COMPANIES:
        emp = Employer(
            name=name,
            contact={"email": f"hr@{name.lower().replace(' ', '').replace('(', '').replace(')', '')}.com", "phone": f"+91-{random.randint(1000000000, 9999999999)}", "address": location},
            company_type=ctype,
            verified=random.random() > 0.2
        )
        await emp.insert()
        employers.append(emp)
    
    print(f"Created {len(employers)} employers.")
    
    jobs = []
    for emp in employers:
        for _ in range(random.randint(1, 3)):
            job = JobPosting(
                employer_id=str(emp.id),
                title=random.choice(JOB_TITLES),
                description=f"We are looking for a {random.choice(JOB_TITLES).lower()} to join our team at {emp.name}.",
                required_skills=random.sample(SKILLS_POOL, random.randint(3, 6)),
                preferred_skills=random.sample(SKILLS_POOL, random.randint(1, 3)),
                location=emp.contact["address"],
                stipend={"amount": random.randint(15000, 50000), "currency": "INR", "period": "month"},
                deadline=datetime.utcnow() + timedelta(days=random.randint(15, 60)),
                is_active=True
            )
            await job.insert()
            jobs.append(job)
    
    print(f"Created {len(jobs)} job postings.")
    
    # Create Job Applications
    for trainee in trainees[:50]:  # First 50 trainees apply
        for job in random.sample(jobs, random.randint(1, 3)):
            required_skills = set(job.required_skills)
            trainee_skills = set(trainee.profile.skills)
            match = len(required_skills & trainee_skills) / len(required_skills) if required_skills else 0
            
            app = JobApplication(
                trainee_id=str(trainee.id),
                job_id=str(job.id),
                status=random.choice(list(JobApplicationStatus)),
                match_score=round(match * 100, 2),
                cover_letter=f"I am interested in this position at {next((e.name for e in employers if str(e.id) == str(job.employer_id)), 'the company')}."
            )
            await app.insert()
    
    print("Created job applications.")
    
    # Create Skill Profiles
    for trainee in trainees:
        certs = await Certificate.find(Certificate.trainee_id == str(trainee.id)).to_list()
        skills = list(trainee.profile.skills)
        for cert in certs:
            skills.extend([s.strip() for s in cert.course_id.split() if s.strip()])
        
        profile = SkillProfile(
            trainee_id=str(trainee.id),
            skills=list(set(skills)),
            certifications=[{"certificate_id": str(c.id), "title": c.course_id, "issue_date": c.issue_date} for c in certs],
            assessment_scores=[],
            updated_at=datetime.utcnow()
        )
        await profile.insert()
    
    print("Created skill profiles.")
    
    # Create Analytics Events
    event_types = ["enrollment", "completion", "attendance", "application", "placement", "certificate_issued"]
    for _ in range(500):
        event = AnalyticsEvent(
            event_type=random.choice(event_types),
            entity_id=str(random.choice(trainees).id) if trainees else "unknown",
            entity_type="trainee",
            metadata={"programme_id": str(random.choice(programmes).id) if programmes else "unknown"},
            timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 365))
        )
        await event.insert()
    
    print("Created analytics events.")
    
    print("\n[OK] Seeding complete!")
    print(f"   Institutions: {len(institutions)}")
    print(f"   Programmes: {len(programmes)}")
    print(f"   Nominations: {len(nominations)}")
    print(f"   Trainees: {len(trainees)}")
    print(f"   Employers: {len(employers)}")
    print(f"   Jobs: {len(jobs)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())