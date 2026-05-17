import json
import logging
from typing import Dict, Any
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate

logger = logging.getLogger(__name__)

class OnboardingService:
    def __init__(self):
        self.llm = Ollama(
            base_url="http://localhost:11434",
            model="qwen2.5:7b",
            temperature=0
        )

    async def generate_blueprint(self, business_need: str) -> Dict[str, Any]:
        """Generate a JSON FormSchema based on business needs description"""
        prompt_template = PromptTemplate(
            template="""
            Anda adalah ERP Architect Senior. Tugas Anda adalah merancang struktur Form (JSON Blueprint) berdasarkan kebutuhan bisnis user.
            
            FORMAT JSON YANG DIHARAPKAN:
            {{
                "id": "string_kecil_dengan_underscore",
                "title": "Nama Form yang Manusiawi",
                "fields": [
                    {{
                        "name": "nama_field",
                        "label": "Label Field",
                        "type": "text | number | date | select",
                        "placeholder": "hint",
                        "required": true | false
                    }}
                ]
            }}

            Kebutuhan Bisnis User: "{business_need}"
            
            Hasilkan HANYA JSON mentah tanpa penjelasan tambahan.
            """,
            input_variables=["business_need"]
        )

        _input = prompt_template.format(business_need=business_need)
        output = self.llm.invoke(_input)
        
        try:
            # Clean output in case LLM adds markdown backticks
            clean_output = output.strip().replace("```json", "").replace("```", "")
            blueprint = json.loads(clean_output)
            return blueprint
        except Exception as e:
            logger.error(f"Failed to parse AI Blueprint: {e}")
            raise Exception("AI gagal merancang blueprint. Silakan coba deskripsi yang lebih spesifik.")

onboarding_service = OnboardingService()
