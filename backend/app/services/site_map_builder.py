from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.page import Page
from ..models.section import Section
from ..models.site import Site


async def get_site_map(db: AsyncSession, site_id: UUID) -> dict:
    result = await db.execute(
        select(Site)
        .where(Site.id == site_id)
        .options(selectinload(Site.pages).selectinload(Page.sections))
    )
    site = result.scalar_one_or_none()
    if not site:
        return {"site_name": "", "site_url": "", "pages": []}

    pages = []
    for page in site.pages:
        sections = []
        for section in sorted(page.sections, key=lambda s: s.order):
            sections.append(
                {
                    "section_id": section.section_id,
                    "heading": section.heading,
                    "content_summary": section.content_summary,
                }
            )
        pages.append(
            {
                "url": page.url,
                "title": page.title,
                "sections": sections,
            }
        )

    return {
        "site_name": site.name,
        "site_url": site.url,
        "pages": pages,
    }
