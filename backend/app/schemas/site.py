from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SiteCreate(BaseModel):
    url: str = Field(..., min_length=5, max_length=500)
    name: str = Field(..., min_length=1, max_length=255)


class SectionResponse(BaseModel):
    id: UUID
    section_id: str
    heading: str
    content_summary: str
    content_raw: str
    order: int

    model_config = {"from_attributes": True}


class SectionUpdate(BaseModel):
    heading: str | None = None
    content_summary: str | None = None
    section_id: str | None = None


class PageResponse(BaseModel):
    id: UUID
    url: str
    title: str
    meta_description: str | None = None
    crawled_at: datetime
    sections: list[SectionResponse] = []

    model_config = {"from_attributes": True}


class SiteResponse(BaseModel):
    id: UUID
    url: str
    name: str
    api_key: str
    crawl_status: str
    created_at: datetime
    last_crawled_at: datetime | None = None

    model_config = {"from_attributes": True}


class SiteMapResponse(BaseModel):
    site_id: UUID
    site_name: str
    site_url: str
    pages: list[PageResponse] = []
