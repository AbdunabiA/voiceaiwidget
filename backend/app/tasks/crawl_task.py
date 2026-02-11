import asyncio
import logging
from datetime import datetime, timezone
from uuid import UUID

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.page import Page
from ..models.section import Section
from ..models.site import CrawlStatus, Site
from ..services.crawler_service import crawl_site
from ..services.gemini_service import gemini_summarize

logger = logging.getLogger(__name__)


async def run_crawl_task(site_id: UUID, session_factory) -> None:
    async with session_factory() as db:
        result = await db.execute(select(Site).where(Site.id == site_id))
        site = result.scalar_one_or_none()
        if not site:
            logger.error(f"Site {site_id} not found")
            return

        site.crawl_status = CrawlStatus.crawling
        await db.commit()

        try:
            pages_data = await crawl_site(site.url, max_pages=50)

            existing_pages = await db.execute(select(Page).where(Page.site_id == site_id))
            for old_page in existing_pages.scalars():
                await db.delete(old_page)
            await db.flush()

            for page_data in pages_data:
                db_page = Page(
                    site_id=site_id,
                    url=page_data["url"],
                    title=page_data["title"],
                    meta_description=page_data.get("meta_description"),
                )
                db.add(db_page)
                await db.flush()

                for idx, section_data in enumerate(page_data.get("sections", [])):
                    content_raw = section_data.get("content", "")
                    try:
                        content_summary = await gemini_summarize(content_raw)
                    except Exception as e:
                        logger.warning(f"Summarization failed for section: {e}")
                        content_summary = content_raw[:500]

                    section_id = section_data.get("id")
                    if not section_id:
                        heading_slug = slugify(section_data.get("heading", f"section-{idx}"))
                        section_id = f"#section-{heading_slug}"

                    db_section = Section(
                        page_id=db_page.id,
                        section_id=section_id,
                        heading=section_data.get("heading", ""),
                        content_summary=content_summary,
                        content_raw=content_raw,
                        order=idx,
                    )
                    db.add(db_section)

            site.crawl_status = CrawlStatus.completed
            site.last_crawled_at = datetime.now(timezone.utc)
            await db.commit()
            logger.info(f"Crawl completed for site {site_id}: {len(pages_data)} pages")

        except Exception as e:
            logger.error(f"Crawl failed for site {site_id}: {e}")
            site.crawl_status = CrawlStatus.failed
            await db.commit()


