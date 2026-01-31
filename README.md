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

## Prerequisites

- Python 3.12+
- Node.js 18+
- pnpm

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the FastAPI server:
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
- `ALLOWED_ORIGINS` (optional, default: http://localhost:3000) - CORS allowed origins

## Development

The frontend is configured to automatically proxy API requests to the backend via Next.js rewrites, so you can make requests to `/api/*` from the frontend and they'll be forwarded to `http://localhost:8000/api/*`.

## Caching

The backend implements an in-memory TTL cache to reduce API calls and improve response times. Cache headers are included in responses for proper browser caching as well.