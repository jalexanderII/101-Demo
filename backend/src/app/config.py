"""Configuration settings for the Finance Dashboard API."""

import os
from typing import Dict, List
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

# API Keys
POLYGON_API_KEY = os.getenv("POLYGON_API_KEY")
if not POLYGON_API_KEY:
    raise ValueError("POLYGON_API_KEY environment variable is required")

# Cache settings
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "21600"))  # 6 hours default
CACHE_MAX_SIZE = int(os.getenv("CACHE_MAX_SIZE", "1024"))

# CORS settings
ALLOWED_ORIGINS: List[str] = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

# Polygon API settings
POLYGON_BASE_URL = "https://api.polygon.io"
POLYGON_TIMEOUT = 10.0


class User(BaseModel):
    name: str
    email: str
    role: str


USER_DB: Dict[str, User] = {
    "admin": User(
        name="Admin",
        email="admin@gmail.com",
        role="admin",
    ),
    "joel": User(
        name="Joel",
        email="joel@gmail.com",
        role="user",
    ),
}
