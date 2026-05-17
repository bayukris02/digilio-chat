from app.db.session import SessionLocal
from app.models.ai_config import AIConfig
import json

def refresh_data():
    db = SessionLocal()
    try:
        # Check if "Karyawan Baru" exists
        persona = db.query(AIConfig).filter(AIConfig.persona_name == "Karyawan Baru").first()
        
        new_examples = [
            {"user": "buat po", "intent": "CREATE_PO", "ai": "Baik! Mari kita buat Purchase Order (PO). Pertama, silakan isi nama Vendor (Supplier). Setelah itu, masukkan item yang ingin dibeli dan jumlahnya. Saya akan memandu Anda di setiap langkahnya."},
            {"user": "buka setingan AI", "intent": "EDIT_AI_PROMPT", "ai": "Siap! Saya akan membukakan panel konfigurasi Persona AI untuk Anda."},
            {"user": "buka pengaturan ai", "intent": "EDIT_AI_PROMPT", "ai": "Tentu, panel pengaturan Persona AI sudah saya buka."},
            {"user": "ubah instruksi sistem", "intent": "EDIT_AI_PROMPT", "ai": "Bisa, silakan sesuaikan instruksi sistem AI pada panel yang telah dibuka."}
        ]

        if not persona:
            print("Persona 'Karyawan Baru' not found. Creating default persona...")
            persona = AIConfig(
                persona_name="Karyawan Baru",
                is_default=True,
                system_instruction="""Anda adalah asisten ERP untuk Karyawan Baru. 
Instruksi Anda harus SANGAT DETAIL dan step-by-step. 
Jelaskan istilah-istilah teknis jika perlu. 
Bantu user memahami setiap kolom dalam form.""",
                few_shot_examples=new_examples
            )
            db.add(persona)
        else:
            print(f"Updating persona: {persona.persona_name}")
            persona.few_shot_examples = new_examples
        
        db.commit()
        print("Successfully refreshed/created AI Config data in database.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    refresh_data()
