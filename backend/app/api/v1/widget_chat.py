import asyncio
import base64
import re

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.deps import get_site_by_api_key
from ...core.database import get_db
from ...models.conversation import Conversation
from ...models.site import Site
from ...models.widget_config import WidgetConfig
from ...schemas.chat import ChatRequest, ChatResponse
from ...schemas.widget_config import WidgetConfigResponse
from ...services.gemini_service import chat_with_visitor
from ...services.site_map_builder import get_site_map
from ...services.stt_service import transcribe_audio
from ...services.tts_service import synthesize_speech
from sqlalchemy import select

router = APIRouter(prefix="/widget", tags=["widget"])


def detect_language(text: str) -> str:
    """Detect language from message text using character analysis."""
    clean = re.sub(r'[\s\d\W]+', '', text)
    if not clean:
        return "en"

    cyrillic = sum(1 for c in clean if '\u0400' <= c <= '\u04FF')
    total = len(clean)

    # Cyrillic dominant = Russian
    if cyrillic > total * 0.3:
        return "ru"

    # Check for Uzbek-specific modifier letter (oʻ, gʻ)
    if 'ʻ' in text or '\u02BB' in text:
        return "uz"

    # Check for Uzbek words with word boundary matching
    uz_words = [
        r'\bsalom\b', r'\bqanday\b', r'\bnarx\b', r'\bnima\b', r'\bkerak\b',
        r'\byordam\b', r'\bqancha\b', r'\bhaqida\b', r'\buchun\b', r'\bqilish\b',
        r'\bbilan\b', r'\bmenga\b', r'\bsizga\b', r'\bbormi\b', r'\bbo\'lim\b',
        r'\bbot\s+nima\b', r'\bnimalar\b', r'\bqila\s+oladi\b', r'\bmalumot\b',
        r'\bimkoniyat\b', r'\bxususiyat\b', r'\bfoydalanish\b',
    ]
    text_lower = text.lower()
    uz_hits = sum(1 for w in uz_words if re.search(w, text_lower))
    if uz_hits >= 1:
        return "uz"

    return "en"


@router.get("/config", response_model=WidgetConfigResponse)
async def widget_get_config(
    site: Site = Depends(get_site_by_api_key),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WidgetConfig).where(WidgetConfig.site_id == site.id))
    config = result.scalar_one_or_none()
    if not config:
        return WidgetConfigResponse(
            id=site.id,
            site_id=site.id,
            position="bottom-right",
            primary_color="#6C5CE7",
            greeting_message="Hello! How can I help you?",
            supported_languages=["uz", "ru", "en"],
            voice_enabled=True,
            avatar_url=None,
        )
    return config


@router.post("/chat", response_model=ChatResponse)
async def widget_chat(
    request: ChatRequest,
    site: Site = Depends(get_site_by_api_key),
    db: AsyncSession = Depends(get_db),
):
    site_map = await get_site_map(db, site.id)

    config_result = await db.execute(select(WidgetConfig).where(WidgetConfig.site_id == site.id))
    widget_config = config_result.scalar_one_or_none()
    config_dict = {
        "greeting_message": widget_config.greeting_message if widget_config else "Hello!",
    }

    language = request.language
    if language == "auto":
        language = detect_language(request.message)

    history = [{"role": m.role, "content": m.content} for m in request.conversation_history]

    ai_response = await chat_with_visitor(
        message=request.message,
        conversation_history=history,
        site_map=site_map,
        widget_config=config_dict,
        language=language,
    )

    # TTS is optional — skip if not configured
    audio_base64 = ""
    audio_fmt = "audio/mp3"
    try:
        audio_bytes = await synthesize_speech(ai_response["text"], ai_response["language"])
        audio_base64 = base64.b64encode(audio_bytes).decode()
        if ai_response["language"] == "uz":
            audio_fmt = "audio/wav"
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"TTS failed for lang={ai_response['language']}: {e}")

    asyncio.create_task(
        _log_conversation(site.id, request.message, ai_response)
    )

    return ChatResponse(
        text=ai_response["text"],
        audio=audio_base64,
        audio_format=audio_fmt,
        actions=[{"type": a["type"], "params": a["params"]} for a in ai_response["actions"]],
        language=ai_response["language"],
    )


@router.post("/transcribe")
async def widget_transcribe(
    audio: UploadFile = File(...),
    site: Site = Depends(get_site_by_api_key),
    db: AsyncSession = Depends(get_db),
):
    audio_bytes = await audio.read()

    config_result = await db.execute(select(WidgetConfig).where(WidgetConfig.site_id == site.id))
    widget_config = config_result.scalar_one_or_none()

    lang_hints = ["uz-UZ", "ru-RU", "en-US"]
    if widget_config and widget_config.supported_languages:
        lang_map = {"uz": "uz-UZ", "ru": "ru-RU", "en": "en-US"}
        lang_hints = [lang_map.get(l, f"{l}-{l.upper()}") for l in widget_config.supported_languages]

    result = await transcribe_audio(audio_bytes=audio_bytes, language_hints=lang_hints)
    return result


async def _log_conversation(site_id, user_message, ai_response):
    try:
        from ...core.database import async_session_factory
        async with async_session_factory() as db:
            conv = Conversation(
                site_id=site_id,
                visitor_id="anonymous",
                messages=[
                    {"role": "user", "content": user_message},
                    {"role": "assistant", "content": ai_response["text"]},
                ],
                language=ai_response.get("language", "en"),
                actions_triggered=ai_response.get("actions", []),
            )
            db.add(conv)
            await db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to log conversation: {e}")
