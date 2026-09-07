from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.mongodb import (
    client,
    db,
    initialize_database,
    test_connection,
)

from app.api.routes.upload import router as upload_router
from app.api.routes.stocks import router as stocks_router
from app.api.routes.auth import router as auth_router
from app.api.routes.admin_stocks import router as admin_stocks_router
from app.api.routes.user_stocks import router as user_stocks_router
from app.api.routes.admin_reports import router as admin_reports_router
from app.api.routes.analysis import router as analysis_router


# ============================================================
# Application Lifecycle
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.

    Startup:
        - Verify MongoDB connection
        - Create required collections/indexes

    Shutdown:
        - Close MongoDB connection
    """

    print("Starting Stock Analysis API...")

    # --------------------------------------------------------
    # Verify MongoDB
    # --------------------------------------------------------

    if not test_connection():
        raise RuntimeError(
            "MongoDB connection failed. "
            "Application startup aborted."
        )

    # --------------------------------------------------------
    # Initialize database infrastructure
    # --------------------------------------------------------

    initialize_database()

    print(
        "Database initialization completed."
    )

    yield

    # --------------------------------------------------------
    # Shutdown
    # --------------------------------------------------------

    print(
        "Closing MongoDB connection..."
    )

    client.close()

    print(
        "MongoDB connection closed."
    )


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="Stock Analysis API",
    description=(
        "Stock market analysis and real-time "
        "market data backend"
    ),
    version="2.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API Routes
# ============================================================

app.include_router(
    upload_router,
    prefix="/api",
)

app.include_router(
    stocks_router,
    prefix="/api",
)


app.include_router(
    auth_router,
    prefix="/api",
)

app.include_router(
    admin_stocks_router,
    prefix="/api",
)

app.include_router(
    admin_reports_router,
    prefix="/api",
)

app.include_router(
    user_stocks_router,
    prefix="/api",
)

app.include_router(
    analysis_router,
    prefix="/api",
)


# ============================================================
# Root
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Stock Analysis API is running",
        "version": "2.0.0",
    }


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health():
    mongodb_status = test_connection()

    return {
        "api": "running",
        "mongodb": (
            "connected"
            if mongodb_status
            else "disconnected"
        ),
    }


# ============================================================
# MongoDB Debug Endpoint
# ============================================================

@app.get("/debug/mongodb")
def debug_mongodb():
    return {
        "database": db.name,
        "collections": db.list_collection_names(),
        "server": str(client.address),
    }