from uuid import UUID

from pydantic import BaseModel, Field


class WidgetConfigResponse(BaseModel):
    id: UUID
    site_id: UUID
    position: str
    primary_color: str
    greeting_message: str
    supported_languages: list[str]
    voice_enabled: bool
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class WidgetConfigUpdate(BaseModel):
    position: str | None = None
    primary_color: str | None = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    greeting_message: str | None = None
    supported_languages: list[str] | None = None
    voice_enabled: bool | None = None
    avatar_url: str | None = None
