import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import settingsRoutes from './routes/settings.routes.js';
import historyRoutes from './routes/history.routes.js';
import llmRoutes from './routes/llm.routes.js';
import exportRoutes from './routes/export.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import contextRoutes from './routes/context.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());

app.use('/api/settings', settingsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/context', contextRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
