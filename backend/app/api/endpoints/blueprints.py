from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.models.blueprint import Blueprint
from app.schemas.blueprint import BlueprintCreate, BlueprintResponse, BlueprintUpdate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/blueprints", response_model=BlueprintResponse)
def create_blueprint(blueprint_in: BlueprintCreate, db: Session = Depends(get_db)):
    db_blueprint = Blueprint(**blueprint_in.dict())
    db.add(db_blueprint)
    db.commit()
    db.refresh(db_blueprint)
    return db_blueprint

@router.get("/blueprints/{module_name}", response_model=BlueprintResponse)
def get_blueprint(module_name: str, db: Session = Depends(get_db)):
    blueprint = db.query(Blueprint).filter(Blueprint.module_name == module_name).first()
    if not blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return blueprint

@router.get("/blueprints", response_model=List[BlueprintResponse])
def list_blueprints(tenant_id: str, db: Session = Depends(get_db)):
    return db.query(Blueprint).filter(Blueprint.tenant_id == tenant_id).all()

@router.put("/blueprints/{module_name}", response_model=BlueprintResponse)
def update_blueprint(module_name: str, blueprint_in: BlueprintUpdate, db: Session = Depends(get_db)):
    db_blueprint = db.query(Blueprint).filter(Blueprint.module_name == module_name).first()
    if not db_blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    
    if blueprint_in.schema_json:
        db_blueprint.schema_json = blueprint_in.schema_json
    
    db.commit()
    db.refresh(db_blueprint)
    return db_blueprint
