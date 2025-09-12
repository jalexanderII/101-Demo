"""In-memory TTL cache for API responses."""

from datetime import date as date_cls
from typing import Any, Optional, Tuple

from cachetools import TTLCache

from .config import CACHE_MAX_SIZE, CACHE_TTL_SECONDS

# Initialize the cache
cache = TTLCache(maxsize=CACHE_MAX_SIZE, ttl=CACHE_TTL_SECONDS)


def get_cache_key(ticker: str, date: Optional[str] = None) -> Tuple[str, str]:
    """Generate a cache key from ticker and optional date.
    
    If date is None, uses current date to ensure cache refreshes daily.
    """
    effective_date = date or date_cls.today().isoformat()
    return (ticker.upper(), effective_date)


def get_cached(cache_key: str, date: Optional[str] = None) -> Optional[Any]:
    """Get cached data if available.
    
    Args:
        cache_key: Either a ticker symbol or a complex cache key
        date: Optional date for ticker-based cache keys
    """
    # If cache_key contains underscores, treat it as a complex key
    if "_" in cache_key:
        # For complex keys, include current date to ensure daily refresh
        effective_date = date or date_cls.today().isoformat()
        full_key = f"{cache_key}_{effective_date}"
        return cache.get(full_key)
    else:
        # For simple ticker keys, use the standard cache key logic
        key = get_cache_key(cache_key, date)
        return cache.get(key)


def set_cached(cache_key: str, data: Any, date: Optional[str] = None) -> None:
    """Store data in cache.
    
    Args:
        cache_key: Either a ticker symbol or a complex cache key
        data: Data to store in cache
        date: Optional date for ticker-based cache keys
    """
    # If cache_key contains underscores, treat it as a complex key
    if "_" in cache_key:
        # For complex keys, include current date to ensure daily refresh
        effective_date = date or date_cls.today().isoformat()
        full_key = f"{cache_key}_{effective_date}"
        cache[full_key] = data
    else:
        # For simple ticker keys, use the standard cache key logic
        key = get_cache_key(cache_key, date)
        cache[key] = data
