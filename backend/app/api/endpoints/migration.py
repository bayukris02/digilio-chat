from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.migration_service import migration_service
from app.models.blueprint import Blueprint
from typing import List, Dict, Any

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/migration/analyze")
async def analyze_migration(
    module_name: str, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch Blueprint
        blueprint = db.query(Blueprint).filter(Blueprint.module_name == module_name).first()
        if not blueprint:
            raise HTTPException(status_code=404, detail="Blueprint not found")
        
        # 2. Read CSV Content
        content = await file.read()
        csv_text = content.decode("utf-8")
        
        # 3. Analyze Mapping via AI
        mapping = await migration_service.analyze_csv_mapping(csv_text, blueprint.schema_json)
        
        return {
            "module_name": module_name,
            "csv_filename": file.filename,
            "suggested_mapping": mapping
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/migration/import")
async def import_data(
    module_name: str,
    data: List[Dict[str, Any]]
):
    """
    Placeholder for actual data import logic.
    In a real system, this would insert rows into the dynamic table for this module.
    """
    return {"message": f"Successfully imported {len(data)} rows into {module_name}."}
