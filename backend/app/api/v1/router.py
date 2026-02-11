from fastapi import APIRouter

from . import analytics, auth, crawl, sites, widget_chat, widget_config

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(sites.router)
api_router.include_router(crawl.router)
api_router.include_router(analytics.router)
api_router.include_router(widget_config.router)
api_router.include_router(widget_chat.router)
