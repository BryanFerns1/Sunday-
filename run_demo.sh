#!/usr/bin/env bash
# ==============================================================================
# Sunday — Automated Launch Script (Sunday)
# ==============================================================================

set -e

echo "=========================================================================="
echo "      Sunday — Intelligent Content Transformation Engine"
echo "        the Organisation // Sunday"
echo "=========================================================================="
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 1. Check Python virtual environment
if [ ! -d "backend/venv" ]; then
    echo "[+] Initializing Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Check Frontend node modules
if [ ! -d "frontend/node_modules" ]; then
    echo "[+] Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "[+] Starting FastAPI Backend server on port 8000..."
PYTHONPATH=. ./backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "[+] Starting React / Vite Frontend Studio on port 3000..."
cd frontend
npm run dev -- --port 3000 --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================================================="
echo "  🚀 Platform is now running & accessible at:"
echo "     👉 Frontend Dashboard:  http://localhost:3000"
echo "     👉 Backend API Docs:    http://localhost:8000/docs"
echo "=========================================================================="
echo "Press [CTRL+C] to stop all services."

cleanup() {
    echo ""
    echo "[*] Stopping SUNDAY Sunday services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
