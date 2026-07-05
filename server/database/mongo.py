"""
AttriSense AI - MongoDB Connection Configuration
SPDX-License-Identifier: Apache-2.0
"""

import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError

# Global database hook singleton reference
db = None
mongo_client = None


def init_db(app):
    """Establishes and confirms connection to MongoDB database instance."""
    global db, mongo_client

    mongo_uri = app.config.get("MONGO_URI")

    try:
        # Initialize MongoClient using the configured URI
        mongo_client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,  # Fail fast if cannot reach server
        )

        # Trigger internal ping check to ensure authentication and path are valid
        mongo_client.admin.command("ping")

        # Select database (extracts name from URI or defaults to 'attrisense')
        db_name = (
            mongo_uri.split("/")[-1].split("?")[0]
            if "/" in mongo_uri
            else "attrisense"
        )
        if not db_name:
            db_name = "attrisense"

        db = mongo_client[db_name]
        app.logger.info(
            f"Successfully established connection to MongoDB database: [{db_name}]"
        )

    except (ConnectionFailure, ConfigurationError) as e:
        app.logger.warning(
            f"MongoDB connection standby. Database URI: {mongo_uri}. "
            f"Reason: {str(e)}"
        )
        # In actual enterprise staging environments, we handle connection loss gracefully
        # by keeping a retry queue or putting the database connection in a deferred lazy-loader.
        db = None


def get_db():
    """Returns the singleton MongoDB database handle."""
    if db is None:
        raise ConnectionError(
            "MongoDB connection has not been initialized. Please invoke init_db(app) first."
        )
    return db
