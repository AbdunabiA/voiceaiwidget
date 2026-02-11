import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import Base


class CrawlStatus(str, enum.Enum):
    pending = "pending"
    crawling = "crawling"
    completed = "completed"
    failed = "failed"


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    api_key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    allowed_origins: Mapped[list] = mapped_column(JSON, default=list)
    crawl_status: Mapped[CrawlStatus] = mapped_column(Enum(CrawlStatus), default=CrawlStatus.pending)
    last_crawled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sites")
    pages = relationship("Page", back_populates="site", cascade="all, delete-orphan")
    widget_config = relationship("WidgetConfig", back_populates="site", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="site", cascade="all, delete-orphan")
