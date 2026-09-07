from fastapi import FastAPI

from app.database.mongodb import test_connection, db, client
from app.models.stock import save_stock_snapshot
from app.schemas.stock import StockSnapshot
from app.api.routes.upload import router as upload_router
from app.api.routes.stocks import router as stocks_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.admin_stocks import router as admin_stocks_router
from app.api.routes.user_stocks import router as user_stocks_router
from app.api.routes.analysis import router as analysis_router


app = FastAPI(
    title="Stock Analysis API",
    description="Stock screenshot extraction and analysis backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")
app.include_router(stocks_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_stocks_router, prefix="/api")
app.include_router(user_stocks_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Stock Analysis API is running"
    }


@app.get("/health")
def health():
    mongodb_status = test_connection()

    return {
        "api": "running",
        "mongodb": "connected" if mongodb_status else "disconnected"
    }


@app.post("/stocks")
def create_stock(stock: StockSnapshot):
    stock_id = save_stock_snapshot(stock.model_dump())

    return {
        "message": "Stock data saved successfully",
        "id": stock_id
    }


@app.get("/debug/mongodb")
def debug_mongodb():
    return {
        "database": db.name,
        "collections": db.list_collection_names(),
        "server": str(client.address)
    }