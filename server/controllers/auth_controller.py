"""
AttriSense AI - Authentication & Profile Controller
SPDX-License-Identifier: Apache-2.0
"""

import datetime
from flask import jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from models.user_model import UserModel

# Simple in-memory fallback helper if MongoDB connection is pending configuration
MOCK_MEM_DB = {
    "mle.architect@organization.com": {
        "id": "usr_sarah99",
        "email": "mle.architect@organization.com",
        "name": "Sarah Jenkins",
        "fullName": "Sarah Jenkins",
        "password": UserModel.hash_password("Temporary_123!"),
        "role": "Senior Director, People Analytics",
        "department": "Human Resources",
        "jobRole": "Manager",
        "monthlyIncome": 125000,
        "yearsAtCompany": 6,
        "workLifeBalance": 3,
        "jobSatisfaction": 4,
        "environmentSatisfaction": 3,
        "overTime": "No",
        "created_at": datetime.datetime.utcnow().isoformat(),
        "updated_at": datetime.datetime.utcnow().isoformat(),
    },
    "hr.analytics@organization.com": {
        "id": "usr_sarah99",
        "email": "hr.analytics@organization.com",
        "name": "Sarah Jenkins",
        "fullName": "Sarah Jenkins",
        "password": UserModel.hash_password("Temporary_123!"),
        "role": "Senior Director, People Analytics",
        "department": "Human Resources",
        "jobRole": "Manager",
        "monthlyIncome": 125000,
        "yearsAtCompany": 6,
        "workLifeBalance": 3,
        "jobSatisfaction": 4,
        "environmentSatisfaction": 3,
        "overTime": "No",
        "created_at": datetime.datetime.utcnow().isoformat(),
        "updated_at": datetime.datetime.utcnow().isoformat(),
    }
}


def generate_tokens(user_id: str):
    """Generates both access and refresh tokens for the given user identity."""
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)
    return access_token, refresh_token


def signup_user(data: dict):
    """Registers a new corporate operator profile."""
    email = data.get("email")
    full_name = data.get("fullName") or data.get("name")
    password = data.get("password")
    role = data.get("role", "User")

    if not email or not full_name or not password:
        return (
            jsonify({
                "success": False,
                "message": "Full Name, Email, and Password are required fields.",
                "error": "Missing Required Fields"
            }),
            400,
        )

    # Attempt to use MongoDB model
    try:
        existing_user = UserModel.find_by_email(email)
        if existing_user:
            return (
                jsonify({
                    "success": False,
                    "message": "An operator with this corporate email is already registered.",
                    "error": "Duplicate Entity"
                }),
                400,
            )

        # Build payload
        user_payload = {
            "email": email,
            "name": full_name,
            "fullName": full_name,
            "password": password,
            "role": role,
            "department": data.get("department", "Engineering"),
            "jobRole": data.get("jobRole", "Software Engineer"),
            "monthlyIncome": data.get("monthlyIncome", 50000),
            "yearsAtCompany": data.get("yearsAtCompany", 1),
            "workLifeBalance": data.get("workLifeBalance", 3),
            "jobSatisfaction": data.get("jobSatisfaction", 3),
            "environmentSatisfaction": data.get("environmentSatisfaction", 3),
            "overTime": data.get("overTime", "No"),
        }

        user_id = UserModel.create(user_payload)
        access_token, refresh_token = generate_tokens(user_id)
        
        return (
            jsonify({
                "success": True,
                "message": "Operator registered successfully.",
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "user": {
                    "id": user_id,
                    "email": email,
                    "fullName": full_name,
                    "name": full_name,
                    "role": role,
                }
            }),
            201,
        )

    except Exception as mongo_err:
        # Fallback local memory driver if MongoDB connection is in sandbox standby
        current_app.logger.warning(
            f"MongoDB standby. Using in-memory fallback driver for signup: {str(mongo_err)}"
        )
        normalized_email = email.strip().lower()
        if normalized_email in MOCK_MEM_DB:
            return (
                jsonify({
                    "success": False,
                    "message": "An operator with this email is already registered.",
                    "error": "Duplicate Entity"
                }),
                400,
            )

        mock_id = f"usr_{normalized_email.split('@')[0]}"
        hashed_password = UserModel.hash_password(password)
        now = datetime.datetime.utcnow().isoformat()
        
        user_record = {
            "id": mock_id,
            "email": normalized_email,
            "name": full_name,
            "fullName": full_name,
            "password": hashed_password,
            "role": role,
            "department": data.get("department", "Engineering"),
            "jobRole": data.get("jobRole", "Software Engineer"),
            "monthlyIncome": data.get("monthlyIncome", 50000),
            "yearsAtCompany": data.get("yearsAtCompany", 1),
            "workLifeBalance": data.get("workLifeBalance", 3),
            "jobSatisfaction": data.get("jobSatisfaction", 3),
            "environmentSatisfaction": data.get("environmentSatisfaction", 3),
            "overTime": data.get("overTime", "No"),
            "created_at": now,
            "updated_at": now,
        }
        MOCK_MEM_DB[normalized_email] = user_record

        access_token, refresh_token = generate_tokens(mock_id)
        return (
            jsonify({
                "success": True,
                "message": "Operator registered successfully (In-Memory Sandbox).",
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "user": {
                    "id": mock_id,
                    "email": normalized_email,
                    "fullName": full_name,
                    "name": full_name,
                    "role": role,
                }
            }),
            210,  # 210 custom fallback status code
        )


def login_user(data: dict):
    """Authenticates existing user and issues session access and refresh tokens."""
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return (
            jsonify({
                "success": False,
                "message": "Email and Password are required to authenticate.",
                "error": "Missing Credentials"
            }),
            400,
        )

    try:
        user = UserModel.find_by_email(email)
        if not user or not UserModel.verify_password(password, user.get("password", "")):
            return (
                jsonify({
                    "success": False,
                    "message": "Invalid email or password.",
                    "error": "Unauthorized Access"
                }),
                401,
            )

        user_id = str(user["_id"])
        access_token, refresh_token = generate_tokens(user_id)
        return (
            jsonify({
                "success": True,
                "message": "Authenticated successfully.",
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "user": {
                    "id": user_id,
                    "email": user["email"],
                    "fullName": user.get("fullName") or user.get("name"),
                    "name": user.get("name"),
                    "role": user.get("role", "User"),
                }
            }),
            200,
        )

    except Exception as mongo_err:
        current_app.logger.warning(f"MongoDB fallback active for login: {str(mongo_err)}")
        normalized_email = email.strip().lower()
        user = MOCK_MEM_DB.get(normalized_email)
        if not user or not UserModel.verify_password(password, user.get("password", "")):
            return (
                jsonify({
                    "success": False,
                    "message": "Invalid email or password. Try signing up first!",
                    "error": "Unauthorized Access"
                }),
                401,
            )

        access_token, refresh_token = generate_tokens(user["id"])
        return (
            jsonify({
                "success": True,
                "message": "Authenticated successfully (In-Memory Sandbox).",
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "fullName": user["fullName"],
                    "name": user["name"],
                    "role": user["role"],
                }
            }),
            200,
        )


def refresh_user_token(user_id: str):
    """Generates a new access token using a valid refresh token."""
    new_access_token = create_access_token(identity=user_id)
    return (
        jsonify({
            "success": True,
            "message": "Token refreshed successfully.",
            "accessToken": new_access_token
        }),
        200,
    )


def logout_user():
    """Logs out the user and clears any state (placeholder for stateless JWT blocklisting)."""
    return (
        jsonify({
            "success": True,
            "message": "Logged out successfully. Please clear client-side token headers."
        }),
        200,
    )


def get_user_profile(current_user: dict):
    """Retrieves full profile details for the authenticated user."""
    # Ensure current_user structure is clean
    profile_data = dict(current_user)
    profile_data.pop("password", None)
    return (
        jsonify({
            "success": True,
            "profile": profile_data
        }),
        200,
    )


def update_user_profile(current_user: dict, data: dict):
    """Updates organizational variables for prediction runs or profile name/role."""
    email = current_user.get("email")

    # Filter attributes we allow to edit
    updatable_fields = [
        "name",
        "fullName",
        "department",
        "jobRole",
        "monthlyIncome",
        "yearsAtCompany",
        "workLifeBalance",
        "jobSatisfaction",
        "environmentSatisfaction",
        "overTime",
    ]

    update_payload = {}
    for field in updatable_fields:
        if field in data:
            update_payload[field] = data[field]
            
    # Keep aliases synchronized
    if "fullName" in update_payload:
        update_payload["name"] = update_payload["fullName"]
    elif "name" in update_payload:
        update_payload["fullName"] = update_payload["name"]

    try:
        UserModel.update_by_id(current_user["id"], update_payload)
        updated_profile = UserModel.find_by_email(email)
        # Format output
        updated_profile["id"] = str(updated_profile.pop("_id"))
        updated_profile.pop("password", None)
        return (
            jsonify({
                "success": True,
                "message": "Employee attributes updated.",
                "profile": updated_profile
            }),
            200,
        )
    except Exception:
        # Fallback in-memory DB update
        normalized_email = email.strip().lower()
        user = MOCK_MEM_DB.get(normalized_email)
        if user:
            for field, val in update_payload.items():
                user[field] = val
            user["updated_at"] = datetime.datetime.utcnow().isoformat()
            MOCK_MEM_DB[normalized_email] = user
            
            clean_profile = dict(user)
            clean_profile.pop("password", None)
            return (
                jsonify({
                    "success": True,
                    "message": "Employee attributes updated (In-Memory Sandbox).",
                    "profile": clean_profile
                }),
                200,
            )

        return (
            jsonify({
                "success": False,
                "message": "Failed to locate active profile session to update.",
                "error": "Not Found"
            }),
            404,
        )


def change_user_password(current_user: dict, data: dict):
    """Securely updates the authenticated operator's password."""
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return (
            jsonify({
                "success": False,
                "message": "Old password and new password are required.",
                "error": "Missing Required Fields"
            }),
            400,
        )

    email = current_user.get("email")

    try:
        # Fetch user document with password field
        user = UserModel.find_by_email(email)
        if not user or not UserModel.verify_password(old_password, user.get("password", "")):
            return (
                jsonify({
                    "success": False,
                    "message": "Incorrect old password.",
                    "error": "Unauthorized Access"
                }),
                401,
            )

        # Hash and update password
        UserModel.update_by_id(str(user["_id"]), {"password": new_password})
        return (
            jsonify({
                "success": True,
                "message": "Password updated successfully."
            }),
            200,
        )

    except Exception:
        # Fallback memory DB
        normalized_email = email.strip().lower()
        user = MOCK_MEM_DB.get(normalized_email)
        if user and UserModel.verify_password(old_password, user.get("password", "")):
            user["password"] = UserModel.hash_password(new_password)
            user["updated_at"] = datetime.datetime.utcnow().isoformat()
            MOCK_MEM_DB[normalized_email] = user
            return (
                jsonify({
                    "success": True,
                    "message": "Password updated successfully (In-Memory Sandbox)."
                }),
                200,
            )

        return (
            jsonify({
                "success": False,
                "message": "Incorrect old password or session invalid.",
                "error": "Unauthorized Access"
            }),
            401,
        )


def forgot_password_request(data: dict):
    """Placeholder endpoint for forgot password trigger (returns instructions mock)."""
    email = data.get("email")
    if not email:
        return (
            jsonify({
                "success": False,
                "message": "Corporate email address is required.",
                "error": "Missing Required Fields"
            }),
            400,
        )

    # In production, this would trigger an email with a reset token valid for 1 hour.
    return (
        jsonify({
            "success": True,
            "message": f"If an operator account exists for {email}, a password reset link has been dispatched.",
            "placeholder_info": "Enterprise forgot-password dispatcher is currently configured in mockup placeholder mode."
        }),
        200,
    )
