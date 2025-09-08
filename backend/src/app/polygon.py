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

    async def get_ticker_snapshot(self, ticker: str) -> Dict[str, Any]:
        """
        Get ticker snapshot (real-time market data) from Polygon API.

        Args:
            ticker: Stock ticker symbol

        Returns:
            Polygon API response as dict

        Raises:
            httpx.HTTPStatusError: If API returns non-200 status
        """
        if not self.client:
            raise RuntimeError("Client not initialized. Call start() first.")

        url = f"/v2/snapshot/locale/us/markets/stocks/tickers/{ticker.upper()}"

        response = await self.client.get(url)
        response.raise_for_status()

        return response.json()


# Global client instance
polygon_client = PolygonClient()
