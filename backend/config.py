"""
Configuration and constants for the backend API.
Can be updated to support environment-based configuration.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Server Configuration
HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
PORT = int(os.getenv("BACKEND_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

if FRONTEND_URL and FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

# File Upload Configuration
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".csv"}

# Shortlist Configuration
SHORTLIST_SIZE = 10
MIN_CANDIDATES_PER_GROUP = 1

# Fairness Metrics Configuration
DEMOGRAPHIC_PARITY_THRESHOLD = 0.8
EQUALIZED_ODDS_THRESHOLD = 0.8
FAIRNESS_SCORE_THRESHOLD = 75

# Risk Level Thresholds
RISK_LEVEL_HIGH_THRESHOLD = 60
RISK_LEVEL_MEDIUM_THRESHOLD = 75
