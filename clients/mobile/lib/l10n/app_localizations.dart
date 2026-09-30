// Generated file - do not edit manually
// This is a simplified version for demo purposes

import 'package:flutter/material.dart';

class AppLocalizations {
  AppLocalizations(this.locale);

  final Locale locale;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('en', ''),
    Locale('hi', ''),
    Locale('ta', ''),
    Locale('te', ''),
  ];

  // Common
  String get appName => 'Sahakar Setu';
  String get welcomeBack => 'Welcome back';
  String get continueLearning => 'Continue Learning';
  String get quickActions => 'Quick Actions';
  String get login => 'Login';
  String get logout => 'Logout';
  String get save => 'Save';
  String get cancel => 'Cancel';
  String get submit => 'Submit';
  String get retry => 'Retry';
  String get loading => 'Loading...';
  String get error => 'Error';
  String get success => 'Success';
  String get username => 'Username';
  String get password => 'Password';
  String get rememberMe => 'Remember me';
  String get forgotPassword => 'Forgot password?';
  String get enterUsername => 'Enter your username';
  String get enterPassword => 'Enter your password';
  String get usernameRequired => 'Username is required';
  String get passwordRequired => 'Password is required';
  String get loginFailed => 'Login failed. Please check your credentials.';
  String get demoCredentials => 'Demo Credentials';

  // Splash
  String get splashSubtitle => 'NCCT Training & Employment Platform';

  // Navigation
  String get home => 'Home';
  String get courses => 'Courses';
  String get assessments => 'Assessments';
  String get certificates => 'Certificates';
  String get attendance => 'Attendance';
  String get jobs => 'Jobs';
  String get applications => 'Applications';
  String get employers => 'Employers';
  String get chatbot => 'Career Guide';
  String get analytics => 'Analytics';
  String get settings => 'Settings';
  String get profile => 'Profile';

  // Home
  String get myCourses => 'My Courses';
  String get pendingAssessments => 'Pending Assessments';
  String get certificatesEarned => 'Certificates Earned';
  String get jobApplications => 'Job Applications';
  String get browseCourses => 'Browse Courses';
  String get takeAssessment => 'Take Assessment';
  String get markAttendance => 'Mark Attendance';
  String get findJobs => 'Find Jobs';
  String get myCertificates => 'My Certificates';
  String get careerGuidance => 'Career Guidance';

  // Courses
  String get courseList => 'Courses';
  String get createCourse => 'Create Course';
  String get courseTitle => 'Course Title';
  String get courseDescription => 'Description';
  String get language => 'Language';
  String get modules => 'Modules';
  String get addModule => 'Add Module';
  String get moduleTitle => 'Module Title';
  String get videoUrl => 'Video URL';
  String get documentUrl => 'Document URL';
  String get duration => 'Duration (minutes)';

  // Assessments
  String get assessmentsList => 'Assessments';
  String get createAssessment => 'Create Assessment';
  String get assessmentTitle => 'Assessment Title';
  String get assessmentType => 'Type';
  String get passingScore => 'Passing Score (%)';
  String get timeLimit => 'Time Limit (minutes)';
  String get questions => 'Questions';
  String get addQuestion => 'Add Question';
  String get questionText => 'Question';
  String get options => 'Options';
  String get correctAnswer => 'Correct Answer';
  String get explanation => 'Explanation';
  String get generateQuiz => 'Generate Quiz (AI)';
  String get takeAssessmentBtn => 'Take Assessment';
  String get submitAssessment => 'Submit';
  String get mcq => 'MCQ';
  String get subjective => 'Subjective';
  String get published => 'Published';
  String get draft => 'Draft';
  String get viewModules => 'View Modules';
  String get manageQuestions => 'Manage Questions';

  // Certificates
  String get certificatesList => 'Certificates';
  String get issueCertificate => 'Issue Certificate';
  String get certificateNumber => 'Certificate Number';
  String get issueDate => 'Issue Date';
  String get verifyCertificate => 'Verify Certificate';
  String get downloadPdf => 'Download PDF';
  String get issued => 'Issued';
  String get verified => 'Verified';
  String get pending => 'Pending';

  // Attendance
  String get attendanceHistory => 'Attendance History';
  String get markAttendanceBtn => 'Mark Attendance';
  String get faceRecognition => 'Face Recognition';
  String get qrCode => 'QR Code';
  String get scanQr => 'Scan QR Code';
  String get generateQr => 'Generate QR';
  String get attendanceMarked => 'Attendance marked successfully';
  String get attendanceFailed => 'Attendance marking failed';
  String get alreadyMarked => 'Attendance already marked for this session';
  String get faceNotRecognized => 'Face not recognized. Please try again or use QR code.';
  String get qrInvalid => 'Invalid or expired QR code';
  String get geofenceFailed => 'You are outside the allowed location';
  String get present => 'Present';
  String get absent => 'Absent';
  String get completed => 'Completed';
  String get inProgress => 'In Progress';
  String get scheduled => 'Scheduled';
  String get date => 'Date';
  String get session => 'Session';
  String get method => 'Method';
  String get total => 'Total';
  String get rate => 'Rate';

  // Jobs
  String get jobList => 'Jobs';
  String get createJob => 'Post Job';
  String get jobTitle => 'Job Title';
  String get jobDescription => 'Description';
  String get requiredSkills => 'Required Skills';
  String get preferredSkills => 'Preferred Skills';
  String get location => 'Location';
  String get stipend => 'Stipend';
  String get deadline => 'Application Deadline';
  String get apply => 'Apply';
  String get myApplications => 'My Applications';
  String get candidateRanking => 'Candidate Ranking';
  String get matchScore => 'Match Score';
  String get shortlist => 'Shortlist';
  String get scheduleInterview => 'Schedule Interview';
  String get makeOffer => 'Make Offer';
  String get active => 'Active';
  String get closed => 'Closed';
  String get expired => 'Expired';
  String get fullTime => 'Full-time';
  String get partTime => 'Part-time';
  String get contract => 'Contract';
  String get internship => 'Internship';
  String get cooperative => 'Cooperative';
  String get corporate => 'Corporate';
  String get government => 'Government';
  String get ngo => 'NGO';
  String get verified => 'Verified';
  String get unverified => 'Unverified';
  String get jobsPosted => 'Jobs Posted';
  String get addEmployer => 'Add Employer';
  String get viewApplications => 'View Applications';

  // Applications
  String get applicant => 'Applicant';
  String get appliedDate => 'Applied Date';
  String get resume => 'Resume';
  String get applied => 'Applied';
  String get shortlisted => 'Shortlisted';
  String get interview => 'Interview';
  String get offered => 'Offered';
  String get rejected => 'Rejected';
  String get accepted => 'Accepted';

  // Chatbot
  String get chatbotWelcome => 'Hello! I\'m your career guide. Ask me about jobs, skills, or training programmes.';
  String get askQuestion => 'Ask a question...';
  String get send => 'Send';
  String get quickQuestions => 'Quick Questions';

  // Analytics
  String get enrollmentTrends => 'Enrollment Trends';
  String get dropoutRate => 'Dropout Rate';
  String get placementRate => 'Placement Rate';
  String get regionHeatmap => 'Region Heatmap';
  String get completionRate => 'Completion Rate';
  String get totalTrainees => 'Total Trainees';
  String get activeProgrammes => 'Active Programmes';
  String get totalCertificates => 'Certificates Issued';
  String get totalPlacements => 'Total Placements';
  String get byDistrict => 'By District';
  String get byInstitution => 'By Institution';
  String get byProgramme => 'By Programme';
  String get monthly => 'Monthly';
  String get quarterly => 'Quarterly';
  String get yearly => 'Yearly';
  String get dashboardSubtitle => 'Overview of training programmes and outcomes';

  // Settings
  String get preferences => 'Preferences';
  String get security => 'Security';
  String get notifications => 'Notifications';
  String get firstName => 'First Name';
  String get lastName => 'Last Name';
  String get email => 'Email';
  String get phone => 'Phone';
  String get address => 'Address';
  String get changePassword => 'Change Password';
  String get currentPassword => 'Current Password';
  String get newPassword => 'New Password';
  String get confirmPassword => 'Confirm Password';
  String get updatePassword => 'Update Password';
  String get twoFactor => 'Two-Factor Authentication';
  String get twoFactorDesc => 'Add an extra layer of security to your account.';
  String get enable2fa => 'Enable Two-Factor Authentication';
  String get timezone => 'Timezone';
  String get dateFormat => 'Date Format';
  String get compactMode => 'Compact Mode';
  String get subtitle => 'Manage your account settings and preferences';
  String get emailJobAlerts => 'Job Alerts via Email';
  String get emailCourseUpdates => 'Course Updates via Email';
  String get emailCertificateReady => 'Certificate Ready Notifications';
  String get pushAttendanceReminder => 'Attendance Reminders';
  String get pushAssessmentDue => 'Assessment Due Reminders';
  String get smsImportant => 'Important Updates via SMS';

  // ERP
  String get programmeList => 'Programmes';
  String get createProgramme => 'Create Programme';
  String get editProgramme => 'Edit Programme';
  String get programmeTitle => 'Programme Title';
  String get programmeDescription => 'Description';
  String get institution => 'Institution';
  String get startDate => 'Start Date';
  String get endDate => 'End Date';
  String get capacity => 'Capacity';
  String get status => 'Status';
  String get nominateTrainee => 'Nominate Trainee';
  String get nominationList => 'Nominations';
  String get approveNomination => 'Approve';
  String get rejectNomination => 'Reject';
  String get nominationStatus => 'Status';
  String get nomineeName => 'Nominee Name';
  String get nomineePhone => 'Phone';
  String get nomineeEmail => 'Email';
  String get nomineeDistrict => 'District';
  String get nomineePacs => 'PACS ID';
  String get traineeProfile => 'Trainee Profile';
  String get traineeList => 'Trainees';
  String get trainerList => 'Trainers';
  String get active => 'Active';
  String get inactive => 'Inactive';
  String get allStatus => 'All Status';
  String get allTypes => 'All Types';
  String get allLanguages => 'All Languages';
  String get statusDraft => 'Draft';
  String get statusPublished => 'Published';
  String get statusOngoing => 'Ongoing';
  String get statusCompleted => 'Completed';
  String get statusCancelled => 'Cancelled';
  String get statusPending => 'Pending';
  String get statusApproved => 'Approved';
  String get statusRejected => 'Rejected';
  String get name => 'Name';
  String get district => 'District';
  String get pacsId => 'PACS ID';
  String get skills => 'Skills';
  String get allMethods => 'All Methods';
  String get statusCompleted => 'Completed';
  String get statusInProgress => 'In Progress';
  String get statusScheduled => 'Scheduled';

  // LMS
  String get courseListLms => 'Courses';
  String get createCourseLms => 'Create Course';
  String get courseTitleLms => 'Course Title';
  String get courseDescriptionLms => 'Description';
  String get modulesLms => 'Modules';
  String get addModuleLms => 'Add Module';
  String get moduleTitleLms => 'Module Title';
  String get videoUrlLms => 'Video URL';
  String get documentUrlLms => 'Document URL';
  String get durationLms => 'Duration (minutes)';
  String get assessmentsLms => 'Assessments';
  String get createAssessmentLms => 'Create Assessment';
  String get assessmentTitleLms => 'Assessment Title';
  String get assessmentTypeLms => 'Type';
  String get passingScoreLms => 'Passing Score (%)';
  String get timeLimitLms => 'Time Limit (minutes)';
  String get questionsLms => 'Questions';
  String get addQuestionLms => 'Add Question';
  String get questionTextLms => 'Question';
  String get optionsLms => 'Options';
  String get correctAnswerLms => 'Correct Answer';
  String get explanationLms => 'Explanation';
  String get generateQuizLms => 'Generate Quiz (AI)';
  String get takeAssessmentLms => 'Take Assessment';
  String get submitAssessmentLms => 'Submit';
  String get certificateLms => 'Certificate';
  String get verifyCertificateLms => 'Verify Certificate';
  String get certificateNumberLms => 'Certificate Number';
  String get issueDateLms => 'Issue Date';
  String get enroll => 'Enroll';
  String get myCoursesLms => 'My Courses';
  String get progress => 'Progress';
  String get completedLms => 'Completed';
  String get publishedLms => 'Published';
  String get draftLms => 'Draft';

  // Employment
  String get jobListEmp => 'Jobs';
  String get createJobEmp => 'Post Job';
  String get jobTitleEmp => 'Job Title';
  String get jobDescriptionEmp => 'Description';
  String get requiredSkillsEmp => 'Required Skills';
  String get preferredSkillsEmp => 'Preferred Skills';
  String get locationEmp => 'Location';
  String get stipendEmp => 'Stipend';
  String get deadlineEmp => 'Application Deadline';
  String get applicationsEmp => 'Applications';
  String get applyEmp => 'Apply';
  String get myApplicationsEmp => 'My Applications';
  String get candidateRankingEmp => 'Candidate Ranking';
  String get matchScoreEmp => 'Match Score';
  String get shortlistEmp => 'Shortlist';
  String get scheduleInterviewEmp => 'Schedule Interview';
  String get makeOfferEmp => 'Make Offer';
  String get careerChatbotEmp => 'Career Guidance';
  String get askQuestionEmp => 'Ask a question...';
  String get chatbotWelcomeEmp => 'Hello! I\'m your career guide. Ask me about jobs, skills, or training programmes.';

  // Analytics
  String get enrollmentTrendsEmp => 'Enrollment Trends';
  String get dropoutRateEmp => 'Dropout Rate';
  String get placementRateEmp => 'Placement Rate';
  String get regionHeatmapEmp => 'Region Heatmap';
  String get completionRateEmp => 'Completion Rate';
  String get totalTraineesEmp => 'Total Trainees';
  String get activeProgrammesEmp => 'Active Programmes';
  String get totalCertificatesEmp => 'Certificates Issued';
  String get totalPlacementsEmp => 'Total Placements';
  String get byDistrictEmp => 'By District';
  String get byInstitutionEmp => 'By Institution';
  String get byProgrammeEmp => 'By Programme';
  String get monthlyEmp => 'Monthly';
  String get quarterlyEmp => 'Quarterly';
  String get yearlyEmp => 'Yearly';

  // Mobile
  String get offlineMode => 'Offline Mode';
  String get onlineMode => 'Online Mode';
  String get syncNow => 'Sync Now';
  String get syncing => 'Syncing...';
  String get lastSync => 'Last synced';
  String get pendingSync => 'Pending sync';
  String get downloadContent => 'Download for Offline';
  String get contentDownloaded => 'Content downloaded';
  String get noInternet => 'No internet connection';
  String get cameraPermission => 'Camera permission required';
  String get locationPermission => 'Location permission required';

  // Errors
  String get networkError => 'Network error. Please check your connection.';
  String get serverError => 'Server error. Please try again later.';
  String get notFound => 'Resource not found';
  String get validationError => 'Please check your input';
  String get permissionDenied => 'Permission denied';
  String get timeout => 'Request timed out';
  String get unknownError => 'An unknown error occurred';
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'hi', 'ta', 'te'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(AppLocalizations(locale));
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}