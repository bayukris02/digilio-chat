from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.onboarding_service import onboarding_service
from app.models.blueprint import Blueprint
from pydantic import BaseModel

router = APIRouter()

class OnboardingRequest(BaseModel):
    business_need: str
    tenant_id: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/onboarding/generate")
async def generate_onboarding_blueprint(request: OnboardingRequest, db: Session = Depends(get_db)):
    try:
        schema = await onboarding_service.generate_blueprint(request.business_need)
        
        # Save to DB as a draft or final blueprint
        db_blueprint = Blueprint(
            tenant_id=request.tenant_id,
            module_name=schema["id"],
            schema_json=schema
        )
        
        # Check if exists, if so update, else add
        existing = db.query(Blueprint).filter(Blueprint.module_name == schema["id"]).first()
        if existing:
            existing.schema_json = schema
            db.commit()
            return existing
        
        db.add(db_blueprint)
        db.commit()
        db.refresh(db_blueprint)
        return db_blueprint
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
