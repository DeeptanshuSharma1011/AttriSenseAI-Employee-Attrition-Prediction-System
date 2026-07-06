# ==========================================
# Stage 1: Build the React client
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy root configurations and client sources
COPY package.json package-lock.json tsconfig.json vite.config.ts ./
COPY client/ ./client/

# Install Node dependencies and compile the frontend
RUN npm ci
RUN npm run build

# ==========================================
# Stage 2: Serve via Python Flask backend
# ==========================================
FROM python:3.10-slim AS backend-server
WORKDIR /app

# Install system dependencies (including libgomp1 which is required for XGBoost)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy python backend requirements
COPY server/requirements.txt ./server/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r server/requirements.txt

# Copy server, ml pipeline, and dataset folders
COPY server/ ./server/
COPY ml/ ./ml/
COPY datasets/ ./datasets/
COPY run_pipeline_test.py ./

# Copy built frontend assets from Stage 1 to the exact expected location relative to the Flask server
COPY --from=frontend-builder /app/dist ./client/dist

# Expose standard port (Render dynamically provides PORT env variable)
EXPOSE 10000

# Set production environment flags
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Start the application using gunicorn, respecting the PORT environment variable provided by Render
WORKDIR /app/server
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} 'app:create_app()'"]
