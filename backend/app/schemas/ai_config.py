from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class AIConfigBase(BaseModel):
    persona_name: str
    system_instruction: str
    few_shot_examples: Optional[List[Dict[str, Any]]] = None
    is_default: bool = False

class AIConfigCreate(AIConfigBase):
    tenant_id: str = "client_demo_001"

class AIConfigUpdate(BaseModel):
    persona_name: Optional[str] = None
    system_instruction: Optional[str] = None
    few_shot_examples: Optional[List[Dict[str, Any]]] = None
    is_default: Optional[bool] = None

class AIConfigResponse(AIConfigBase):
    id: str
    tenant_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
