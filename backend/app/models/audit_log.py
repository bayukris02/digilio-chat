import uuid
from sqlalchemy import Column, String, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.db.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    
    action = Column(String) # e.g. CREATE, UPDATE, DELETE
    entity_type = Column(String) # e.g. PURCHASE_ORDER
    entity_id = Column(String)
    
    # Store AI interaction context
    changes = Column(JSON) # e.g. { "field": "vendor_name", "from": null, "to": "Toko Jaya", "ai_filled": true }
    user_command = Column(Text) # The actual chat command that triggered this
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
