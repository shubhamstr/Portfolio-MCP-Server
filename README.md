# 💼 Portfolio MCP Server

A **Model Context Protocol (MCP) server** that exposes personal portfolio details, professional work experience, technical skills (Frontend, Backend, Databases, Cloud, Tools, Concepts), featured projects, and contact information as interactive tools for AI assistants like Claude, Cursor, and custom agent systems.

Fetches live portfolio data directly from [db.json](https://raw.githubusercontent.com/shubhamstr/New-Portfolio/refs/heads/main/web/src/data/db.json) with intelligent in-memory caching.

Supports both:
- **stdio** — for local AI desktop clients (Claude Desktop, Cursor, etc.)
- **Streamable HTTP** — for remote HTTP-based and cloud integrations

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Data Source](#-data-source)
- [Tools Reference](#-tools-reference)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Connect to Claude Desktop](#-connect-to-claude-desktop)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## ✨ Features

- 👤 **Profile & Bio** — Shubham Sutar's background, full-stack title (5+ years experience), core stack, and quick links
- ⚡ **Technical Skills** — live breakdown across Frontend, Backend, Databases, Cloud & DevOps, Developer Tools, and Core Concepts with proficiency ratings
- 🏢 **Work Experience** — career overview, key milestones, open-source packages, and AI developer tools
- 🚀 **Projects Showcase** — 11 featured, tools, and web projects with live demos, npm/VS Code links, GitHub repos, and tech stacks
- 📬 **Contact & Socials** — complete list of developer profile links (GitHub, LinkedIn, Docker Hub, LeetCode, Resume, Twitter, etc.)
- 🔀 **Dual Transport** — automatically runs in stdio mode or Streamable HTTP mode based on environment
- 🔁 **Stateful HTTP Sessions** — isolated session handling with `/mcp` SSE streaming support
- ❤️ **Health Endpoint** — `/health` endpoint for uptime monitoring and data source verification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio MCP Server                     │
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────────┐  │
│  │  stdio mode  │         │        HTTP mode             │  │
│  │  (local)     │         │  POST /mcp  GET /mcp         │  │
│  └──────┬───────┘         └──────────────┬───────────────┘  │
│         │                                │                  │
│         └──────────┬─────────────────────┘                  │
│                    ▼                                        │
│            ┌───────────────┐                                │
│            │   McpServer   │                                │
│            │ registerTools │                                │
│            └───────┬───────┘                                │
│                    ▼                                        │
│            ┌───────────────┐                                │
│            │ Remote db.json│                                │
│            │  (GitHub Raw  │                                │
│            │  with Cache)  │                                │
│            └───────────────┘                                │
└─────────────────────────────────────────────────────────────┘

Clients:
  Claude Desktop / Cursor  ──► stdio (local)
  HTTP / Cloud Clients     ──► HTTP :9001/mcp
```

---

## 🌐 Data Source

Portfolio data is fetched dynamically from:
```
https://raw.githubusercontent.com/shubhamstr/New-Portfolio/refs/heads/main/web/src/data/db.json
```
- **Live Sync**: Any updates made to `db.json` in your portfolio repository are automatically reflected in your MCP server.
- **In-Memory Caching**: Cached for 5 minutes (TTL) to avoid redundant network calls and rate limiting while keeping data fresh.
- **Configurable**: Can be overridden via the `PORTFOLIO_DATA_URL` environment variable.

---

## 🛠️ Tools Reference

### `get-profile`
Returns Shubham Sutar's profile overview, title, 5+ years experience summary, core tech stacks, and resume link.

- **Parameters:** None
- **Example prompt:** *"Tell me about Shubham Sutar and his background."*

---

### `get-skills`
Returns technical skills from `db.json` with proficiency percentage levels.

- **Parameters:**
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `category` | `string` *(optional)* | Filter by category: `frontend`, `backend`, `database`, `cloud`, `tools`, `concepts`, or `all` |

- **Example prompt:** *"What are Shubham's backend and database skills?"*

---

### `get-projects`
Returns portfolio projects (featured, developer tools, and web platforms) with descriptions, tech stacks, live demos, and GitHub links.

- **Parameters:**
  | Parameter | Type | Description |
  |-----------|------|-------------|
  | `type` | `string` *(optional)* | Filter by project type: `featured`, `tools`, `others`, or `all` |
  | `technology` | `string` *(optional)* | Filter by technology keyword (e.g. `React.js`, `Gemini`, `Docker`, `Express.js`) |

- **Example prompt:** *"Show me Shubham's AI tools and projects built with React or Node.js."*

---

### `get-experience`
Returns career overview, milestones, engineering accomplishments, and link to full resume.

- **Parameters:** None
- **Example prompt:** *"What is Shubham's work experience and key engineering achievements?"*

---

### `get-contact`
Returns direct links to resume, GitHub, LinkedIn, Twitter/X, Docker Hub, LeetCode, Stack Overflow, Dev.to, Medium, CodePen, and more.

- **Parameters:** None
- **Example prompt:** *"Give me Shubham's contact details and GitHub profile link."*

---

### `get-full-portfolio`
Returns the entire portfolio in one comprehensive markdown response.

- **Parameters:** None
- **Example prompt:** *"Give me a full summary of Shubham's portfolio."*

---

### `get-raw-data`
Returns the raw JSON data object directly fetched from `db.json`.

- **Parameters:** None
- **Example prompt:** *"Show me the raw portfolio database JSON."*

---

## 📦 Prerequisites

- **Node.js** >= 22
- **npm** >= 10

---

## 💻 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/shubhamstr/Portfolio-MCP-Server.git
cd Portfolio-MCP-Server

# 2. Install dependencies
npm install

# 3. Build TypeScript
npm run build

# 4. Run locally (stdio mode — no PORT set)
npm start
```

### Run in HTTP Mode Locally

```bash
# Windows PowerShell
$env:PORT=9001; node build/index.js

# Linux / macOS
PORT=9001 node build/index.js
```

### Smoke Test HTTP Mode

Verify the server is running and responds to MCP JSON-RPC protocol requests:

```bash
# PowerShell
$body = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}'
Invoke-RestMethod -Uri http://localhost:9001/mcp -Method POST -ContentType "application/json" -Body $body -Headers @{"Accept"="application/json, text/event-stream"}

# curl (Linux / macOS)
curl -X POST http://localhost:9001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}'
```

Expected response:
```
event: message
data: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"portfolio-mcp","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
```

Health check endpoint:
```bash
curl http://localhost:9001/health
# {"status":"ok","server":"portfolio-mcp","source":"https://raw.githubusercontent.com/shubhamstr/New-Portfolio/refs/heads/main/web/src/data/db.json"}
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | *(unset)* | Set to any port number (e.g. `9001`) to enable HTTP transport mode. If unset, stdio mode is used. |
| `PORTFOLIO_DATA_URL` | `https://raw.githubusercontent.com/.../db.json` | Remote JSON URL for portfolio data. |

Copy `.env.example` to `.env` if desired:
```bash
cp .env.example .env
```

---

## 🖥️ Connect to Claude Desktop

### Option 1: stdio Mode (Local, no port needed)

Open your Claude Desktop config file:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following under `mcpServers`:

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "node",
      "args": ["W:/shubham/personal/Portfolio-MCP-Server/build/index.js"]
    }
  }
}
```

*(Note: Replace with your absolute path to `build/index.js` using forward slashes).*

### Option 2: HTTP Mode (Port 9001)

Start the server with `PORT=9001`, then configure Claude Desktop:

```json
{
  "mcpServers": {
    "portfolio": {
      "type": "http",
      "url": "http://localhost:9001/mcp"
    }
  }
}
```

Restart Claude Desktop. The portfolio tools (`get-profile`, `get-skills`, `get-projects`, `get-experience`, `get-contact`, `get-full-portfolio`, `get-raw-data`) will be available.

---

## 📁 Project Structure

```
Portfolio-MCP-Server/
├── src/
│   └── index.ts          # Main MCP server — tools, data fetcher, HTTP & stdio transports
├── build/                # Compiled JavaScript output (git-ignored)
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD deployment workflow (ECR & EC2 / VPS)
├── Dockerfile            # Multi-stage production Docker build
├── .dockerignore
├── .env.example          # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| [TypeScript](https://www.typescriptlang.org/) | Language & type safety |
| [Node.js 22](https://nodejs.org/) | Modern JavaScript runtime |
| [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | Official Model Context Protocol SDK |
| [Express](https://expressjs.com/) | Web server for Streamable HTTP transport |
| [Zod](https://zod.dev/) | Schema definition & input validation for tools |
| [Docker](https://www.docker.com/) | Containerization |

---

## 📄 License

ISC
