from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class POBase(BaseModel):
    vendor_name: Optional[str] = None
    item_name: Optional[str] = None
    quantity: Optional[float] = 0
    price: Optional[float] = 0
    notes: Optional[str] = None

class POCreate(POBase):
    tenant_id: str
    created_by: str
    user_role: Optional[str] = "admin"
    user_command: Optional[str] = None # Capture the AI command for auditing

class POUpdate(POBase):
    status: Optional[str] = None

class POResponse(POBase):
    id: str
    tenant_id: str
    created_by: str
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
