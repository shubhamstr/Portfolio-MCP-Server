import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { MCP_API_KEY } from '../config/index.js';

/**
 * Validates requests using timing-safe API key comparison.
 * Supports:
 * - Header: 'x-api-key'
 * - Header: 'authorization: Bearer <key>'
 * - Query param: ?apiKey=... or ?api_key=... or ?key=...
 */
export function validateApiKey(req: Request): boolean {
  if (!MCP_API_KEY) {
    // When no API key is configured, allow requests (open access mode)
    return true;
  }

  const authHeader = req.headers['authorization'];
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const headerKey = req.headers['x-api-key'] as string | undefined;
  const queryKey = (req.query.apiKey || req.query.api_key || req.query.key) as string | undefined;

  const candidate = headerKey || bearerKey || queryKey;
  if (!candidate) {
    return false;
  }

  const bufProvided = Buffer.from(candidate);
  const bufExpected = Buffer.from(MCP_API_KEY);

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  return timingSafeEqual(bufProvided, bufExpected);
}

/**
 * Express middleware to enforce API key authorization for endpoints.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!validateApiKey(req)) {
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message:
          'Unauthorized: Missing or invalid API key. Provide via x-api-key header, Authorization: Bearer, or ?apiKey= query param.',
      },
      id: null,
    });
    return;
  }
  next();
}
