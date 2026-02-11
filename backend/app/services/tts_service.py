import base64
import struct

import httpx
from google.cloud import texttospeech_v1

from ..config import settings

VOICE_MAP = {
    "en": {"language_code": "en-US", "name": "en-US-Chirp3-HD-Charon"},
    "ru": {"language_code": "ru-RU", "name": "ru-RU-Chirp3-HD-Charon"},
}


async def synthesize_speech(text: str, language: str = "en") -> bytes:
    if language == "uz":
        return await synthesize_uzbek_with_gemini(text)

    client = texttospeech_v1.TextToSpeechAsyncClient()
    voice_config = VOICE_MAP.get(language, VOICE_MAP["en"])

    input_text = texttospeech_v1.SynthesisInput(text=text)
    voice = texttospeech_v1.VoiceSelectionParams(
        language_code=voice_config["language_code"],
        name=voice_config["name"],
    )
    audio_config = texttospeech_v1.AudioConfig(
        audio_encoding=texttospeech_v1.AudioEncoding.MP3,
    )

    response = await client.synthesize_speech(
        input=input_text,
        voice=voice,
        audio_config=audio_config,
    )

    return response.audio_content


async def synthesize_uzbek_with_gemini(text: str) -> bytes:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash-preview-tts:generateContent?key={settings.GEMINI_API_KEY}"
    )

    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "response_modalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": "Kore"
                    }
                }
            },
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()

    data = response.json()
    audio_part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm_bytes = base64.b64decode(audio_part["data"])

    # Gemini returns raw PCM (24kHz, 16-bit, mono) — wrap in WAV header
    return _pcm_to_wav(pcm_bytes, sample_rate=24000, channels=1, sample_width=2)


def _pcm_to_wav(pcm_data: bytes, sample_rate: int, channels: int, sample_width: int) -> bytes:
    data_size = len(pcm_data)
    byte_rate = sample_rate * channels * sample_width
    block_align = channels * sample_width

    header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        36 + data_size,
        b'WAVE',
        b'fmt ',
        16,
        1,  # PCM format
        channels,
        sample_rate,
        byte_rate,
        block_align,
        sample_width * 8,
        b'data',
        data_size,
    )

    return header + pcm_data
