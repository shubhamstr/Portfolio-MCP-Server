#!/usr/bin/env node
import { PORT } from './config/index.js';
import { startHttp } from './server/httpServer.js';
import { startStdio } from './server/stdioServer.js';

// Re-exports for backward compatibility and consumers
export * from './types/index.js';
export * from './config/index.js';
export { getPortfolioData } from './services/portfolioService.js';
export { createServer } from './server/mcpServer.js';
export { registerTools } from './tools/index.js';

// ─── Entry Point Execution ───────────────────────────────────────────────────
if (PORT) {
  startHttp(PORT).catch((err) => {
    console.error('Failed to start HTTP server:', err);
    process.exit(1);
  });
} else {
  startStdio().catch((err) => {
    console.error('Failed to start stdio server:', err);
    process.exit(1);
  });
}
