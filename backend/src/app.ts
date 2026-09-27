import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import auditRouter from './routes/audit.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import eventsRouter from './routes/events.js';
import familyMembersRouter from './routes/familyMembers.js';
import familyTreeRouter from './routes/familyTree.js';
import importantDatesRouter from './routes/importantDates.js';
import mediaRouter from './routes/media.js';
import relationshipsRouter from './routes/relationships.js';
import reportsRouter from './routes/reports.js';
import searchRouter from './routes/search.js';

dotenv.config();

const app = express();
const allowedOrigin = process.env.FRONTEND_URL;

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin ? allowedOrigin : true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Family Hierarchy API is running',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/family-members', familyMembersRouter);
app.use('/api/relationships', relationshipsRouter);
app.use('/api/family-tree', familyTreeRouter);
app.use('/api/media', mediaRouter);
app.use('/api/important-dates', importantDatesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/search', searchRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/audit', auditRouter);

export default app;
