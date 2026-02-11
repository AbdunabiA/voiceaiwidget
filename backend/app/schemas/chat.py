from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    language: str = "auto"
    current_url: str = "/"


class ChatAction(BaseModel):
    type: str
    params: dict


class ChatResponse(BaseModel):
    text: str
    audio: str = ""
    audio_format: str = "audio/mp3"
    actions: list[ChatAction] = []
    language: str
