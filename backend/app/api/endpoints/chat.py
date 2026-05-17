from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.nlp_service import nlp_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await nlp_service.process_message(
            request.message, 
            persona_id=request.persona_id,
            user_role=request.user_role,
            allowed_modules=request.allowed_modules
        )
        return ChatResponse(
            intent=result.get("intent", "UNKNOWN"),
            entities=result.get("entities", {}),
            message=result.get("message", "I couldn't understand that.")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        nlp_service.stream_message(
            request.message,
            persona_id=request.persona_id,
            user_role=request.user_role,
            allowed_modules=request.allowed_modules
        ),
        media_type="text/event-stream"
    )
