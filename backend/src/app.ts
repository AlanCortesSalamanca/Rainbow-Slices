import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { env } from './config/env';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'rainbow-slices-admin-api' });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
