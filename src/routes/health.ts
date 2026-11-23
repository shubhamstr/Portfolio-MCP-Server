import { Router } from 'express';
import { SERVER_NAME, PORTFOLIO_DATA_URL } from '../config/index.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    server: SERVER_NAME,
    source: PORTFOLIO_DATA_URL,
  });
});
