"""
AttriSense AI - Flask Backend Server Entry Point
SPDX-License-Identifier: Apache-2.0
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.settings import Config
from database.mongo import init_db
from routes.auth_routes import auth_bp
from routes.prediction_routes import prediction_bp
from routes.dataset_routes import dataset_bp


def create_app():
    """Application factory pattern to configure and initialize the Flask server."""
    app = Flask(__name__)

    # Load environmental configurations
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing for the React client
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize JWT Manager for secure session management
    jwt = JWTManager(app)

    # Initialize MongoDB connection hook
    init_db(app)

    # Register Blueprint routes (Clean Separation of Concerns)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(prediction_bp, url_prefix="/api/predict")
    app.register_blueprint(dataset_bp, url_prefix="/api/datasets")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Basic system health status indicator."""
        return (
            jsonify(
                {
                    "status": "healthy",
                    "service": "AttriSense AI Core Backend",
                    "database": "MongoDB Connection Standby",
                }
            ),
            200,
        )

    # Global custom error handlers for robust API interfaces
    @app.errorhandler(404)
    def resource_not_found(e):
        return jsonify({"error": "The requested API resource does not exist."}), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return (
            jsonify(
                {
                    "error": "A severe server error occurred. Please audit systems."
                }
            ),
            500,
        )

    return app


if __name__ == "__main__":
    # In production, bind to port 5000 inside gunicorn/uwsgi containers
    port = int(os.environ.get("PORT", 5000))
    flask_app = create_app()
    flask_app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
