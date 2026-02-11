from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CrawlTriggerResponse(BaseModel):
    site_id: UUID
    status: str
    message: str


class CrawlStatusResponse(BaseModel):
    site_id: UUID
    status: str
    pages_crawled: int = 0
    total_pages: int = 0
    started_at: datetime | None = None
