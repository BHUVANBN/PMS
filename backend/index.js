import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './db/connectDB.js';
import meetingRoutes from "./routes/meeting.routes.js"
import cookieParser from 'cookie-parser';
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
import calendarRoutes from "./routes/calendar.routes.js";
import publicRoutes from './routes/public.route.js';
import { initRealtime } from './utils/realtime.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow frontend to make requests
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL // Allow environment-specific frontend URL
        ].filter(Boolean); // Remove any undefined values
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Enable credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Set-Cookie'], // Allow frontend to read Set-Cookie headers
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Add size limit for security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Attach cookie parser early so auth can read cookies
app.use(cookieParser());

// Initialize realtime SSE endpoint
initRealtime(app);

// Request logging middleware (for development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

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
// Singular alias for project routes
app.use('/api/project', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/standup', standupRoutes);

app.use('/api/calendar', calendarRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/meetings',meetingRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server test route working 🚀' });
});


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle different types of errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }
    
    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
