"""
AttriSense AI - Server Configurations
SPDX-License-Identifier: Apache-2.0
"""

import os
import datetime
from dotenv import load_dotenv

# Load environmental variables from .env file
load_dotenv()


class Config:
    """Consolidated configuration properties mapping environment variables."""

    # Core secret key used for session cookies and cryptographic signing
    SECRET_KEY = os.environ.get("SECRET_KEY", "attrisense_dev_secret_key_98213")

    # JSON Web Token Secret Configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt_signing_token_key_652")
    
    # Token expiration configurations
    days_expires = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_DAYS", "7"))
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=days_expires)
    JWT_REFRESH_TOKEN_EXPIRES = datetime.timedelta(days=30)

    # MongoDB connection configuration
    MONGO_URI = os.environ.get(
        "MONGO_URI", "mongodb://localhost:27017/attrisense"
    )

    # File directories for assets and models
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "datasets/uploads")
    MODEL_DIR = os.environ.get("MODEL_DIR", "ml/saved_models")

    # Performance & debug flags
    DEBUG = os.environ.get("FLASK_ENV") == "development"
    TESTING = False


