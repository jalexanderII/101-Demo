"""yfinance client for stock data (no API key required)."""

import asyncio
import re
from typing import Any, Dict, List, Optional

import yfinance as yf


def _domain_from_url(url: Optional[str]) -> Optional[str]:
    """Extract domain from URL for Clearbit logo (e.g. https://www.apple.com -> apple.com)."""
    if not url or not isinstance(url, str):
        return None
    url = url.strip().lower()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    match = re.search(r"https?://(?:www\.)?([^/]+)", url)
    return match.group(1) if match else None


def _clearbit_logo_url(website: Optional[str]) -> Optional[str]:
    """Build Clearbit logo URL from company website."""
    domain = _domain_from_url(website)
    return f"https://logo.clearbit.com/{domain}" if domain else None


def _to_snake(key: str) -> str:
    """Convert camelCase or Title Case to snake_case."""
    s = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", key)
    return (
        re.sub("([a-z0-9])([A-Z])", r"\1_\2", s)
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )


def _safe_float(val: Any) -> Optional[float]:
    """Convert to float, return None for NaN/inf."""
    if val is None:
        return None
    try:
        f = float(val)
        if f != f or abs(f) == float("inf"):  # NaN or inf
            return None
        return f
    except (TypeError, ValueError):
        return None


def _series_to_statement(series: Any) -> Dict[str, Dict[str, Any]]:
    """Convert a pandas Series (index=row names, values=numbers) to statement dict."""
    statement: Dict[str, Dict[str, Any]] = {}
    if series is None:
        return statement
    try:
        for idx in series.index:
            val = series.loc[idx]
            num_val = _safe_float(val)
            if num_val is None:
                continue
            key = _to_snake(str(idx))
            statement[key] = {"value": num_val, "unit": "USD", "label": str(idx)}
    except Exception:
        pass
    return statement


async def get_ticker_overview(
    ticker: str, date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get ticker overview from yfinance, mapped to Polygon-style response shape.

    Args:
        ticker: Stock ticker symbol
        date: Optional date (ignored; yfinance returns current data)

    Returns:
        Dict with status and results matching frontend expectations
    """

    def _fetch():
        t = yf.Ticker(ticker.upper())
        info = t.info
        if not info:
            return None
        website = info.get("website") or info.get("weburl")
        logo_url = _clearbit_logo_url(website)
        address = {}
        if info.get("city") or info.get("state"):
            address = {"city": info.get("city"), "state": info.get("state")}
        return {
            "status": "OK",
            "results": {
                "ticker": info.get("symbol", ticker.upper()),
                "name": info.get("longName") or info.get("shortName") or ticker.upper(),
                "market": info.get("market", "stocks"),
                "locale": "us",
                "primary_exchange": info.get("exchange", "N/A"),
                "type": info.get("quoteType", "CS"),
                "active": True,
                "currency_name": info.get("currency", "USD"),
                "market_cap": info.get("marketCap"),
                "address": address,
                "description": info.get("longBusinessSummary"),
                "sic_description": info.get("industry"),
                "homepage_url": website,
                "total_employees": info.get("fullTimeEmployees"),
                "branding": {"logo_url": logo_url} if logo_url else {},
                "share_class_shares_outstanding": info.get("sharesOutstanding"),
            },
        }

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _fetch)
    if result is None:
        raise ValueError(f"No data found for ticker {ticker}")
    return result


async def get_financials(
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
    Get financial statements from yfinance, mapped to Polygon-style response shape.

    Args:
        ticker: Stock ticker symbol
        timeframe: "annual", "quarterly", or "ttm"
        limit: Number of periods to return
        include_sources: Ignored (yfinance has no sources)
        sort: Ignored
        order: Ignored
        filing_date: Ignored
        period_of_report_date: Ignored

    Returns:
        Dict with results array matching frontend expectations
    """

    def _fetch():
        t = yf.Ticker(ticker.upper())
        freq = (
            "yearly"
            if timeframe in (None, "annual")
            else "quarterly"
            if timeframe == "quarterly"
            else "yearly"
        )

        income = t.income_stmt if hasattr(t, "income_stmt") else None
        balance = t.balance_sheet if hasattr(t, "balance_sheet") else None
        cashflow = t.cashflow if hasattr(t, "cashflow") else None

        if timeframe == "ttm":
            income = getattr(t, "ttm_income_stmt", None) or income
            balance = getattr(t, "ttm_balance_sheet", None) or balance
            cashflow = getattr(t, "ttm_cashflow", None) or cashflow

        results: List[Dict[str, Any]] = []

        def get_columns(df):
            if df is None or (hasattr(df, "empty") and df.empty):
                return []
            return list(df.columns) if hasattr(df, "columns") else []

        all_cols = set()
        for df in (income, balance, cashflow):
            all_cols.update(get_columns(df))

        if not all_cols:
            return {"results": []}

        sorted_cols = sorted(
            [c for c in all_cols if hasattr(c, "year")],
            key=lambda x: x,
            reverse=True,
        )[:limit]

        for col in sorted_cols:
            end_date = (
                col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)
            )
            fiscal_year = str(col.year) if hasattr(col, "year") else end_date[:4]
            fiscal_period = ""
            if hasattr(col, "month"):
                q = (col.month - 1) // 3 + 1
                fiscal_period = "Q4" if freq == "yearly" else f"Q{q}"

            income_stmt = (
                _series_to_statement(income[col])
                if income is not None and col in income.columns
                else {}
            )
            balance_sheet = (
                _series_to_statement(balance[col])
                if balance is not None and col in balance.columns
                else {}
            )
            cash_flow_stmt = (
                _series_to_statement(cashflow[col])
                if cashflow is not None and col in cashflow.columns
                else {}
            )

            results.append(
                {
                    "start_date": None,
                    "end_date": end_date,
                    "filing_date": None,
                    "timeframe": timeframe or "annual",
                    "fiscal_period": fiscal_period,
                    "fiscal_year": fiscal_year,
                    "financials": {
                        "income_statement": income_stmt,
                        "balance_sheet": balance_sheet,
                        "cash_flow_statement": cash_flow_stmt,
                    },
                }
            )

        return {"results": results}

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch)
