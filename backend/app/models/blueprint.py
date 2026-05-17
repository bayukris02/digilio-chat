from sqlalchemy import Column, String, JSON, Integer
from app.db.base_class import Base

class Blueprint(Base):
    __tablename__ = "blueprints"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)
    module_name = Column(String, index=True, unique=True) # e.g., 'purchase_order', 'invoice'
    # schema_json stores the FormSchema structure
    schema_json = Column(JSON, nullable=False)
