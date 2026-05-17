import os
import logging
from typing import List, Optional
from langchain_ollama import OllamaEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.knowledge_document import KnowledgeDocument

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.default_model_type = os.getenv("EMBEDDING_MODEL_TYPE", "huggingface") # huggingface | ollama
        self.model_name = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-mpnet-base-v2") # Dimension 768
        
    def get_embeddings(self, model_type: Optional[str] = None, model_name: Optional[str] = None) -> Embeddings:
        """Dynamic Embedding Factory"""
        m_type = model_type or self.default_model_type
        m_name = model_name or self.model_name
        
        if m_type == "ollama":
            return OllamaEmbeddings(
                base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                model=m_name
            )
        else: # Default to HuggingFace
            return HuggingFaceEmbeddings(model_name=m_name)

    async def ingest_text(self, db: Session, text_content: str, document_name: str, metadata: dict = None):
        """Split text into chunks and store in pgvector"""
        # For MVP, simple splitting. In production, use RecursiveCharacterTextSplitter.
        chunks = self._simple_split(text_content, chunk_size=1000, chunk_overlap=100)
        
        embeddings_model = self.get_embeddings()
        
        for chunk in chunks:
            vector = embeddings_model.embed_query(chunk)
            
            db_doc = KnowledgeDocument(
                document_name=document_name,
                content=chunk,
                metadata_json=metadata,
                embedding=vector
            )
            db.add(db_doc)
        
        db.commit()

    def query_context(self, db: Session, query: str, limit: int = 3) -> str:
        """Search for relevant context in pgvector"""
        embeddings_model = self.get_embeddings()
        query_vector = embeddings_model.embed_query(query)
        
        # Use cosine distance (<=>) or L2 distance (<->) for similarity search
        # pgvector supports both. Cosine similarity is usually better for embeddings.
        results = db.query(KnowledgeDocument).order_by(
            KnowledgeDocument.embedding.cosine_distance(query_vector)
        ).limit(limit).all()
        
        context = "\n\n".join([doc.content for doc in results])
        return context

    def _simple_split(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Simple text splitting logic"""
        chunks = []
        for i in range(0, len(text), chunk_size - chunk_overlap):
            chunks.append(text[i:i + chunk_size])
        return chunks

rag_service = RAGService()
