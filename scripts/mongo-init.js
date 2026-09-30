// MongoDB initialization script
// Runs on first container startup to create indexes and collections

db = db.getSiblingDB('sahakar');

// Create collections with validation
db.createCollection('institutions');
db.createCollection('programmes');
db.createCollection('nominations');
db.createCollection('trainees');
db.createCollection('trainers');
db.createCollection('timetables');
db.createCollection('hostelAllocations');
db.createCollection('courses');
db.createCollection('modules');
db.createCollection('assessments');
db.createCollection('questions');
db.createCollection('enrollments');
db.createCollection('certificates');
db.createCollection('attendanceLogs');
db.createCollection('faceEmbeddings');
db.createCollection('employers');
db.createCollection('jobPostings');
db.createCollection('jobApplications');
db.createCollection('skillProfiles');
db.createCollection('chatSessions');
db.createCollection('embeddings');
db.createCollection('analyticsEvents');

// Indexes for performance
// Institutions
db.institutions.createIndex({ "type": 1, "state": 1, "district": 1 });
db.institutions.createIndex({ "name": "text" });

// Programmes
db.programmes.createIndex({ "institutionId": 1, "status": 1 });
db.programmes.createIndex({ "startDate": 1, "endDate": 1 });
db.programmes.createIndex({ "title": "text" });

// Nominations
db.nominations.createIndex({ "programmeId": 1, "status": 1 });
db.nominations.createIndex({ "nomineePhone": 1 });
db.nominations.createIndex({ "createdAt": -1 });

// Trainees
db.trainees.createIndex({ "userId": 1 }, { unique: true });
db.trainees.createIndex({ "institutionId": 1 });
db.trainees.createIndex({ "profile.pacsId": 1 });
db.trainees.createIndex({ "profile.district": 1 });

// Trainers
db.trainers.createIndex({ "userId": 1 }, { unique: true });
db.trainers.createIndex({ "institutionId": 1 });

// Timetables
db.timetables.createIndex({ "programmeId": 1, "date": 1 });
db.timetables.createIndex({ "trainerId": 1, "date": 1 });

// Hostel Allocations
db.hostelAllocations.createIndex({ "programmeId": 1, "traineeId": 1 }, { unique: true });

// Courses
db.courses.createIndex({ "programmeId": 1, "order": 1 });
db.courses.createIndex({ "language": 1 });

// Modules
db.modules.createIndex({ "courseId": 1, "order": 1 });

// Assessments
db.assessments.createIndex({ "moduleId": 1 });

// Questions
db.questions.createIndex({ "assessmentId": 1 });

// Enrollments
db.enrollments.createIndex({ "traineeId": 1, "courseId": 1 }, { unique: true });
db.enrollments.createIndex({ "traineeId": 1 });

// Certificates
db.certificates.createIndex({ "traineeId": 1 });
db.certificates.createIndex({ "programmeId": 1 });
db.certificates.createIndex({ "certificateNumber": 1 }, { unique: true });
db.certificates.createIndex({ "hash": 1 }, { unique: true });

// Attendance Logs
db.attendanceLogs.createIndex({ "programmeId": 1, "traineeId": 1, "timestamp": -1 });
db.attendanceLogs.createIndex({ "traineeId": 1, "timestamp": -1 });
db.attendanceLogs.createIndex({ "method": 1 });

// Face Embeddings
db.faceEmbeddings.createIndex({ "traineeId": 1 });

// Employers
db.employers.createIndex({ "verified": 1 });
db.employers.createIndex({ "name": "text" });

// Job Postings
db.jobPostings.createIndex({ "employerId": 1, "deadline": 1 });
db.jobPostings.createIndex({ "location": 1 });
db.jobPostings.createIndex({ "requiredSkills": 1 });
db.jobPostings.createIndex({ "title": "text", "description": "text" });

// Job Applications
db.jobApplications.createIndex({ "traineeId": 1, "jobId": 1 }, { unique: true });
db.jobApplications.createIndex({ "jobId": 1, "matchScore": -1 });
db.jobApplications.createIndex({ "status": 1 });

// Skill Profiles
db.skillProfiles.createIndex({ "traineeId": 1 }, { unique: true });
db.skillProfiles.createIndex({ "skills": 1 });
db.skillProfiles.createIndex({ "updatedAt": -1 });

// Chat Sessions
db.chatSessions.createIndex({ "traineeId": 1, "createdAt": -1 });

// Embeddings (for RAG)
db.embeddings.createIndex({ "contentType": 1, "contentId": 1 });
// Vector index created separately via MongoDB Atlas Vector Search or Pinecone

// Analytics Events
db.analyticsEvents.createIndex({ "eventType": 1, "timestamp": -1 });
db.analyticsEvents.createIndex({ "entityType": 1, "entityId": 1 });
db.analyticsEvents.createIndex({ "timestamp": -1 });

print('MongoDB initialization complete - collections and indexes created');