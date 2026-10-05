# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Runtime (Python Backend + Built Frontend)
FROM python:3.11-slim
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend & Built Frontend
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY deliverables/ ./deliverables/
COPY README.md ./

# Environment configuration
ENV PYTHONPATH=/app
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

# Start FastAPI server
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
