# Finance Dashboard

A full-stack finance dashboard that provides real-time stock information using Yahoo Finance (via yfinance). No API key required.

## Features

- 🔍 Search for any stock ticker
- 📊 View comprehensive company information including:
  - Company overview and description
  - Market capitalization
  - Exchange information
  - Company contact details
  - Financial identifiers (CIK, etc.)
- 📈 Income statement, balance sheet, and cash flow
- ⚡ Fast response times with backend caching
- 🎨 Modern, responsive UI with shadcn/ui components

## Tech Stack

### Backend

- **FastAPI** (Python) - High-performance async API framework
- **yfinance** - Stock data from Yahoo Finance (no API key)
- **cachetools** - TTL-based in-memory caching
- **uv** - Fast Python package manager

### Frontend

- **Next.js 14** (App Router) - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components
- **Lucide React** - Icon library

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker. This requires no local installation of Python, Node.js, or pnpm.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows, macOS, or Linux)

### Running with Docker

1. **Install Docker Desktop** (if not already installed):
   - Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - For Windows: Make sure WSL 2 is enabled (Docker Desktop will guide you through this)

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 101-Demo
   ```

3. Start all services:
   ```bash
   docker-compose up
   ```

4. Open your browser:
   - Frontend: `http://localhost:3000`
   - Backend API docs: `http://localhost:8000/docs`

The first build may take a few minutes as it downloads dependencies and builds the images. Subsequent starts will be much faster.

To stop the services, press `Ctrl+C` (or `Cmd+C` on Mac) or run:
```bash
docker-compose down
```

**Note for Windows users**: If you encounter any issues, make sure Docker Desktop is running and WSL 2 is properly configured. You can verify Docker is working by running `docker --version` in PowerShell or Command Prompt.

## Manual Setup (Development)

If you prefer to run the services locally for development:

### Prerequisites

- Python 3.12+
- Node.js 18+
- pnpm

### Setup

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   source .venv/bin/activate
   uv run uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. Open the application at `http://localhost:3000`
2. Enter a stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
3. Click "Get Overview" to fetch and display the stock information

## API Endpoints

- `GET /api/ticker/{ticker}` - Get ticker overview data
  - Optional query parameter: `date` (format: YYYY-MM-DD)
  - Returns cached data if available (6-hour TTL by default)
- `GET /api/ticker/{ticker}/financials` - Get financial statements
  - Query parameters: `timeframe` (annual | quarterly | ttm), `limit`
  - Returns income statement, balance sheet, and cash flow

## Environment Variables

### Backend

- `CACHE_TTL_SECONDS` (optional, default: 21600) - Cache time-to-live in seconds
- `CACHE_MAX_SIZE` (optional, default: 1024) - Maximum number of cached items
- `ALLOWED_ORIGINS` (optional, default: <http://localhost:3000>) - CORS allowed origins

## Development

The frontend is configured to automatically proxy API requests to the backend via Next.js rewrites, so you can make requests to `/api/*` from the frontend and they'll be forwarded to `http://localhost:8000/api/*`.

## Caching

The backend implements an in-memory TTL cache to reduce API calls and improve response times. Cache headers are included in responses for proper browser caching as well.
