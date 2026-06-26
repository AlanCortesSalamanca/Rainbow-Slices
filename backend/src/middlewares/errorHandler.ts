import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Validation error', issues: error.issues });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  if (error?.name === 'MulterError') {
    res.status(400).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'Unexpected server error' });
};
