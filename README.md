# 🌤️ Weather MCP Server

A **Model Context Protocol (MCP) server** that exposes real-time US weather data from the [National Weather Service (NWS) API](https://www.weather.gov/documentation/services-web-api) as tools for AI assistants like Claude.

Supports both:
- **stdio** — for local Claude Desktop usage (no server needed)
- **Streamable HTTP** — for HTTP-based integrations

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tools Reference](#-tools-reference)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Connect to Claude Desktop](#-connect-to-claude-desktop)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)

---

## ✨ Features

- 🌩️ **Weather Alerts** — real-time active alerts for any US state
- 🌡️ **Weather Forecast** — multi-day forecast by GPS coordinates
- 🔀 **Dual transport** — auto-selects stdio or HTTP based on environment
- 🔁 **Stateful sessions** — each HTTP client gets an isolated MCP session
- ❤️ **Health endpoint** — `/health` for uptime monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Weather MCP Server                      │
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────────┐  │
│  │  stdio mode  │         │        HTTP mode             │  │
│  │  (local)     │         │  POST /mcp  GET /mcp         │  │
│  └──────┬───────┘         └──────────────┬───────────────┘  │
│         │                                │                  │
│         └──────────┬─────────────────────┘                  │
│                    ▼                                        │
│            ┌───────────────┐                                │
│            │  McpServer    │                                │
│            │  registerTools│                                │
│            └───────┬───────┘                                │
│                    ▼                                        │
│            ┌───────────────┐                                │
│            │  NWS REST API │                                │
│            │  api.weather.gov                               │
│            └───────────────┘                                │
└─────────────────────────────────────────────────────────────┘

Clients:
  Claude Desktop  ──► stdio (local)
  HTTP Clients    ──► HTTP :9001/mcp
```

---

## 🛠️ Tools Reference

### `get-alerts`
Get active weather alerts for a US state.

| Parameter | Type | Description |
|-----------|------|-------------|
| `state` | `string` | Two-letter US state code (e.g. `CA`, `NY`, `TX`) |

**Example prompt:** *"Are there any weather alerts in Florida?"*

---

### `get-forecast`
Get a multi-day weather forecast for any US location by GPS coordinates.

| Parameter | Type | Description |
|-----------|------|-------------|
| `latitude` | `number` | Latitude between -90 and 90 |
| `longitude` | `number` | Longitude between -180 and 180 |

**Example prompt:** *"What's the weather forecast for New York City?"*

> **Note:** The NWS API only covers the **continental United States**. It does not support international coordinates.

---

## 📦 Prerequisites

- **Node.js** >= 22
- **npm** >= 10

---

## 💻 Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/Portfolio-MCP-Server.git
cd Portfolio-MCP-Server

# 2. Install dependencies
npm install

# 3. Build TypeScript
npm run build

# 4. Run locally (stdio mode — no PORT set)
npm start
```

### Run in HTTP mode locally

```bash
# Windows PowerShell
$env:PORT=9001; node build/index.js

# Linux / macOS
PORT=9001 node build/index.js
```

### Smoke test HTTP mode

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
data: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"weather","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | *(unset)* | Set to any port number (e.g. `9001`) to enable HTTP mode. If unset, stdio mode is used. |

Copy `.env.example` to `.env` and adjust:
```bash
cp .env.example .env
```

---

## 🖥️ Connect to Claude Desktop

### Option 1: stdio mode (Local, no port needed)

Open your Claude Desktop config file:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["C:/absolute/path/to/Portfolio-MCP-Server/build/index.js"]
    }
  }
}
```

### Option 2: HTTP mode (Port 9001)

```json
{
  "mcpServers": {
    "weather": {
      "type": "http",
      "url": "http://localhost:9001/mcp"
    }
  }
}
```

Restart Claude Desktop. The `get-alerts` and `get-forecast` tools will appear.

---

## 📁 Project Structure

```
Portfolio-MCP-Server/
├── src/
│   └── index.ts          # Main server — tools, transports, entry point
├── build/                # Compiled JS output (git-ignored)
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions workflow
├── Dockerfile            # Multi-stage Docker build
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
| [TypeScript](https://www.typescriptlang.org/) | Language |
| [Node.js 22](https://nodejs.org/) | Runtime |
| [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | MCP server framework |
| [Express](https://expressjs.com/) | HTTP server for remote transport |
| [Zod](https://zod.dev/) | Input schema validation |
| [NWS API](https://www.weather.gov/documentation/services-web-api) | Weather data source (free, no API key) |

---

## 📄 License

ISC
