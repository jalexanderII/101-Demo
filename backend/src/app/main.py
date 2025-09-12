"""Main FastAPI application for Finance Dashboard."""

from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from .cache import get_cached, set_cached
from .config import ALLOWED_ORIGINS, CACHE_TTL_SECONDS, USER_DB, User
from .polygon import polygon_client


# Create FastAPI app
app = FastAPI(
    title="Finance Dashboard API",
    description="Backend API for fetching and caching stock ticker data from Polygon.io",
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event():
    """Initialize clients on startup."""
    await polygon_client.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up clients on shutdown."""
    await polygon_client.stop()


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
        raise HTTPException(
            status_code=e.response.status_code, detail="Failed to fetch logo"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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


@app.get("/api/user/{email}")
async def get_user_by_email(email: str) -> User:
    """
    Get user by email from the user database.
    """
    return USER_DB.get(email)
