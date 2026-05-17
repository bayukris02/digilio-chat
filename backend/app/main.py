from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import chat, purchase_orders, ai_config, knowledge, blueprints, onboarding, migration
from sqlalchemy import text
from app.db.base_class import Base
from app.db.session import engine

# Initialize database components
with engine.connect() as conn:
    # Activate pgvector extension
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    conn.commit()

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digilio AI-Agentic ERP API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:9090"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(purchase_orders.router, prefix="/api", tags=["Purchase Orders"])
app.include_router(ai_config.router, prefix="/api", tags=["AI Configuration"])
app.include_router(knowledge.router, prefix="/api", tags=["Knowledge & OCR"])
app.include_router(blueprints.router, prefix="/api", tags=["Blueprints"])
app.include_router(onboarding.router, prefix="/api", tags=["Onboarding"])
app.include_router(migration.router, prefix="/api", tags=["Data Migration"])

@app.get("/")
async def root():
    return {"message": "Welcome to Digilio AI-Agentic ERP API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
