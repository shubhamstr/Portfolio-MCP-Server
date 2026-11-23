import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getPortfolioData } from '../services/portfolioService.js';
import {
  formatProfile,
  formatSkills,
  formatProjects,
  formatExperience,
  formatContact,
} from '../utils/formatters.js';

export function registerTools(server: McpServer): void {
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
        .describe(
          'Filter skills by category: frontend, backend, database, tools, concepts, cloud, or all (default: all)',
        ),
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
