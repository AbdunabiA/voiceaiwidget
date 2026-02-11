from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.page import Page
from ...models.site import CrawlStatus, Site
from ...models.user import User
from ...schemas.crawl import CrawlStatusResponse, CrawlTriggerResponse

router = APIRouter(prefix="/crawl", tags=["crawl"])


@router.post("/{site_id}", response_model=CrawlTriggerResponse)
async def trigger_crawl(
    site_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.user_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    if site.crawl_status == CrawlStatus.crawling:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Crawl already in progress")

    # Set to pending — the crawler-worker will pick it up
    site.crawl_status = CrawlStatus.pending
    await db.commit()

    return CrawlTriggerResponse(
        site_id=site.id,
        status="started",
        message="Crawl has been initiated",
    )


@router.get("/{site_id}/status", response_model=CrawlStatusResponse)
async def crawl_status(
    site_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.user_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    pages_result = await db.execute(select(Page).where(Page.site_id == site_id))
    pages_count = len(pages_result.scalars().all())

    return CrawlStatusResponse(
        site_id=site.id,
        status=site.crawl_status.value,
        pages_crawled=pages_count,
        total_pages=pages_count,
        started_at=site.last_crawled_at,
    )
