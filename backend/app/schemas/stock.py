from pydantic import BaseModel, Field
from typing import Optional


class StockSnapshot(BaseModel):
    ticker: str = Field(..., min_length=1)
    price: float
    change: float
    change_percent: float
    volume_change_percent: Optional[float] = None
    trading_date: str