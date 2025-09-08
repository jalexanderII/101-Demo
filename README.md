# Finance Dashboard

A full-stack finance dashboard that provides real-time stock information using the Polygon.io API.

## Features

- 🔍 Search for any stock ticker
- 📊 View comprehensive company information including:
  - Company overview and description
  - Market capitalization
  - Exchange information
  - Company contact details
  - Financial identifiers (CIK, FIGI, etc.)
- 📅 Optional date parameter for historical data
- ⚡ Fast response times with backend caching
- 🎨 Modern, responsive UI with shadcn/ui components

## Tech Stack

### Backend
- **FastAPI** (Python) - High-performance async API framework
- **httpx** - Async HTTP client for Polygon.io API calls
- **cachetools** - TTL-based in-memory caching
- **uv** - Fast Python package manager

### Frontend
- **Next.js 14** (App Router) - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components
- **Lucide React** - Icon library

## Prerequisites

- Python 3.8+
- Node.js 18+
- pnpm
- Polygon.io API key

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Set your Polygon.io API key:
   ```bash
   export POLYGON_API_KEY=your_api_key_here
   ```

3. Run the FastAPI server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. Open the application at `http://localhost:3000`
2. Enter a stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
3. Optionally select a date for historical data
4. Click "Get Overview" to fetch and display the stock information

## API Endpoints

- `GET /api/ticker/{ticker}` - Get ticker overview data
  - Optional query parameter: `date` (format: YYYY-MM-DD)
  - Returns cached data if available (6-hour TTL by default)

## Environment Variables

### Backend
- `POLYGON_API_KEY` (required) - Your Polygon.io API key
- `CACHE_TTL_SECONDS` (optional, default: 21600) - Cache time-to-live in seconds
- `CACHE_MAX_SIZE` (optional, default: 1024) - Maximum number of cached items
- `ALLOWED_ORIGINS` (optional, default: http://localhost:3000) - CORS allowed origins

## Development

The frontend is configured to automatically proxy API requests to the backend via Next.js rewrites, so you can make requests to `/api/*` from the frontend and they'll be forwarded to `http://localhost:8000/api/*`.

## Caching

The backend implements an in-memory TTL cache to reduce API calls to Polygon.io and improve response times. Cache headers are included in responses for proper browser caching as well.