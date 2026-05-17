import json
import logging
from typing import Dict, Any
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_classic.output_parsers import ResponseSchema, StructuredOutputParser
from pydantic import ValidationError
from app.db.session import SessionLocal
from app.models.ai_config import AIConfig
from app.schemas.purchase_order import POBase
from app.services.rag_service import rag_service

# Mapping intent to Pydantic models for Gatekeeper validation
INTENT_VALIDATORS = {
    "CREATE_PO": POBase,
}

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        # Using Qwen 2.5 1.5B for faster inference on CPU-only VPS
        self.llm = Ollama(
            base_url="http://localhost:11434",
            model="qwen2.5:1.5b",
            temperature=0
        )
        
        # Define schemas for structured output
        response_schemas = [
            ResponseSchema(name="intent", description="The identified intent of the user (e.g., GREETING, CREATE_PO, VIEW_REPORT, CONFIRM_SAVE, SYSTEM_EVENT, UNKNOWN)"),
            ResponseSchema(name="entities", description="A dictionary of extracted entities like vendor_name, item_name, quantity, etc."),
            ResponseSchema(name="message", description="A natural language response to the user in Indonesian.")
        ]
        self.output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
        self.format_instructions = self.output_parser.get_format_instructions()

    async def stream_message(self, user_input: str, persona_id: str = None, user_role: str = "admin", allowed_modules: list = ["all"]):
        try:
            db = SessionLocal()
            try:
                if persona_id:
                    persona = db.query(AIConfig).filter(AIConfig.id == persona_id).first()
                else:
                    persona = db.query(AIConfig).filter(AIConfig.is_default == True).first()
                
                if not persona:
                    system_instruction = "Anda asisten ERP Digilio ringkas."
                    examples_text = ""
                else:
                    system_instruction = persona.system_instruction
                    examples = persona.few_shot_examples or []
                    examples_text = "\nCONTOH:\n"
                    for ex in examples[:1]:
                        examples_text += f"User: {ex['user']} -> AI: {ex['ai']}\n"
                
                knowledge_context = rag_service.query_context(db, user_input)
            finally:
                db.close()

            prompt = f"""
            {system_instruction}
            ROLE: {user_role} | MODULES: {', '.join(allowed_modules)}
            KONTEKS: {knowledge_context}
            {examples_text}
            
            IDENTIFIKASI:
            - intent (GREETING, CREATE_PO, VIEW_REPORT, EDIT_AI_PROMPT, UNKNOWN)
            - entities (json object)
            - message (jawaban langsung Bahasa Indonesia)

            {self.format_instructions}
            
            INPUT: {user_input}
            """
            
            # Use stream for immediate feedback
            full_response = ""
            for chunk in self.llm.stream(prompt):
                full_response += chunk
                yield chunk

        except Exception as e:
            logger.error(f"Error in stream_message: {e}")
            yield f"Error: {str(e)}"

    async def process_message(self, user_input: str, persona_id: str = None, user_role: str = "admin", allowed_modules: list = ["all"]) -> Dict[str, Any]:
        try:
            # 1. Fetch Persona & Knowledge from DB
            db = SessionLocal()
            try:
                if persona_id:
                    persona = db.query(AIConfig).filter(AIConfig.id == persona_id).first()
                else:
                    persona = db.query(AIConfig).filter(AIConfig.is_default == True).first()
                
                if not persona:
                    system_instruction = "Anda asisten ERP Digilio yang ringkas."
                    examples_text = ""
                else:
                    system_instruction = persona.system_instruction
                    examples = persona.few_shot_examples or []
                    examples_text = "\nCONTOH:\n"
                    for ex in examples[:2]: # Limit examples to reduce prompt size
                        examples_text += f"User: {ex['user']} -> AI: {ex['ai']}\n"
                
                knowledge_context = rag_service.query_context(db, user_input)
            finally:
                db.close()

            # 2. Construct Optimized Prompt
            prompt = f"""
            {system_instruction}
            ROLE: {user_role} | MODULES: {', '.join(allowed_modules)}
            KONTEKS: {knowledge_context}
            {examples_text}
            
            IDENTIFIKASI:
            - intent (GREETING, CREATE_PO, VIEW_REPORT, EDIT_AI_PROMPT, UNKNOWN)
            - entities (json object)
            - message (jawaban langsung Bahasa Indonesia)

            {self.format_instructions}
            
            INPUT: {user_input}
            """
            
            logger.debug(f"PROMPT SIZE: {len(prompt)}")
            
            output = self.llm.invoke(prompt)
            parsed_output = self.output_parser.parse(output)
            return parsed_output

        except Exception as e:
            logger.error(f"Error processing NLP message: {e}", exc_info=True)
            return {
                "intent": "UNKNOWN",
                "entities": {},
                "message": f"Maaf, saya sedang kesulitan memproses perintah tersebut. (Error: {str(e)})"
            }

nlp_service = NLPService()
