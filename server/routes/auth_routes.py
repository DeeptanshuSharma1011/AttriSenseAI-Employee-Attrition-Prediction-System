"""
AttriSense AI - Authentication Blueprint Routing
SPDX-License-Identifier: Apache-2.0
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.auth_controller import (
    signup_user,
    login_user,
    refresh_user_token,
    logout_user,
    get_user_profile,
    update_user_profile,
    change_user_password,
    forgot_password_request,
)
from middleware.auth_middleware import token_required

# Initialize Blueprint
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Route handler for operator registration."""
    data = request.get_json() or {}
    return signup_user(data)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Route handler for operator authentication."""
    data = request.get_json() or {}
    return login_user(data)


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Route handler for trading a valid refresh token for a new access token."""
    user_id = get_jwt_identity()
    return refresh_user_token(user_id)


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Route handler for operator logout."""
    return logout_user()


@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile(current_user):
    """Protected route returning the operator's factor settings profile."""
    return get_user_profile(current_user)


@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    """Protected route updating active employee/operator attributes."""
    data = request.get_json() or {}
    return update_user_profile(current_user, data)


@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password(current_user):
    """Protected route securely updating the operator's password."""
    data = request.get_json() or {}
    return change_user_password(current_user, data)


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Route handler for forgot password request dispatching."""
    data = request.get_json() or {}
    return forgot_password_request(data)
