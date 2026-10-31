import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

// ─── Data Source & Types ───────────────────────────────────────────────────────

export const PORTFOLIO_DATA_URL =
  process.env.PORTFOLIO_DATA_URL ||
  'https://raw.githubusercontent.com/shubhamstr/New-Portfolio/refs/heads/main/web/src/data/db.json';

export interface SkillItem {
  name: string;
  level: number;
  visible: boolean;
}

export interface ProjectItem {
  title: string;
  description: string;
  image?: string;
  techStacks: string[];
  demoLink?: string;
  githubLink?: string;
  type: string;
}

export interface PortfolioUrls {
  resumeURL?: string;
  githubURL?: string;
  linkedInURL?: string;
  twitterURL?: string;
  codepenURL?: string;
  stackOverFlowURL?: string;
  mediumURL?: string;
  freeCodeCampURL?: string;
  soloLearnURL?: string;
  devToURL?: string;
  leetcodeURL?: string;
  dockerURL?: string;
  hackerEarthURL?: string;
  hackerRankURL?: string;
  bitbucketURL?: string;
  gitlabURL?: string;
  streamlitURL?: string;
  [key: string]: string | undefined;
}

export interface DbData {
  skills: {
    frontend?: SkillItem[];
    backend?: SkillItem[];
    database?: SkillItem[];
    tools?: SkillItem[];
    concepts?: SkillItem[];
    cloud?: SkillItem[];
    [key: string]: SkillItem[] | undefined;
  };
  URLs: PortfolioUrls;
  projects: ProjectItem[];
}

// ─── Data Fetcher & Cache ─────────────────────────────────────────────────────

let cachedData: DbData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function getPortfolioData(forceRefresh = false): Promise<DbData> {
  const now = Date.now();
  if (!forceRefresh && cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const res = await fetch(PORTFOLIO_DATA_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'portfolio-mcp-server/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch portfolio data: HTTP ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as DbData;
    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (err) {
    if (cachedData) {
      console.warn('Network error while refreshing portfolio data, using cached copy:', err);
      return cachedData;
    }
    throw err;
  }
}

// ─── Formatters ────────────────────────────────────────────────────────────────

function formatProfile(data: DbData): string {
  const urls = data.URLs;
  return [
    '# Shubham Sutar - Full Stack Developer',
    '> A Full Stack Developer with 5+ years of experience specializing in React.js, Node.js, Express.js, and MongoDB.',
    '',
    '## Summary',
    "I build fast, scalable, and user-centric web applications using modern technologies like JavaScript, TypeScript, Next.js, Python, Docker, and CI/CD pipelines. Passionate about clean code, performance optimization, and turning ideas into impactful digital products, AI-powered tools, and open-source packages.",
    '',
    '## Quick Links',
    urls.resumeURL ? `- **Resume:** [View Resume](${urls.resumeURL})` : '',
    urls.githubURL ? `- **GitHub:** ${urls.githubURL}` : '',
    urls.linkedInURL ? `- **LinkedIn:** ${urls.linkedInURL}` : '',
    urls.twitterURL ? `- **Twitter / X:** ${urls.twitterURL}` : '',
    urls.dockerURL ? `- **Docker Hub:** ${urls.dockerURL}` : '',
    urls.leetcodeURL ? `- **LeetCode:** ${urls.leetcodeURL}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function formatSkills(data: DbData, category?: string): string {
  const skillsObj = data.skills;
  const cat = category?.toLowerCase();

  const renderCategory = (title: string, list?: SkillItem[]) => {
    if (!list || list.length === 0) return '';
    const visibleSkills = list.filter((s) => s.visible !== false);
    return [
      `### ${title}`,
      ...visibleSkills.map((s) => `- **${s.name}** (Proficiency: ${s.level}%)`),
    ].join('\n');
  };

  if (cat && cat !== 'all') {
    switch (cat) {
      case 'frontend':
        return renderCategory('Frontend Skills', skillsObj.frontend) || 'No frontend skills found.';
      case 'backend':
        return renderCategory('Backend Skills', skillsObj.backend) || 'No backend skills found.';
      case 'database':
      case 'databases':
        return renderCategory('Database Skills', skillsObj.database) || 'No database skills found.';
      case 'tools':
        return renderCategory('Developer Tools & Environments', skillsObj.tools) || 'No tools found.';
      case 'concepts':
        return renderCategory('Architecture & Core Concepts', skillsObj.concepts) || 'No concepts found.';
      case 'cloud':
        return renderCategory('Cloud Platforms & DevOps', skillsObj.cloud) || 'No cloud skills found.';
      default:
        break;
    }
  }

  const sections = [
    '# Technical Skills',
    renderCategory('Frontend', skillsObj.frontend),
    renderCategory('Backend', skillsObj.backend),
    renderCategory('Databases', skillsObj.database),
    renderCategory('Cloud & Infrastructure', skillsObj.cloud),
    renderCategory('Developer Tools', skillsObj.tools),
    renderCategory('Architectural Concepts & Methodologies', skillsObj.concepts),
  ].filter(Boolean);

  return sections.join('\n\n');
}

function formatProjects(data: DbData, typeFilter?: string, techFilter?: string): string {
  let list = data.projects || [];

  if (typeFilter && typeFilter.toLowerCase() !== 'all') {
    const t = typeFilter.toLowerCase();
    list = list.filter((p) => p.type.toLowerCase().includes(t));
  }

  if (techFilter) {
    const q = techFilter.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStacks.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (list.length === 0) {
    return 'No projects found matching the specified criteria.';
  }

  return [
    `# Projects (${list.length} displayed)`,
    '',
    ...list.map((project) =>
      [
        `### ${project.title} [Type: ${project.type.toUpperCase()}]`,
        `**Description:** ${project.description}`,
        `**Tech Stack:** ${project.techStacks.join(', ')}`,
        project.demoLink ? `**Live Demo / Package:** [${project.demoLink}](${project.demoLink})` : '',
        project.githubLink ? `**Repository / Source:** [${project.githubLink}](${project.githubLink})` : '',
        project.image ? `**Cover Image:** ${project.image}` : '',
        '---',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n');
}

function formatContact(data: DbData): string {
  const u = data.URLs;
  return [
    '# Contact & Profiles — Shubham Sutar',
    '',
    u.resumeURL ? `- **Resume:** [View Resume Google Doc](${u.resumeURL})` : '',
    u.githubURL ? `- **GitHub:** ${u.githubURL}` : '',
    u.linkedInURL ? `- **LinkedIn:** ${u.linkedInURL}` : '',
    u.twitterURL ? `- **Twitter / X:** ${u.twitterURL}` : '',
    u.dockerURL ? `- **Docker Hub:** ${u.dockerURL}` : '',
    u.leetcodeURL ? `- **LeetCode:** ${u.leetcodeURL}` : '',
    u.stackOverFlowURL ? `- **Stack Overflow:** ${u.stackOverFlowURL}` : '',
    u.devToURL ? `- **Dev.to:** ${u.devToURL}` : '',
    u.mediumURL ? `- **Medium:** ${u.mediumURL}` : '',
    u.freeCodeCampURL ? `- **freeCodeCamp:** ${u.freeCodeCampURL}` : '',
    u.codepenURL ? `- **CodePen:** ${u.codepenURL}` : '',
    u.bitbucketURL ? `- **Bitbucket:** ${u.bitbucketURL}` : '',
    u.gitlabURL ? `- **GitLab:** ${u.gitlabURL}` : '',
    u.streamlitURL ? `- **Streamlit:** ${u.streamlitURL}` : '',
    u.soloLearnURL ? `- **SoloLearn:** ${u.soloLearnURL}` : '',
    u.hackerRankURL ? `- **HackerRank:** ${u.hackerRankURL}` : '',
    u.hackerEarthURL ? `- **HackerEarth:** ${u.hackerEarthURL}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function formatExperience(data: DbData): string {
  const urls = data.URLs;
  return [
    '# Professional Experience & Career Overview',
    '',
    '### Senior Full Stack Developer (5+ Years Experience)',
    '- **Core Stack:** React.js, Next.js, Node.js, Express.js, TypeScript, Python, MongoDB, MySQL, Docker, AWS, GCP.',
    '- **Key Focus:** Fast, responsive, accessible frontends, high-throughput microservices, robust REST/WebSocket APIs, AI-powered developer utilities, and CI/CD pipelines.',
    '',
    '### Key Milestones & Engineered Solutions',
    '- **Real-Time Distributed Systems:** Built Realtime Chat App utilizing WebSockets, React.js, and Node.js for low-latency messaging.',
    '- **AI & Agentic Developer Tools:** Created Bitbucket PR Review Tool powered by Google Gemini AI and Docker for automated code reviews; developed ChatGPT Vault extension.',
    '- **Open Source & Developer Tooling:** Published npm packages (@shubhamstr/boilerplate-generator, @shubhamstr/form-builder) and VS Code Extensions (Project Rules Checker, Project Companion).',
    '- **Cloud & Infrastructure:** Hands-on deployments across AWS EC2, S3, RDS, ECR, GCP Cloud Run, and Azure Virtual Machines.',
    '',
    urls.resumeURL ? `For complete chronological company details, refer to: [Full Resume](${urls.resumeURL})` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

// ─── Server Factory ──────────────────────────────────────────────────────────

function createServer(): McpServer {
  const srv = new McpServer({
    name: 'portfolio-mcp',
    version: '1.0.0',
  });

  registerTools(srv);
  return srv;
}

const server = createServer();

// ─── Tool Registration ───────────────────────────────────────────────────────

function registerTools(server: McpServer) {
  // 1. Profile / Bio
  server.tool(
    'get-profile',
    'Get Shubham Sutar profile, title, bio, core tech stack summary, and resume link.',
    {},
    async () => {
      const data = await getPortfolioData();
      return {
        content: [
          {
            type: 'text',
            text: formatProfile(data),
          },
        ],
      };
    },
  );

  // 2. Skills
  server.tool(
    'get-skills',
    'Get technical skills from portfolio database with proficiency levels. Optional category filter.',
    {
      category: z
        .enum(['all', 'frontend', 'backend', 'database', 'tools', 'concepts', 'cloud'])
        .optional()
        .describe('Filter skills by category: frontend, backend, database, tools, concepts, cloud, or all (default: all)'),
    },
    async ({ category }) => {
      const data = await getPortfolioData();
      return {
        content: [
          {
            type: 'text',
            text: formatSkills(data, category),
          },
        ],
      };
    },
  );

  // 3. Projects
  server.tool(
    'get-projects',
    'Get portfolio projects, descriptions, tech stacks, live demos, and GitHub links. Optional type and technology filters.',
    {
      type: z
        .string()
        .optional()
        .describe('Filter by project type: featured, tools, others, or all'),
      technology: z
        .string()
        .optional()
        .describe('Filter by technology keyword (e.g. React.js, Node.js, Gemini, Docker, PHP)'),
    },
    async ({ type, technology }) => {
      const data = await getPortfolioData();
      return {
        content: [
          {
            type: 'text',
            text: formatProjects(data, type, technology),
          },
        ],
      };
    },
  );

  // 4. Experience
  server.tool(
    'get-experience',
    'Get professional career experience summary, years of experience, core stacks, and key milestones.',
    {},
    async () => {
      const data = await getPortfolioData();
      return {
        content: [
          {
            type: 'text',
            text: formatExperience(data),
          },
        ],
      };
    },
  );

  // 5. Contact & Socials
  server.tool(
    'get-contact',
    'Get all contact details, profiles, social links (GitHub, LinkedIn, Resume, Twitter, LeetCode, Docker Hub, etc.).',
    {},
    async () => {
      const data = await getPortfolioData();
      return {
        content: [
          {
            type: 'text',
            text: formatContact(data),
          },
        ],
      };
    },
  );

  // 6. Full Portfolio
  server.tool(
    'get-full-portfolio',
    'Get complete portfolio summary including profile, skills, projects, experience, and contact details.',
    {},
    async () => {
      const data = await getPortfolioData();
      const full = [
        formatProfile(data),
        '\n---\n',
        formatExperience(data),
        '\n---\n',
        formatSkills(data),
        '\n---\n',
        formatProjects(data),
        '\n---\n',
        formatContact(data),
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: full,
          },
        ],
      };
    },
  );

  // 7. Raw JSON Data
  server.tool(
    'get-raw-data',
    'Get the raw JSON data object directly fetched from the portfolio db.json source.',
    {},
    async () => {
      const data = await getPortfolioData();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );
}

// ─── Transport Selection ─────────────────────────────────────────────────────

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

async function startHttp(port: number) {
  const app = express();
  app.use(express.json());

  // Pre-fetch portfolio data on server boot
  try {
    await getPortfolioData();
    console.log(`Loaded portfolio data from ${PORTFOLIO_DATA_URL}`);
  } catch (err) {
    console.warn(`Could not pre-fetch portfolio data on startup:`, err);
  }

  // Map of sessionId → transport (for stateful resumability)
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  // Single MCP endpoint — handles initialize, POST requests, and GET SSE stream
  app.all('/mcp', async (req: Request, res: Response) => {
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
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health-check endpoint
  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', server: 'portfolio-mcp', source: PORTFOLIO_DATA_URL }),
  );

  app.listen(port, '0.0.0.0', () => {
    console.log(`Portfolio MCP Server listening on http://0.0.0.0:${port}/mcp`);
  });
}

async function startStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Portfolio MCP Server running on stdio');
}

// ─── Entry Point ────────────────────────────────────────────────────────────
if (PORT) {
  startHttp(PORT).catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  startStdio().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
