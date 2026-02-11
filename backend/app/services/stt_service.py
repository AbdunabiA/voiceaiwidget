import google.generativeai as genai

from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


async def transcribe_audio(
    audio_bytes: bytes,
    language_hints: list[str] | None = None,
) -> dict:
    model = genai.GenerativeModel("gemini-2.0-flash")

    hint_text = ""
    if language_hints:
        langs = ", ".join(language_hints)
        hint_text = f" The audio may be in one of these languages: {langs}."

    response = await model.generate_content_async(
        [
            f"Transcribe the following audio exactly as spoken. "
            f"Return ONLY the transcribed text, nothing else — no quotes, no labels, no extra commentary.{hint_text}",
            {"mime_type": "audio/webm", "data": audio_bytes},
        ]
    )

    transcript = response.text.strip()

    # Detect language from transcribed text
    detected_language = _detect_language(transcript)

    return {
        "text": transcript,
        "language": detected_language,
        "confidence": 1.0,
    }


def _detect_language(text: str) -> str:
    import re

    clean = re.sub(r'[\s\d\W]+', '', text)
    if not clean:
        return "en"

    cyrillic = sum(1 for c in clean if '\u0400' <= c <= '\u04FF')
    total = len(clean)

    if cyrillic > total * 0.3:
        return "ru"

    if '\u02BB' in text or '\u02BB' in text:
        return "uz"

    uz_words = [
        r'\bsalom\b', r'\bqanday\b', r'\bnarx\b', r'\bnima\b', r'\bkerak\b',
        r'\byordam\b', r'\bqancha\b', r'\bhaqida\b', r'\buchun\b', r'\bqilish\b',
        r'\bbilan\b', r'\bmenga\b', r'\bsizga\b', r'\bbormi\b', r"\bbo\'lim\b",
    ]
    text_lower = text.lower()
    uz_hits = sum(1 for w in uz_words if re.search(w, text_lower))
    if uz_hits >= 1:
        return "uz"

    return "en"
