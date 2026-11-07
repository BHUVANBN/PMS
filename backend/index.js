import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/connectDB.js';
import meetingRoutes from './routes/meeting.routes.js';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import managerRoutes from './routes/manager.route.js';
import developerRoutes from './routes/developer.route.js';
import testerRoutes from './routes/tester.route.js';
import employeeRoutes from './routes/employee.route.js';
import hrRoutes from './routes/hr.route.js';
import ticketRoutes from './routes/ticket.route.js';
import kanbanRoutes from './routes/kanban.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import userRoutes from './routes/user.route.js';
import internRoutes from './routes/intern.route.js';
import salesRoutes from './routes/sales.route.js';
import marketingRoutes from './routes/marketing.route.js';
import projectRoutes from './routes/project.route.js';
import sprintRoutes from './routes/sprint.route.js';
import bugRoutes from './routes/bugTracker.route.js';
import standupRoutes from './routes/standup.route.js';
import calendarRoutes from './routes/calendar.routes.js';
import publicRoutes from './routes/public.route.js';
import leaveRoutes from './routes/leave.route.js';
import { initRealtime } from './utils/realtime.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ─── Security: Helmet ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/events', // SSE endpoint exempt from rate limiting
});

app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── NoSQL Injection Prevention ───────────────────────────────────────────────
app.use(mongoSanitize());

// ─── HTTPS Redirect (production only) ────────────────────────────────────────
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// ─── Request Logging (development only) ──────────────────────────────────────
if (!isProduction) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Initialize Real-time SSE (authenticated) ─────────────────────────────────
initRealtime(app);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/tester', testerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/kanbanboard', kanbanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/intern', internRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/standup', standupRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/leave', leaveRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'PMS API is running' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log full error server-side only
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'CORS: Not allowed' });
  }

  // Never expose internal error messages in production
  const statusCode = err.statusCode || err.status || 500;
  const message = isProduction ? 'Internal Server Error' : err.message || 'Internal Server Error';

  res.status(statusCode).json({ success: false, message });
});

// ─── Start Server (DB first, then listen) ─────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[SERVER] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((err) => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});
