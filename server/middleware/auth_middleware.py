"""
AttriSense AI - Authorization Middleware
SPDX-License-Identifier: Apache-2.0
"""

from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user_model import UserModel
from controllers.auth_controller import MOCK_MEM_DB


def token_required(f):
    """Decorator function to enforce JWT presence and verification on protected routes.
    
    Bridges custom routing requirements with official Flask-JWT-Extended middleware validation.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Automatically verifies token presence and validity in Request headers
            verify_jwt_in_request()
            user_id = get_jwt_identity()

            # Attempt to retrieve current user from MongoDB database
            try:
                user = UserModel.get_by_id(user_id)
                if user:
                    user["id"] = str(user.pop("_id"))
                    user.pop("password", None)
                    current_user = user
                else:
                    raise KeyError("User not found in MongoDB")
            except Exception:
                # If MongoDB is in standby, resolve profile payload from local MOCK_MEM_DB
                # or build a reliable fallback template
                current_user = None
                for cached_user in MOCK_MEM_DB.values():
                    if cached_user.get("id") == user_id:
                        current_user = dict(cached_user)
                        current_user.pop("password", None)
                        break

                if not current_user:
                    current_user = {
                        "id": user_id,
                        "email": "sandbox_operator@attrisense.com",
                        "name": "Local Sandbox Operator",
                        "fullName": "Local Sandbox Operator",
                        "role": "User",
                        "department": "Engineering",
                        "jobRole": "Software Engineer",
                        "monthlyIncome": 5000,
                        "yearsAtCompany": 1,
                        "workLifeBalance": 3,
                        "jobSatisfaction": 3,
                        "environmentSatisfaction": 3,
                        "overTime": "No",
                    }

        except Exception as jwt_err:
            return (
                jsonify({
                    "success": False,
                    "message": "Access token is invalid or expired. Please authenticate.",
                    "error": str(jwt_err)
                }),
                401,
            )

        return f(current_user, *args, **kwargs)

    return decorated
