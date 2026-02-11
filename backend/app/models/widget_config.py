import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import Base


class WidgetPosition(str, enum.Enum):
    bottom_right = "bottom-right"
    bottom_left = "bottom-left"


class WidgetConfig(Base):
    __tablename__ = "widget_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sites.id"), unique=True, nullable=False)
    position: Mapped[WidgetPosition] = mapped_column(Enum(WidgetPosition), default=WidgetPosition.bottom_right)
    primary_color: Mapped[str] = mapped_column(String(7), default="#6C5CE7")
    greeting_message: Mapped[str] = mapped_column(Text, default="Salom! Men sizga yordam bera olaman.")
    supported_languages: Mapped[list] = mapped_column(JSON, default=lambda: ["uz", "ru", "en"])
    voice_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    site = relationship("Site", back_populates="widget_config")
