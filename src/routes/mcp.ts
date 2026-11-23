import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from '../server/mcpServer.js';
import { requireApiKey } from '../middleware/auth.js';

export function createMcpRouter(): Router {
  const router = Router();

  // Map of sessionId → transport (for stateful resumability)
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  // Single MCP endpoint — handles initialize, POST requests, and GET SSE stream
  router.all('/mcp', requireApiKey, async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;

      // Re-use existing session transport if we have one
      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId)!;
        await transport.handleRequest(req, res, req.body);
        return;
      }

      // New session: only POST with initialize is allowed to start one
      if (req.method !== 'POST') {
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'New session must start with POST initialize' },
          id: null,
        });
        return;
      }

      const newSessionId = randomUUID();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (id) => {
          sessions.set(id, transport);
        },
      });

      transport.onclose = () => sessions.delete(newSessionId);

      // Bind a fresh server instance to this session
      const sessionServer = createServer();
      await sessionServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('MCP request error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}
