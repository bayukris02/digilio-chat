from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from app.db.session import SessionLocal
from app.models.ai_config import AIConfig
from app.schemas.ai_config import AIConfigCreate, AIConfigUpdate, AIConfigResponse

router = APIRouter()
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/personas", response_model=List[AIConfigResponse])
def get_personas(db: Session = Depends(get_db)):
    personas = db.query(AIConfig).all()
    
    # Seed default personas if none exist
    if not personas:
        default_personas = [
            AIConfig(
                persona_name="Karyawan Baru",
                is_default=True,
                system_instruction="""Anda adalah asisten ERP untuk Karyawan Baru. 
Instruksi Anda harus SANGAT DETAIL dan step-by-step. 
Jelaskan istilah-istilah teknis jika perlu. 
Bantu user memahami setiap kolom dalam form.""",
                few_shot_examples=[
                    {"user": "buat po", "intent": "CREATE_PO", "ai": "Baik! Mari kita buat Purchase Order (PO). Pertama, silakan isi nama Vendor (Supplier). Setelah itu, masukkan item yang ingin dibeli dan jumlahnya. Saya akan memandu Anda di setiap langkahnya."},
                    {"user": "buka setingan AI", "intent": "EDIT_AI_PROMPT", "ai": "Siap! Saya akan membukakan panel konfigurasi Persona AI untuk Anda."},
                    {"user": "buka pengaturan ai", "intent": "EDIT_AI_PROMPT", "ai": "Tentu, panel pengaturan Persona AI sudah saya buka."},
                    {"user": "ubah instruksi sistem", "intent": "EDIT_AI_PROMPT", "ai": "Bisa, silakan sesuaikan instruksi sistem AI pada panel yang telah dibuka."}
                ]
            ),
            AIConfig(
                persona_name="Karyawan Senior",
                is_default=False,
                system_instruction="""Anda adalah asisten ERP untuk Karyawan Senior. 
Berikan respon yang SINGKAT, padat, dan langsung ke poin utama. 
Tidak perlu penjelasan mendetail kecuali diminta.""",
                few_shot_examples=[
                    {"user": "buat po", "ai": "Siap. Draft PO dibuka. Silakan isi detailnya."}
                ]
            )
        ]
        for p in default_personas:
            db.add(p)
        db.commit()
        personas = db.query(AIConfig).all()
        
    return personas

@router.post("/personas", response_model=AIConfigResponse)
def create_persona(persona_in: AIConfigCreate, db: Session = Depends(get_db)):
    db_persona = AIConfig(**persona_in.dict())
    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)
    return db_persona

@router.put("/personas/{persona_id}", response_model=AIConfigResponse)
def update_persona(persona_id: str, persona_in: AIConfigUpdate, db: Session = Depends(get_db)):
    db_persona = db.query(AIConfig).filter(AIConfig.id == persona_id).first()
    if not db_persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    
    update_data = persona_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_persona, field, value)
    
    db.commit()
    db.refresh(db_persona)
    return db_persona
