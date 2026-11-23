export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

export const MCP_API_KEY = process.env.MCP_API_KEY || process.env.API_KEY || '';

export const PORTFOLIO_DATA_URL =
  process.env.PORTFOLIO_DATA_URL ||
  'https://raw.githubusercontent.com/shubhamstr/New-Portfolio/refs/heads/main/web/src/data/db.json';

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const SERVER_NAME = 'portfolio-mcp';
export const SERVER_VERSION = '1.0.0';
