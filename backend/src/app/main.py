"""Main FastAPI application for Finance Dashboard."""

from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from .cache import get_cached, set_cached
from .config import ALLOWED_ORIGINS, CACHE_TTL_SECONDS
from .polygon import polygon_client
from .yfinance_client import yfinance_client

# Create FastAPI app
app = FastAPI(
    title="Finance Dashboard API",
    description="Backend API for fetching and caching stock ticker data from Polygon.io",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize clients on startup."""
    await polygon_client.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up clients on shutdown."""
    await polygon_client.stop()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "cache_ttl": CACHE_TTL_SECONDS}


@app.get("/api/ticker/{ticker}")
async def get_ticker_overview(
    ticker: str,
    date: Optional[str] = Query(
        None, regex=r"^\d{4}-\d{2}-\d{2}$", description="Date in YYYY-MM-DD format"
    ),
):
    """
    Get ticker overview data from Polygon.io with caching.

    Args:
        ticker: Stock ticker symbol (e.g., AAPL, MSFT)
        date: Optional date in YYYY-MM-DD format

    Returns:
        Ticker overview data from Polygon API
    """
    # Check cache first
    cached_data = get_cached(ticker, date)
    if cached_data is not None:
        response = JSONResponse(content=cached_data)
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response

    try:
        # Fetch from Polygon API
        data = await polygon_client.get_ticker_overview(ticker, date)

        # Cache the successful response
        set_cached(ticker, data, date)

        # Return with cache headers
        response = JSONResponse(content=data)
        response.headers["X-Cache"] = "MISS"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response

    except httpx.HTTPStatusError as e:
        # Handle Polygon API errors
        error_detail = {
            "error": "Polygon API error",
            "status_code": e.response.status_code,
        }
        try:
            error_detail["detail"] = e.response.json()
        except:
            error_detail["detail"] = e.response.text

        raise HTTPException(status_code=e.response.status_code, detail=error_detail)

    except Exception as e:
        # Handle other errors
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/proxy/logo")
async def proxy_logo(url: str):
    """
    Proxy logo images from Polygon API that require authentication.
    
    Args:
        url: The Polygon logo URL to proxy
        
    Returns:
        The image content with appropriate headers
    """
    if not url.startswith("https://api.polygon.io/v1/reference/company-branding/"):
        raise HTTPException(status_code=400, detail="Invalid logo URL")
    
    try:
        # Use the polygon client's http client with auth headers
        response = await polygon_client.client.get(url)
        response.raise_for_status()
        
        # Return the image with appropriate content type
        content_type = response.headers.get("content-type", "image/png")
        return Response(content=response.content, media_type=content_type)
        
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch logo")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ticker/{ticker}/snapshot")
async def get_ticker_snapshot(ticker: str):
    """
    Get real-time ticker snapshot data from Polygon.io with caching.

    Args:
        ticker: Stock ticker symbol (e.g., AAPL, MSFT)

    Returns:
        Ticker snapshot data from Polygon API including latest trade, quote,
        minute bar, day bar, and previous day data
    """
    # Use a different cache key pattern for snapshots
    cache_key = f"snapshot_{ticker}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        response = JSONResponse(content=cached_data)
        response.headers["X-Cache"] = "HIT"
        # Shorter cache time for real-time data (5 minutes)
        cache_ttl = 300
        response.headers["Cache-Control"] = f"public, max-age={cache_ttl}"
        return response

    try:
        # Fetch from Polygon API
        data = await polygon_client.get_ticker_snapshot(ticker)

        # Cache with shorter TTL for real-time data
        set_cached(cache_key, data)

        # Return with cache headers
        response = JSONResponse(content=data)
        response.headers["X-Cache"] = "MISS"
        cache_ttl = 300  # 5 minutes for real-time data
        response.headers["Cache-Control"] = f"public, max-age={cache_ttl}"
        return response

    except httpx.HTTPStatusError as e:
        # Handle Polygon API errors
        error_detail = {
            "error": "Polygon API error",
            "status_code": e.response.status_code,
        }
        try:
            error_detail["detail"] = e.response.json()
        except:
            error_detail["detail"] = e.response.text

        raise HTTPException(status_code=e.response.status_code, detail=error_detail)

    except Exception as e:
        # Handle other errors
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/ticker/{ticker}/financials")
async def get_ticker_financials(
    ticker: str,
    timeframe: Optional[str] = Query(
        None,
        description="annual | quarterly | ttm",
        regex=r"^(annual|quarterly|ttm)$",
    ),
    limit: int = Query(8, ge=1, le=100),
    include_sources: bool = Query(False),
    sort: Optional[str] = Query(None, description="Sort field for ordering"),
    order: Optional[str] = Query(None, description="asc | desc", regex=r"^(asc|desc)$"),
    filing_date: Optional[str] = Query(None, description="Filter by filing_date"),
    period_of_report_date: Optional[str] = Query(None, description="Filter by period_of_report_date"),
):
    """
    Get financial statements for a ticker from Polygon.io with caching.

    Uses the experimental /vX/reference/financials endpoint.
    """
    cache_key = f"financials_{ticker}_{timeframe}_{limit}_{include_sources}_{sort}_{order}_{filing_date}_{period_of_report_date}"

    cached_data = get_cached(cache_key)
    if cached_data is not None:
        response = JSONResponse(content=cached_data)
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response

    try:
        data = await polygon_client.get_financials(
            ticker=ticker,
            timeframe=timeframe,
            limit=limit,
            include_sources=include_sources,
            sort=sort,
            order=order,
            filing_date=filing_date,
            period_of_report_date=period_of_report_date,
        )

        set_cached(cache_key, data)

        response = JSONResponse(content=data)
        response.headers["X-Cache"] = "MISS"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response

    except httpx.HTTPStatusError as e:
        error_detail = {
            "error": "Polygon API error",
            "status_code": e.response.status_code,
        }
        try:
            error_detail["detail"] = e.response.json()
        except:
            error_detail["detail"] = e.response.text

        raise HTTPException(status_code=e.response.status_code, detail=error_detail)

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/ticker/{ticker}/history")
async def get_ticker_history(
    ticker: str,
    period: Optional[str] = Query(
        "7d",
        description="Time period for historical data",
        regex=r"^(7d|3mo|6mo|1y)$",
    ),
):
    """
    Get historical stock price data using yfinance with caching.

    Args:
        ticker: Stock ticker symbol (e.g., AAPL, MSFT)
        period: Time period - "7d", "3mo", "6mo", or "1y" (default: "7d")

    Returns:
        Historical price data with dates and closing prices
    """
    # Create cache key for historical data
    cache_key = f"history_{ticker.upper()}_{period}"
    
    # Check cache first
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        response = JSONResponse(content=cached_data)
        response.headers["X-Cache"] = "HIT"
        # Cache historical data for 1 hour
        cache_ttl = 3600
        response.headers["Cache-Control"] = f"public, max-age={cache_ttl}"
        return response

    try:
        # Fetch from yfinance
        data = yfinance_client.get_historical_data(ticker, period)

        # Cache the successful response for 1 hour
        set_cached(cache_key, data)

        # Return with cache headers
        response = JSONResponse(content=data)
        response.headers["X-Cache"] = "MISS"
        cache_ttl = 3600  # 1 hour for historical data
        response.headers["Cache-Control"] = f"public, max-age={cache_ttl}"
        return response

    except HTTPException:
        # Re-raise HTTP exceptions from yfinance_client
        raise

    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail={"error": str(e)})
