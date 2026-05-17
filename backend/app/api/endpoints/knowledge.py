from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.rag_service import rag_service
from app.services.ocr_service import ocr_service
from app.services.nlp_service import nlp_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        text_content = content.decode("utf-8") # Assume text for now, can add pdfplumber later
        await rag_service.ingest_text(db, text_content, file.filename)
        return {"message": f"Successfully ingested {file.filename} into knowledge base."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ocr/process")
async def process_ocr(file: UploadFile = File(...), user_role: str = "admin"):
    """OCR -> Text -> NLP Intent Extraction"""
    try:
        content = await file.read()
        # 1. Extract Text via OCR
        raw_text = await ocr_service.process_file(content, file.filename)
        
        # 2. Feed to NLP to extract entities
        # We wrap the OCR text with a command instruction
        ai_command = f"Analisis teks hasil OCR berikut dan bantu saya mengisinya ke dalam sistem:\n\n{raw_text}"
        nlp_result = await nlp_service.process_message(ai_command, user_role=user_role)
        
        return {
            "raw_text": raw_text,
            "nlp_analysis": nlp_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
