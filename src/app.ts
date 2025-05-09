// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import memberRoutes from './routes/memberRoutes.js';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Public auth endpoints
app.use('/api/auth', authRoutes);

// Protected user endpoints (admin-only)
app.use('/api/users', userRoutes);

// Protected member endpoints
app.use('/api/members', memberRoutes);

// Health-check
app.get('/health', (_req, res) => {
  res.sendStatus(200);
});

export default app;
