import express from 'express';
import { PORTFOLIO_DATA_URL, MCP_API_KEY } from '../config/index.js';
import { getPortfolioData } from '../services/portfolioService.js';
import { healthRouter } from '../routes/health.js';
import { createMcpRouter } from '../routes/mcp.js';

export async function startHttp(port: number): Promise<void> {
  const app = express();
  app.use(express.json());

  // Log API key protection status
  if (MCP_API_KEY) {
    console.log('🔒 API Key authentication enabled for /mcp endpoint');
  } else {
    console.warn('⚠️  No MCP_API_KEY set. The /mcp endpoint is accessible without authentication.');
  }

  // Pre-fetch portfolio data on server boot
  try {
    await getPortfolioData();
    console.log(`Loaded portfolio data from ${PORTFOLIO_DATA_URL}`);
  } catch (err) {
    console.warn('Could not pre-fetch portfolio data on startup:', err);
  }

  // Mount routes
  app.use(healthRouter);
  app.use(createMcpRouter());

  app.listen(port, '0.0.0.0', () => {
    console.log(`Portfolio MCP Server listening on http://0.0.0.0:${port}/mcp`);
  });
}
