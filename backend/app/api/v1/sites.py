import asyncio
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...core.security import generate_api_key, get_current_user
from ...models.page import Page
from ...models.section import Section
from ...models.site import Site
from ...models.user import User
from ...models.widget_config import WidgetConfig
from ...schemas.site import (
    PageResponse,
    SectionResponse,
    SectionUpdate,
    SiteCreate,
    SiteMapResponse,
    SiteResponse,
)

router = APIRouter(prefix="/sites", tags=["sites"])


@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    data: SiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = Site(
        user_id=current_user.id,
        url=data.url.rstrip("/"),
        name=data.name,
        api_key=generate_api_key(),
        allowed_origins=[data.url.rstrip("/")],
    )
    db.add(site)
    await db.flush()

    widget_config = WidgetConfig(site_id=site.id)
    db.add(widget_config)
    await db.flush()
    await db.refresh(site)
    return site


@router.get("", response_model=list[SiteResponse])
async def list_sites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Site).where(Site.user_id == current_user.id).order_by(Site.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
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
    return site


@router.get("/{site_id}/map", response_model=SiteMapResponse)
async def get_site_map(
    site_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Site)
        .where(Site.id == site_id, Site.user_id == current_user.id)
        .options(selectinload(Site.pages).selectinload(Page.sections))
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    pages = []
    for page in site.pages:
        sections = [
            SectionResponse.model_validate(s)
            for s in sorted(page.sections, key=lambda s: s.order)
        ]
        pages.append(
            PageResponse(
                id=page.id,
                url=page.url,
                title=page.title,
                meta_description=page.meta_description,
                crawled_at=page.crawled_at,
                sections=sections,
            )
        )

    return SiteMapResponse(
        site_id=site.id,
        site_name=site.name,
        site_url=site.url,
        pages=pages,
    )


@router.put("/{site_id}/map/sections/{section_id}")
async def update_section(
    site_id: UUID,
    section_id: UUID,
    data: SectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site_result = await db.execute(
        select(Site).where(Site.id == site_id, Site.user_id == current_user.id)
    )
    if not site_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    if data.heading is not None:
        section.heading = data.heading
    if data.content_summary is not None:
        section.content_summary = data.content_summary
    if data.section_id is not None:
        section.section_id = data.section_id

    await db.flush()
    return {"status": "updated"}


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(
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
    await db.delete(site)
    await db.commit()
