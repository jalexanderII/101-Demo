"""Polygon.io API client."""

from typing import Any, Dict, Optional

import httpx

from .config import POLYGON_API_KEY, POLYGON_BASE_URL, POLYGON_TIMEOUT


class PolygonClient:
    """Async client for Polygon.io API."""

    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.headers = {"Authorization": f"Bearer {POLYGON_API_KEY}"}

    async def start(self):
        """Initialize the HTTP client."""
        self.client = httpx.AsyncClient(
            base_url=POLYGON_BASE_URL,
            headers=self.headers,
            timeout=POLYGON_TIMEOUT,
            http2=True,
        )

    async def stop(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()

    async def get_ticker_overview(
        self, ticker: str, date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get ticker overview from Polygon API.

        Args:
            ticker: Stock ticker symbol
            date: Optional date in YYYY-MM-DD format

        Returns:
            Polygon API response as dict

        Raises:
            httpx.HTTPStatusError: If API returns non-200 status
        """
        if not self.client:
            raise RuntimeError("Client not initialized. Call start() first.")

        url = f"/v3/reference/tickers/{ticker.upper()}"
        params = {"date": date} if date else None

        response = await self.client.get(url, params=params)
        response.raise_for_status()

        return response.json()

    async def get_financials(
        self,
        ticker: str,
        timeframe: Optional[str] = None,
        limit: int = 8,
        include_sources: bool = False,
        sort: Optional[str] = None,
        order: Optional[str] = None,
        filing_date: Optional[str] = None,
        period_of_report_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get financials from Polygon API (experimental endpoint).

        Docs: /vX/reference/financials

        Args:
            ticker: Stock ticker symbol
            timeframe: "annual", "quarterly", or "ttm"
            limit: Number of results to return (max 100)
            include_sources: Whether to include xpath/formula sources
            sort: Sort field used for ordering
            order: asc or desc
            filing_date: Filter by filing_date
            period_of_report_date: Filter by period_of_report_date

        Returns:
            Polygon API response as dict

        Raises:
            httpx.HTTPStatusError: If API returns non-200 status
        """
        if not self.client:
            raise RuntimeError("Client not initialized. Call start() first.")

        url = "/vX/reference/financials"
        params: Dict[str, Any] = {
            "ticker": ticker.upper(),
            "limit": limit,
        }
        if timeframe:
            params["timeframe"] = timeframe
        if include_sources:
            params["include_sources"] = "true"
        if sort:
            params["sort"] = sort
        if order:
            params["order"] = order
        if filing_date:
            params["filing_date"] = filing_date
        if period_of_report_date:
            params["period_of_report_date"] = period_of_report_date

        response = await self.client.get(url, params=params)
        response.raise_for_status()

        return response.json()


# Global client instance
polygon_client = PolygonClient()
