import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './db/connectDB.js';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow frontend to make requests
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
// Attach cookie parser early so auth can read cookies
app.use(cookieParser());


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

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
