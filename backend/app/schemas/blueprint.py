from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class BlueprintBase(BaseModel):
    tenant_id: str
    module_name: str
    schema_json: Dict[str, Any]

class BlueprintCreate(BlueprintBase):
    pass

class BlueprintUpdate(BaseModel):
    schema_json: Optional[Dict[str, Any]] = None

class BlueprintResponse(BlueprintBase):
    id: int

    class Config:
        from_attributes = True
