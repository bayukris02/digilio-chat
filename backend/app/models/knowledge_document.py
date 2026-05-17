from sqlalchemy import Column, String, Text, JSON, Integer
from pgvector.sqlalchemy import Vector
from app.db.base_class import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    document_name = Column(String, index=True)
    content = Column(Text, nullable=False)
    # Using JSON for flexible metadata (source, page, author, etc.)
    metadata_json = Column(JSON, nullable=True)
    # 768 is a common dimension for BGE or Qwen-based embeddings
    # But we want flexibility, so we might need a way to handle different dimensions
    # For now, let's stick to 768 or 1024. Let's use 768 as default.
    embedding = Column(Vector(768)) 
