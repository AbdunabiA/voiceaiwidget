import logging
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)


async def crawl_site(site_url: str, max_pages: int = 50) -> list[dict]:
    pages = []
    visited = set()
    site_url = site_url.rstrip("/")
    base_domain = urlparse(site_url).netloc

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="VoiceAI-Crawler/1.0",
            viewport={"width": 1280, "height": 720},
        )

        page = await context.new_page()
        page.set_default_timeout(30000)

        # Load homepage
        try:
            response = await page.goto(site_url, wait_until="networkidle")
        except Exception as e:
            logger.error(f"Failed to load homepage {site_url}: {e}")
            await browser.close()
            return pages

        # Extract homepage content first
        homepage_data = await _extract_page_data(page, "/")
        homepage_fingerprint = ""
        if homepage_data["sections"]:
            pages.append(homepage_data)
            # Create a fingerprint to detect duplicate pages (soft 404s that render homepage)
            homepage_fingerprint = _content_fingerprint(homepage_data["sections"])
        visited.add("/")

        # Collect internal links from nav/header/footer
        nav_links = await page.evaluate(
            """() => {
            const links = new Set();
            const origin = window.location.origin;
            document.querySelectorAll('nav a, header a, [role="navigation"] a, footer a').forEach(a => {
                const href = a.getAttribute('href');
                if (!href) return;
                // Skip hash-only links (same-page anchors)
                if (href.startsWith('#')) return;
                // Skip javascript: links
                if (href.startsWith('javascript:')) return;
                try {
                    const url = new URL(href, origin);
                    if (url.origin === origin && url.pathname !== '/') {
                        links.add(url.pathname);
                    }
                } catch(e) {}
            });
            return [...links];
        }"""
        )

        # Crawl sub-pages, but skip ones that are empty/404
        for link in nav_links[:max_pages]:
            if link in visited:
                continue
            visited.add(link)

            full_url = f"{site_url}{link}"
            try:
                resp = await page.goto(full_url, wait_until="networkidle", timeout=20000)
            except Exception as e:
                logger.warning(f"Failed to load {full_url}: {e}")
                continue

            # Skip 404/error pages
            if resp and resp.status >= 400:
                logger.info(f"Skipping {full_url} (HTTP {resp.status})")
                continue

            # Check if page has real content (not a soft 404 or empty page)
            has_content = await page.evaluate(
                """() => {
                const main = document.querySelector('main') || document.body;
                const text = main.innerText.trim();
                // If page has very little text or looks like an error page, skip
                if (text.length < 100) return false;
                // Check for common 404 indicators
                const lower = text.toLowerCase();
                if (lower.includes('404') && lower.includes('not found')) return false;
                if (lower.includes('page not found')) return false;
                if (lower.includes('this page could not be found')) return false;
                return true;
            }"""
            )

            if not has_content:
                logger.info(f"Skipping {full_url} (no meaningful content)")
                continue

            # Check if this sub-page is substantially different from homepage
            page_data = await _extract_page_data(page, link)
            if not page_data["sections"]:
                continue

            # Skip if page content is same as homepage (soft 404 / SPA fallback)
            page_fingerprint = _content_fingerprint(page_data["sections"])
            if homepage_fingerprint and page_fingerprint == homepage_fingerprint:
                logger.info(f"Skipping {full_url} (duplicate of homepage)")
                continue

            pages.append(page_data)

        await browser.close()

    logger.info(f"Crawled {site_url}: {len(pages)} pages with content")
    return pages


async def _extract_page_data(page, path: str) -> dict:
    """Extract title, meta description, and sections from the current page."""
    title = await page.title()

    meta_desc = await page.evaluate(
        """() => {
        const meta = document.querySelector('meta[name="description"]');
        return meta ? meta.getAttribute('content') : null;
    }"""
    )

    sections = await page.evaluate(
        """() => {
        const sections = [];
        const seen = new Set();

        const extractSection = (el) => {
            const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
            const id = el.id || el.getAttribute('data-section') || null;
            const text = el.innerText.substring(0, 2000).trim();

            if (text.length < 20) return;

            const key = (heading ? heading.innerText : '') + text.substring(0, 100);
            if (seen.has(key)) return;
            seen.add(key);

            sections.push({
                id: id ? '#' + id : null,
                heading: heading ? heading.innerText.trim() : '',
                content: text
            });
        };

        // Try structured sections first
        document.querySelectorAll('section, [id]:not(script):not(style):not(link):not(head):not(html), main > div, article').forEach(el => {
            extractSection(el);
        });

        // Fallback: extract by headings
        if (sections.length === 0) {
            const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
            const headings = main.querySelectorAll('h1, h2, h3');
            headings.forEach((h) => {
                let content = '';
                let sibling = h.nextElementSibling;
                while (sibling && !sibling.matches('h1, h2, h3')) {
                    content += sibling.innerText + ' ';
                    sibling = sibling.nextElementSibling;
                }
                const text = content.trim();
                if (text.length > 20) {
                    sections.push({
                        id: h.id ? '#' + h.id : null,
                        heading: h.innerText.trim(),
                        content: text.substring(0, 2000)
                    });
                }
            });
        }

        // Last resort: if still nothing, grab the whole page text
        if (sections.length === 0) {
            const main = document.querySelector('main') || document.body;
            const text = main.innerText.trim();
            if (text.length > 50) {
                sections.push({
                    id: null,
                    heading: document.title || 'Main Content',
                    content: text.substring(0, 5000)
                });
            }
        }

        return sections;
    }"""
    )

    return {
        "url": path,
        "title": title or path,
        "meta_description": meta_desc,
        "sections": sections,
    }


def _content_fingerprint(sections: list[dict]) -> str:
    """Create a simple fingerprint from section headings to detect duplicate pages."""
    return "|".join(sorted(s.get("heading", "")[:50] for s in sections))
