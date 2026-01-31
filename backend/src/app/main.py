"""Main FastAPI application for Finance Dashboard."""

from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .cache import get_cached, set_cached
from .config import ALLOWED_ORIGINS, CACHE_TTL_SECONDS, USER_DB, User
from .yfinance_client import get_financials as yf_get_financials
from .yfinance_client import get_ticker_overview as yf_get_ticker_overview

# Create FastAPI app
app = FastAPI(
    title="Finance Dashboard API",
    description="Backend API for fetching and caching stock ticker data from Yahoo Finance",
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
    Get ticker overview data from Yahoo Finance with caching.

    Args:
        ticker: Stock ticker symbol (e.g., AAPL, MSFT)
        date: Optional date in YYYY-MM-DD format (ignored; yfinance returns current data)

    Returns:
        Ticker overview data
    """
    cached_data = get_cached(ticker, date)
    if cached_data is not None:
        response = JSONResponse(content=cached_data)
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response

    try:
        data = await yf_get_ticker_overview(ticker, date)
        set_cached(ticker, data, date)
        response = JSONResponse(content=data)
        response.headers["X-Cache"] = "MISS"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"error": str(e)})
    except Exception as e:
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
    period_of_report_date: Optional[str] = Query(
        None, description="Filter by period_of_report_date"
    ),
):
    """
    Get financial statements for a ticker from Yahoo Finance with caching.
    """
    cache_key = f"financials_{ticker}_{timeframe}_{limit}_{include_sources}_{sort}_{order}_{filing_date}_{period_of_report_date}"

    cached_data = get_cached(cache_key)
    if cached_data is not None:
        response = JSONResponse(content=cached_data)
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}"
        return response

    try:
        data = await yf_get_financials(
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
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/user/{email}")
async def get_user_by_email(email: str) -> User:
    """
    Get user by email from the user database.
    """
    return USER_DB.get(email)
