from collections import Counter
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.conversation import Conversation
from ...models.site import Site
from ...models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{site_id}")
async def get_analytics(
    site_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site_result = await db.execute(
        select(Site).where(Site.id == site_id, Site.user_id == current_user.id)
    )
    if not site_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    convs_result = await db.execute(
        select(Conversation).where(Conversation.site_id == site_id)
    )
    conversations = convs_result.scalars().all()

    total_conversations = len(conversations)
    language_counts = Counter()
    all_questions = []
    actions_count = 0
    total_messages = 0

    for conv in conversations:
        language_counts[conv.language] += 1
        messages = conv.messages or []
        total_messages += len(messages)
        for msg in messages:
            if msg.get("role") == "user":
                all_questions.append(msg.get("content", ""))
        actions_count += len(conv.actions_triggered or [])

    question_counts = Counter(all_questions)
    top_questions = [
        {"question": q, "count": c} for q, c in question_counts.most_common(10)
    ]

    avg_messages = total_messages / total_conversations if total_conversations > 0 else 0

    return {
        "total_conversations": total_conversations,
        "average_messages_per_conversation": round(avg_messages, 1),
        "language_breakdown": dict(language_counts),
        "top_questions": top_questions,
        "total_actions_triggered": actions_count,
    }
