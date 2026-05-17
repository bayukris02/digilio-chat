import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base_class import Base

class AIConfig(Base):
    __tablename__ = "ai_configs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, default="client_demo_001")
    
    persona_name = Column(String, nullable=False) # e.g., "Karyawan Baru", "Karyawan Senior"
    system_instruction = Column(Text, nullable=False)
    few_shot_examples = Column(JSON, nullable=True) # List of dictionaries: [{"user": "...", "ai": "..."}]
    
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
