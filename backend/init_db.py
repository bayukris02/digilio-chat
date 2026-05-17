from app.db.session import engine
from app.db.base_class import Base
# Explicitly import all models to ensure they are registered with Base.metadata
from app.models.ai_config import AIConfig
from app.models.blueprint import Blueprint
from app.models.knowledge_document import KnowledgeDocument
from app.models.purchase_order import PurchaseOrder
from app.models.audit_log import AuditLog
from sqlalchemy import text

def init_db():
    print("Initializing database...")
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()
