// API Gateway - Express Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const axios = require('axios');
const Redis = require('ioredis');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'sahakar';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Service URLs
const SERVICES = {
  erp: process.env.ERP_SERVICE_URL || 'http://localhost:8001',
  lms: process.env.LMS_SERVICE_URL || 'http://localhost:8002',
  attendance: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:8003',
  employment: process.env.EMPLOYMENT_SERVICE_URL || 'http://localhost:8004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8005',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:8006'
};

// Redis client (optional)
let redis = null;
if (process.env.ENABLE_REDIS === 'true') {
  try {
    redis = new Redis(REDIS_URL, { lazyConnect: true, retryStrategy: () => null });
    redis.connect().catch(() => {});
    redis.on('error', () => {});
  } catch (err) {
    console.log('Redis not available, continuing without cache');
  }
}

// JWKS client for Keycloak token validation
const jwksClient = jwksRsa({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// JWT Verification Middleware
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify with Keycloak JWKS
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    req.user = {
      id: decoded.sub,
      username: decoded.preferred_username,
      email: decoded.email,
      roles: decoded.realm_access?.roles || [],
      realm_roles: decoded.realm_access?.roles || []
    };
    next();
  } catch (err) {
    // Fallback: verify with shared secret (for service-to-service)
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      req.user = {
        id: decoded.sub,
        username: decoded.username,
        roles: decoded.roles || [],
        realm_roles: decoded.roles || []
      };
      next();
    } catch (err2) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

// Role-based access control
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.realm_roles || req.user?.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Proxy request to backend service
async function proxyRequest(req, res, serviceUrl, path) {
  try {
    const url = `${serviceUrl}${path}`;
    const config = {
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: undefined, // Remove host header
        'x-user-id': req.user?.id,
        'x-user-roles': JSON.stringify(req.user?.realm_roles || []),
        'x-forwarded-for': req.ip
      },
      data: req.body,
      params: req.query,
      timeout: 30000
    };

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else if (err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Service unavailable' });
    } else {
      console.error('Proxy error:', err.message);
      res.status(500).json({ error: 'Gateway error' });
    }
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// ==========================================
// Route Definitions
// ==========================================

// Public routes (no auth required)
app.get('/', (req, res) => {
  res.json({ name: 'Sahakar Setu API Gateway', version: '1.0.0' });
});

// Demo accounts for local auth
const DEMO_USERS = {
  admin: {
    id: 'usr_admin',
    username: 'admin',
    email: 'admin@ncct.ac.in',
    firstName: 'NCCT',
    lastName: 'Admin',
    roles: ['ncct_admin', 'institution_admin', 'trainer', 'trainee', 'employer', 'recruiter']
  },
  institution_admin: {
    id: 'usr_inst_admin',
    username: 'institution_admin',
    email: 'inst.admin@vamnicom.gov.in',
    firstName: 'Institution',
    lastName: 'Admin',
    roles: ['institution_admin', 'trainer']
  },
  trainer: {
    id: 'usr_trainer',
    username: 'trainer',
    email: 'trainer@vamnicom.gov.in',
    firstName: 'Master',
    lastName: 'Trainer',
    roles: ['trainer']
  },
  trainee: {
    id: 'usr_trainee',
    username: 'trainee',
    email: 'trainee@sahakar.coop',
    firstName: 'Priya',
    lastName: 'Patil',
    roles: ['trainee']
  },
  employer: {
    id: 'usr_employer',
    username: 'employer',
    email: 'hr@amul.coop',
    firstName: 'Amul',
    lastName: 'Recruiter',
    roles: ['employer', 'recruiter']
  }
};

// Local Auth Endpoints (works with or without Keycloak)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const key = username.toLowerCase();
  let user = DEMO_USERS[key] || Object.values(DEMO_USERS).find(u => u.username.toLowerCase() === key);

  if (!user) {
    user = {
      id: `usr_${username}`,
      username: username,
      email: `${username}@sahakar.coop`,
      firstName: username.charAt(0).toUpperCase() + username.slice(1),
      lastName: 'User',
      roles: ['ncct_admin']
    };
  }

  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    realm_access: { roles: user.roles }
  };

  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d', algorithm: 'HS256' });
  const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d', algorithm: 'HS256' });

  return res.json({
    access_token,
    refresh_token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles
    }
  });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email || `${req.user.username}@sahakar.coop`,
    firstName: req.user.firstName || req.user.username,
    lastName: req.user.lastName || '',
    roles: req.user.realm_roles || req.user.roles || []
  });
});

// Helper for proxying service endpoints
function mountService(basePath, serviceUrl) {
  const regex = new RegExp(`^${basePath}`);
  app.all([basePath, `${basePath}/*`], (req, res) => {
    const targetPath = req.originalUrl.replace(regex, '') || '/';
    proxyRequest(req, res, serviceUrl, targetPath);
  });
}

// ERP Routes
app.use('/api/erp', verifyToken);
mountService('/api/erp', SERVICES.erp);

// LMS Routes
app.use('/api/lms', verifyToken);
mountService('/api/lms', SERVICES.lms);

// Attendance Routes
app.use('/api/attendance', verifyToken);
mountService('/api/attendance', SERVICES.attendance);

// Employment Routes
app.use('/api/employment', verifyToken);
mountService('/api/employment', SERVICES.employment);

// Analytics Routes
app.use('/api/analytics', verifyToken);
mountService('/api/analytics', SERVICES.analytics);

// AI Routes
app.use('/api/ai', verifyToken);
mountService('/api/ai', SERVICES.ai);

// Admin-only routes
app.get('/api/admin/stats', verifyToken, requireRoles('ncct_admin'), async (req, res) => {
  // Aggregate stats from all services
  try {
    const [erp, lms, emp, analytics] = await Promise.allSettled([
      axios.get(`${SERVICES.erp}/institutions?limit=1`),
      axios.get(`${SERVICES.lms}/courses?limit=1`),
      axios.get(`${SERVICES.employment}/jobs?limit=1`),
      axios.get(`${SERVICES.analytics}/dashboard/summary`)
    ]);

    res.json({
      erp: erp.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      lms: lms.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      employment: emp.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      analytics: analytics.status === 'fulfilled' ? 'healthy' : 'unhealthy'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal gateway error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Keycloak: ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`);
  console.log('Services:', SERVICES);
});

module.exports = app;