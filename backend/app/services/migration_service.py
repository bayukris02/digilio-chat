import json
import logging
import csv
import io
from typing import Dict, Any, List
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate

logger = logging.getLogger(__name__)

class MigrationService:
    def __init__(self):
        self.llm = Ollama(
            base_url="http://localhost:11434",
            model="qwen2.5:7b",
            temperature=0
        )

    async def analyze_csv_mapping(self, csv_content: str, target_schema: Dict[str, Any]) -> List[Dict[str, str]]:
        """AI-powered mapping between CSV headers and Blueprint fields"""
        # 1. Extract CSV Headers
        f = io.StringIO(csv_content)
        reader = csv.reader(f)
        headers = next(reader, [])
        
        # 2. Extract Blueprint Fields
        blueprint_fields = [
            {"name": f["name"], "label": f["label"]} 
            for f in target_schema.get("fields", [])
        ]

        # 3. Prompt AI to Map
        prompt_template = PromptTemplate(
            template="""
            Tugas Anda adalah memetakan kolom dari file CSV (data lama) ke field di sistem ERP baru (Blueprint).
            
            KOLOM CSV LAMA: {headers}
            FIELD SISTEM BARU: {blueprint_fields}
            
            HASIL YANG DIHARAPKAN (JSON ARRAY):
            [
                {{ "csv_column": "Nama Vendor", "blueprint_field": "vendor_name" }},
                ...
            ]
            
            Hasilkan HANYA JSON array tanpa penjelasan tambahan.
            """,
            input_variables=["headers", "blueprint_fields"]
        )

        _input = prompt_template.format(
            headers=str(headers), 
            blueprint_fields=str(blueprint_fields)
        )
        
        output = self.llm.invoke(_input)
        
        try:
            clean_output = output.strip().replace("```json", "").replace("```", "")
            mapping = json.loads(clean_output)
            return mapping
        except Exception as e:
            logger.error(f"Failed to parse AI Mapping: {e}")
            # Fallback: empty mapping
            return []

migration_service = MigrationService()
