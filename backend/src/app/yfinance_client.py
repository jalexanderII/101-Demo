"""YFinance client for fetching historical stock data."""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import yfinance as yf
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class YFinanceClient:
    """Client for fetching historical stock data using yfinance."""
    
    # Mapping of period strings to yfinance-compatible periods
    PERIOD_MAP = {
        "7d": "7d",
        "3mo": "3mo", 
        "6mo": "6mo",
        "1y": "1y"
    }
    
    @classmethod
    def get_historical_data(cls, ticker: str, period: str = "7d") -> Dict[str, Any]:
        """
        Get historical stock price data for a given ticker and period.
        
        Args:
            ticker: Stock ticker symbol (e.g., "AAPL", "MSFT")
            period: Time period ("7d", "3mo", "6mo", "1y")
            
        Returns:
            Dictionary containing ticker, period, and historical data
            
        Raises:
            HTTPException: If ticker is invalid or data cannot be fetched
        """
        if period not in cls.PERIOD_MAP:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid period. Must be one of: {list(cls.PERIOD_MAP.keys())}"
            )
        
        try:
            # Create ticker object and fetch historical data
            stock = yf.Ticker(ticker.upper())
            hist = stock.history(period=cls.PERIOD_MAP[period])
            
            if hist.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"No historical data found for ticker '{ticker.upper()}'"
                )
            
            # Convert to list of dictionaries for JSON serialization
            data = []
            for date, row in hist.iterrows():
                data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "close": round(float(row['Close']), 2),
                    "open": round(float(row['Open']), 2),
                    "high": round(float(row['High']), 2),
                    "low": round(float(row['Low']), 2),
                    "volume": int(row['Volume'])
                })
            
            # Sort by date to ensure consistent ordering
            data.sort(key=lambda x: x['date'])
            
            logger.info(f"Fetched {len(data)} data points for {ticker.upper()} ({period})")
            
            return {
                "ticker": ticker.upper(),
                "period": period,
                "data": data,
                "count": len(data)
            }
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            
            logger.error(f"Error fetching data for {ticker}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch historical data for {ticker.upper()}: {str(e)}"
            )
    
    @classmethod
    def validate_ticker(cls, ticker: str) -> bool:
        """
        Validate if a ticker symbol exists and has data.
        
        Args:
            ticker: Stock ticker symbol
            
        Returns:
            True if ticker is valid, False otherwise
        """
        try:
            stock = yf.Ticker(ticker.upper())
            info = stock.info
            
            # Check if we got valid info back
            return bool(info and info.get('symbol'))
            
        except Exception:
            return False


# Global client instance
yfinance_client = YFinanceClient()
