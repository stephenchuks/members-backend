// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
const app = express();
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));
// Routes
app.use('/api/auth', authRoutes);
// Health-check
app.get('/health', (_req, res) => {
    res.sendStatus(200);
});
export default app;
