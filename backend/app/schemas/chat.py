from pydantic import BaseModel
from typing import Dict, Any, Optional

class ChatRequest(BaseModel):
    message: str
    persona_id: Optional[str] = None
    user_role: Optional[str] = "admin"
    allowed_modules: Optional[list[str]] = ["all"]

class ChatResponse(BaseModel):
    intent: str
    entities: Dict[str, Any]
    message: str
    thought_process: Optional[str] = None
