import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import Base


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pages.id"), nullable=False)
    section_id: Mapped[str] = mapped_column(String(255), nullable=False)
    heading: Mapped[str] = mapped_column(String(500), nullable=False)
    content_summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content_raw: Mapped[str] = mapped_column(Text, nullable=False, default="")
    order: Mapped[int] = mapped_column(Integer, default=0)

    page = relationship("Page", back_populates="sections")
