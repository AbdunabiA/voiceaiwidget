"""Crawler worker — polls for pending crawl jobs and processes them."""
import asyncio
import logging

from sqlalchemy import select

from app.core.database import async_session_factory
from app.models.site import CrawlStatus, Site
from app.tasks.crawl_task import run_crawl_task

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("crawler-worker")

POLL_INTERVAL = 5  # seconds


async def poll_forever():
    logger.info("Crawler worker started, polling every %ds...", POLL_INTERVAL)
    while True:
        try:
            async with async_session_factory() as db:
                result = await db.execute(
                    select(Site).where(Site.crawl_status == CrawlStatus.pending).limit(1)
                )
                site = result.scalar_one_or_none()
                if site:
                    logger.info("Found pending crawl for site %s (%s)", site.id, site.url)
                    await run_crawl_task(site.id, async_session_factory)
        except Exception as e:
            logger.error("Poll error: %s", e)
        await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    asyncio.run(poll_forever())
