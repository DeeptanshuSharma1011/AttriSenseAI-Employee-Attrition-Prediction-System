"""
AttriSense AI - MongoDB User Model
SPDX-License-Identifier: Apache-2.0
"""

import datetime
import bcrypt
from bson import ObjectId
from database.mongo import get_db


class UserModel:
    """Encapsulates MongoDB data operations for administrator and employee profiles."""

    @staticmethod
    def get_collection():
        """Helper to retrieve the MongoDB 'users' collection reference."""
        return get_db()["users"]

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes a password string using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verifies a plain password against its bcrypt hash."""
        try:
            return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def find_by_email(email: str):
        """Retrieves a single operator document matching the given email."""
        try:
            col = UserModel.get_collection()
            return col.find_one({"email": email.strip().lower()})
        except Exception:
            # Propagate up to controller to handle standby sandbox fallbacks
            raise RuntimeError("Database connection standby.")

    @staticmethod
    def get_by_id(user_id: str):
        """Retrieves an operator document using its unique MongoDB ObjectId."""
        try:
            col = UserModel.get_collection()
            return col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            raise RuntimeError("Database connection standby.")

    @staticmethod
    def create(user_data: dict) -> str:
        """Registers and persists a new operator document in the database."""
        try:
            col = UserModel.get_collection()
            
            # Ensure timestamps
            now = datetime.datetime.utcnow().isoformat()
            user_data["created_at"] = now
            user_data["updated_at"] = now
            
            # Hash password if plain text is provided
            if "password" in user_data:
                user_data["password"] = UserModel.hash_password(user_data["password"])
                
            # Normalize email
            if "email" in user_data:
                user_data["email"] = user_data["email"].strip().lower()

            result = col.insert_one(user_data)
            return str(result.inserted_id)
        except Exception as e:
            raise RuntimeError(f"Database connection standby: {str(e)}")

    @staticmethod
    def update_by_id(user_id: str, update_fields: dict) -> bool:
        """Updates targeted fields in an existing operator document."""
        try:
            col = UserModel.get_collection()
            update_fields["updated_at"] = datetime.datetime.utcnow().isoformat()
            
            # Hash password if updated
            if "password" in update_fields:
                update_fields["password"] = UserModel.hash_password(update_fields["password"])

            col.update_one(
                {"_id": ObjectId(user_id)}, {"$set": update_fields}
            )
            return True
        except Exception:
            raise RuntimeError("Database connection standby.")


# Legacy compatibility alias
ClassUserModel = UserModel
