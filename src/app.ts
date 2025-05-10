// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import indexRoutes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);

// 404 + global error handler
app.use(notFound);
app.use(errorHandler);

export default app;
