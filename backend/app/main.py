import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.config import settings
from backend.app.api.routes_ingest import router as ingest_router
from backend.app.api.routes_transform import router as transform_router
from backend.app.api.routes_export import router as export_router
from backend.app.api.routes_system import router as system_router, status_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers (supporting /api and /api/v1)
prefixes = list(dict.fromkeys([settings.API_V1_PREFIX, "/api/v1", "/api"]))
for pfx in prefixes:
    if pfx:
        app.include_router(ingest_router, prefix=pfx)
        app.include_router(transform_router, prefix=pfx)
        app.include_router(export_router, prefix=pfx)
        app.include_router(system_router, prefix=pfx)
        app.include_router(status_router, prefix=pfx)

# Serve Built Frontend SPA (dist) if available
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes and docs to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root_endpoint():
        return {
            "project": settings.PROJECT_NAME,
            "organization": settings.ORGANIZATION,
            "problem_statement": f"ID {settings.PROBLEM_ID} - Gen AI Platform for Automated Content Transformation",
            "version": settings.VERSION,
            "status": "OPERATIONAL",
            "api_documentation": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
