"""In-memory TTL cache for API responses."""

from typing import Any, Optional, Tuple

from cachetools import TTLCache

from .config import CACHE_MAX_SIZE, CACHE_TTL_SECONDS

# Initialize the cache
cache = TTLCache(maxsize=CACHE_MAX_SIZE, ttl=CACHE_TTL_SECONDS)


def get_cache_key(ticker: str, date: Optional[str] = None) -> Tuple[str, str]:
    """Generate a cache key from ticker and optional date."""
    return (ticker.upper(), date or "-")


def get_cached(ticker: str, date: Optional[str] = None) -> Optional[Any]:
    """Get cached data if available."""
    if isinstance(ticker, str) and ticker.startswith("snapshot_"):
        # Direct key for snapshot data
        return cache.get(ticker)
    key = get_cache_key(ticker, date)
    return cache.get(key)


def set_cached(ticker: str, data: Any, date: Optional[str] = None) -> None:
    """Store data in cache."""
    if isinstance(ticker, str) and ticker.startswith("snapshot_"):
        # Direct key for snapshot data
        cache[ticker] = data
    else:
        key = get_cache_key(ticker, date)
        cache[key] = data
