from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.site import Site
from ...models.user import User
from ...models.widget_config import WidgetConfig
from ...schemas.widget_config import WidgetConfigResponse, WidgetConfigUpdate

router = APIRouter(tags=["widget-config"])


@router.get("/sites/{site_id}/widget-config", response_model=WidgetConfigResponse)
async def get_widget_config(
    site_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site_result = await db.execute(
        select(Site).where(Site.id == site_id, Site.user_id == current_user.id)
    )
    if not site_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    result = await db.execute(select(WidgetConfig).where(WidgetConfig.site_id == site_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget config not found")
    return config


@router.put("/sites/{site_id}/widget-config", response_model=WidgetConfigResponse)
async def update_widget_config(
    site_id: UUID,
    data: WidgetConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site_result = await db.execute(
        select(Site).where(Site.id == site_id, Site.user_id == current_user.id)
    )
    if not site_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    result = await db.execute(select(WidgetConfig).where(WidgetConfig.site_id == site_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget config not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    await db.flush()
    await db.refresh(config)
    return config
