import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.db.base_class import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, nullable=False) # Foundation for Multi-Tenancy
    created_by = Column(String, index=True, nullable=False) # Foundation for RBAC
    
    vendor_name = Column(String, index=True)
    item_name = Column(String)
    quantity = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    notes = Column(Text)
    status = Column(String, default="DRAFT") # e.g. DRAFT, SUBMITTED, APPROVED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
