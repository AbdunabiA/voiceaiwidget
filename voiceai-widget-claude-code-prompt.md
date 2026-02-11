# VoiceAI Widget — Embeddable Voice Chat SaaS Platform

## Project Overview

Build a SaaS platform that allows any website owner to add an AI-powered voice chat assistant to their website with a single `<script>` tag. The widget automatically crawls the website, understands its structure, and provides voice-based navigation and information to visitors.

**How it works for the end user (website owner):**
1. Signs up on our dashboard
2. Enters their website URL → our crawler analyzes the site
3. Reviews/edits the auto-generated site map
4. Copies a `<script>` tag into their website
5. Visitors can now talk to an AI assistant that knows the site and navigates them to relevant pages/sections

## Tech Stack

| Component | Technology |
|---|---|
| Backend API | FastAPI, Pydantic, Python 3.11+ |
| Database | PostgreSQL + SQLAlchemy (async) + asyncpg |
| Website Crawler | Playwright (Python, headless browser) |
| LLM | Gemini 2.0 Flash (with function calling / tool use) |
| STT (Speech-to-Text) | Google Cloud Speech-to-Text V2 (Chirp 3 model) — supports Uzbek, Russian, English |
| TTS (Text-to-Speech) | Google Cloud TTS (English/Russian) + Gemini audio output for Uzbek fallback |
| Dashboard | React 18, shadcn/ui, Redux Toolkit, React Query (TanStack Query), Axios, React Hook Form, Zod |
| Widget | Vanilla JavaScript (single bundled file, Shadow DOM isolation) |
| Infra | Docker, Docker Compose, Nginx |

## Project Structure

```
voiceai-widget/
│
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app, CORS, lifespan
│   │   ├── config.py                 # Settings via pydantic-settings
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # Dependency injection (DB session, auth)
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py         # Main v1 router
│   │   │       ├── auth.py           # Registration, login, JWT tokens
│   │   │       ├── sites.py          # CRUD: add site, get site map, edit sections
│   │   │       ├── widget_chat.py    # Public: widget chat endpoint (API key auth)
│   │   │       ├── widget_config.py  # Public: widget config/theme endpoint
│   │   │       ├── crawl.py          # Trigger crawl, crawl status, re-crawl
│   │   │       └── analytics.py      # Conversation stats, top questions
│   │   │
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # User account
│   │   │   ├── site.py               # Website (url, api_key, user_id)
│   │   │   ├── page.py               # Crawled page (url, title, site_id)
│   │   │   ├── section.py            # Page section (id, heading, content_summary, page_id)
│   │   │   ├── widget_config.py      # Widget appearance settings
│   │   │   └── conversation.py       # Chat logs for analytics
│   │   │
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── site.py
│   │   │   ├── chat.py               # ChatRequest, ChatResponse, Action
│   │   │   ├── crawl.py
│   │   │   └── widget_config.py
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── gemini_service.py     # Gemini API integration with function calling
│   │   │   ├── crawler_service.py    # Playwright crawler logic
│   │   │   ├── stt_service.py        # Google Cloud STT integration
│   │   │   ├── tts_service.py        # Google Cloud TTS + Uzbek fallback
│   │   │   └── site_map_builder.py   # Build site map from crawl data
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py           # JWT, password hashing, API key generation
│   │   │   ├── database.py           # Async SQLAlchemy engine, session
│   │   │   └── prompts.py            # System prompt templates for Gemini
│   │   │
│   │   └── tasks/
│   │       ├── __init__.py
│   │       └── crawl_task.py         # Background crawl task (asyncio / Celery)
│   │
│   ├── alembic/                      # Database migrations
│   │   ├── env.py
│   │   └── versions/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
│
├── dashboard/                        # React SPA
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes/
│   │   │   ├── index.tsx             # Dashboard home
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── sites/
│   │   │   │   ├── index.tsx         # List of sites
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── index.tsx     # Site overview + get script tag
│   │   │   │   │   ├── sitemap.tsx   # View/edit crawled site map
│   │   │   │   │   ├── customize.tsx # Widget appearance settings
│   │   │   │   │   └── analytics.tsx # Conversation analytics
│   │   │   │   └── new.tsx           # Add new site + trigger crawl
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── sites/
│   │   │   │   ├── SiteCard.tsx
│   │   │   │   ├── SiteMapEditor.tsx     # Tree view to edit sections
│   │   │   │   ├── CrawlProgress.tsx     # Real-time crawl status
│   │   │   │   ├── ScriptTagCopy.tsx     # Copy-paste script tag
│   │   │   │   └── WidgetPreview.tsx     # Live preview of widget
│   │   │   └── analytics/
│   │   │       ├── ConversationChart.tsx
│   │   │       └── TopQuestions.tsx
│   │   ├── store/                    # Redux Toolkit
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   └── siteSlice.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useSites.ts           # React Query hooks
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios instance
│   │   │   └── validators.ts         # Zod schemas
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
│
├── widget/                           # Embeddable JS widget
│   ├── src/
│   │   ├── index.js                  # Entry point — reads data-key, inits widget
│   │   ├── widget-core.js            # Main orchestrator
│   │   ├── ui/
│   │   │   ├── chat-ui.js            # Shadow DOM chat panel UI
│   │   │   ├── mic-button.js         # Floating mic button with animations
│   │   │   ├── styles.js             # All CSS as JS string (injected into Shadow DOM)
│   │   │   └── animations.js         # Listening, speaking, thinking animations
│   │   ├── voice/
│   │   │   ├── recorder.js           # MediaRecorder — capture audio from mic
│   │   │   ├── audio-player.js       # Play TTS audio response (AudioContext)
│   │   │   └── voice-manager.js      # Orchestrates record → send → play cycle
│   │   ├── api/
│   │   │   ├── client.js             # API client (fetch to backend)
│   │   │   └── config-loader.js      # Load widget config (theme, position, language)
│   │   ├── navigation/
│   │   │   ├── navigator.js          # scrollIntoView, window.location.href
│   │   │   ├── highlighter.js        # Highlight target section with animation
│   │   │   └── page-detector.js      # Detect current page URL for context
│   │   └── utils/
│   │       ├── browser-support.js    # Check mic, AudioContext support
│   │       └── language-detect.js    # Detect user's preferred language
│   ├── webpack.config.js             # Bundle everything into single widget.js (~50KB)
│   ├── package.json
│   └── dist/
│       └── widget.js                 # Final bundled file served via CDN/Nginx
│
├── docker-compose.yml
├── nginx/
│   ├── nginx.conf                    # Reverse proxy for all services
│   └── conf.d/
│       └── default.conf
├── .env.example
└── README.md
```

## Detailed Implementation Guide

---

### 1. BACKEND

#### 1.1 Database Models

**User**
```
- id: UUID (PK)
- email: String (unique)
- hashed_password: String
- full_name: String
- plan: Enum (free, pro, business) default=free
- created_at: DateTime
```

**Site**
```
- id: UUID (PK)
- user_id: UUID (FK → User)
- url: String (base URL, e.g. "https://example.com")
- name: String
- api_key: String (unique, auto-generated, e.g. "vaw_live_xxxxxxxxxxxx")
- allowed_origins: List[String] (CORS — which domains can use this widget)
- crawl_status: Enum (pending, crawling, completed, failed)
- last_crawled_at: DateTime
- created_at: DateTime
```

**Page**
```
- id: UUID (PK)
- site_id: UUID (FK → Site)
- url: String (relative, e.g. "/about")
- title: String
- meta_description: String (nullable)
- crawled_at: DateTime
```

**Section**
```
- id: UUID (PK)
- page_id: UUID (FK → Page)
- section_id: String (CSS selector or auto-generated, e.g. "#services", "section-2")
- heading: String
- content_summary: Text (AI-generated summary of section content)
- content_raw: Text (raw text content for context)
- order: Integer (position on page)
```

**WidgetConfig**
```
- id: UUID (PK)
- site_id: UUID (FK → Site, unique)
- position: Enum (bottom-right, bottom-left) default=bottom-right
- primary_color: String (hex, default="#6C5CE7")
- greeting_message: String (default="Salom! Men sizga yordam bera olaman.")
- supported_languages: List[String] (default=["uz", "ru", "en"])
- voice_enabled: Boolean (default=true)
- avatar_url: String (nullable)
```

**Conversation**
```
- id: UUID (PK)
- site_id: UUID (FK → Site)
- visitor_id: String (anonymous, cookie-based or fingerprint)
- messages: JSONB (array of {role, content, timestamp})
- language: String
- actions_triggered: JSONB (array of {type, target, timestamp})
- created_at: DateTime
- ended_at: DateTime (nullable)
```

#### 1.2 Crawler Service (crawler_service.py)

The crawler uses Playwright (headless Chromium) to analyze websites:

```python
# Pseudocode for crawl logic:

async def crawl_site(site_url: str) -> SiteMap:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Step 1: Crawl the homepage, extract all internal navigation links
        page = await browser.new_page()
        await page.goto(site_url)
        
        # Extract nav links from <nav>, <header>, <a> elements
        nav_links = await page.evaluate('''() => {
            const links = new Set();
            // Get links from nav elements
            document.querySelectorAll('nav a, header a, [role="navigation"] a').forEach(a => {
                const href = a.getAttribute('href');
                if (href && !href.startsWith('http') || href.startsWith(window.location.origin)) {
                    links.add(new URL(href, window.location.origin).pathname);
                }
            });
            return [...links];
        }''')
        
        # Step 2: Visit each page and extract sections
        pages = []
        for link in nav_links:
            await page.goto(f"{site_url}{link}")
            
            # Extract sections: look for <section>, elements with id, <h1>-<h6>
            sections = await page.evaluate('''() => {
                const sections = [];
                
                // Strategy 1: <section> elements with id or heading
                document.querySelectorAll('section, [id], main > div').forEach(el => {
                    const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
                    const id = el.id || el.getAttribute('data-section') || null;
                    const text = el.innerText.substring(0, 2000); // limit text
                    
                    if (heading || id) {
                        sections.push({
                            id: id ? `#${id}` : null,
                            heading: heading ? heading.innerText : '',
                            content: text
                        });
                    }
                });
                
                return sections;
            }''')
            
            pages.append({
                "url": link,
                "title": await page.title(),
                "sections": sections
            })
        
        await browser.close()
        
    # Step 3: Use Gemini to summarize each section's content
    for page_data in pages:
        for section in page_data["sections"]:
            section["content_summary"] = await gemini_summarize(section["content"])
            # Auto-generate section ID if missing
            if not section["id"]:
                section["id"] = f"#section-{slugify(section['heading'])}"
    
    return pages
```

**Important crawler details:**
- Set a reasonable timeout (30 seconds per page)
- Limit crawl to max 50 pages per site (for free plan)
- Respect robots.txt
- Handle SPA sites: wait for `networkidle` event before extracting content
- Handle errors gracefully: if a page fails, skip it and continue
- Store raw content for re-summarization if needed
- Run crawl as a background task (asyncio task or Celery) — don't block the API

#### 1.3 Gemini Service (gemini_service.py)

This service handles the AI chat with function calling:

```python
import google.generativeai as genai

# Tool definitions for Gemini function calling
WIDGET_TOOLS = [
    {
        "function_declarations": [
            {
                "name": "navigate_to",
                "description": "Navigate the website visitor to a specific page or section. Use this whenever the conversation topic matches a page or section on the website.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "target": {
                            "type": "string",
                            "description": "The URL path or section anchor to navigate to (e.g., '/about', '/#services', '/pricing#enterprise')"
                        },
                        "highlight": {
                            "type": "boolean",
                            "description": "Whether to visually highlight the section after navigating"
                        }
                    },
                    "required": ["target"]
                }
            },
            {
                "name": "open_external_link",
                "description": "Open an external link like social media, app store, or third-party service",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "The full URL to open"
                        }
                    },
                    "required": ["url"]
                }
            }
        ]
    }
]

async def chat_with_visitor(
    message: str,
    conversation_history: list,
    site_map: dict,        # from DB — this site's pages/sections
    widget_config: dict,
    language: str
) -> dict:
    
    # Build dynamic system prompt based on the site's crawled data
    system_prompt = build_system_prompt(site_map, widget_config, language)
    
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=system_prompt,
        tools=WIDGET_TOOLS
    )
    
    chat = model.start_chat(history=conversation_history)
    response = await chat.send_message_async(message)
    
    # Parse response — extract text and any function calls
    text_response = ""
    actions = []
    
    for part in response.parts:
        if part.text:
            text_response += part.text
        if part.function_call:
            fn = part.function_call
            actions.append({
                "type": fn.name,      # "navigate_to" or "open_external_link"
                "params": dict(fn.args)
            })
    
    return {
        "text": text_response,
        "actions": actions,
        "language": language
    }
```

#### 1.4 System Prompt Builder (prompts.py)

```python
def build_system_prompt(site_map: dict, config: dict, language: str) -> str:
    """
    Dynamically builds the system prompt based on the crawled site data.
    This is the SECRET SAUCE — the AI knows the exact structure of each client's website.
    """
    
    # Build the site structure section from crawled data
    site_structure = ""
    for page in site_map["pages"]:
        site_structure += f"\nPAGE: {page['url']} — \"{page['title']}\"\n"
        for section in page["sections"]:
            site_structure += f"  SECTION: {section['section_id']} — \"{section['heading']}\"\n"
            site_structure += f"    Content: {section['content_summary']}\n"
    
    lang_instruction = {
        "uz": "Respond in Uzbek language.",
        "ru": "Respond in Russian language.",
        "en": "Respond in English."
    }.get(language, "Respond in the same language the user speaks.")
    
    return f"""You are a friendly voice assistant for the website "{site_map['site_name']}" ({site_map['site_url']}).
You help visitors learn about the website's content and navigate to relevant sections.

BEHAVIOR RULES:
- You are SPEAKING out loud, so keep responses SHORT (2-4 sentences max)
- Be conversational and warm, like a friendly receptionist
- {lang_instruction}
- When discussing a topic, ALWAYS use the navigate_to tool to show the relevant section
- Do NOT use markdown, bullet points, or text formatting — your words will be spoken aloud
- Do NOT say "let me navigate you to..." — just navigate naturally while talking
- If asked something not related to this website, politely redirect to what you can help with

WEBSITE STRUCTURE:
{site_structure}

GREETING: {config.get('greeting_message', 'Hello! How can I help you today?')}
"""
```

#### 1.5 Voice Processing

**Speech-to-Text (STT) — stt_service.py:**

The widget records audio in the browser using MediaRecorder API and sends the audio blob to the backend. The backend sends it to Google Cloud Speech-to-Text V2 (Chirp 3 model).

```python
from google.cloud import speech_v2

async def transcribe_audio(audio_bytes: bytes, language_hints: list = ["uz-UZ", "ru-RU", "en-US"]) -> dict:
    """
    Transcribe audio using Google Cloud STT V2 with Chirp 3.
    Supports automatic language detection among the hint languages.
    """
    client = speech_v2.SpeechAsyncClient()
    
    config = speech_v2.RecognitionConfig(
        auto_decoding_config=speech_v2.AutoDetectDecodingConfig(),
        language_codes=language_hints,       # Chirp 3 can auto-detect among these
        model="chirp_3",
        features=speech_v2.RecognitionFeatures(
            enable_automatic_punctuation=True,
        ),
    )
    
    request = speech_v2.RecognizeRequest(
        recognizer=f"projects/{PROJECT_ID}/locations/global/recognizers/_",
        config=config,
        content=audio_bytes,
    )
    
    response = await client.recognize(request=request)
    
    transcript = ""
    detected_language = "en"
    for result in response.results:
        transcript += result.alternatives[0].transcript
        if result.language_code:
            detected_language = result.language_code[:2]  # "uz", "ru", "en"
    
    return {
        "text": transcript,
        "language": detected_language,
        "confidence": response.results[0].alternatives[0].confidence if response.results else 0
    }
```

**Text-to-Speech (TTS) — tts_service.py:**

```python
from google.cloud import texttospeech_v1

# Voice mapping per language
VOICE_MAP = {
    "en": {"language_code": "en-US", "name": "en-US-Chirp3-HD-Charon"},
    "ru": {"language_code": "ru-RU", "name": "ru-RU-Chirp3-HD-Charon"},
    # Uzbek is NOT supported by Google Cloud TTS
    # Fallback: use Gemini audio generation or Turkish voice (closest available)
}

async def synthesize_speech(text: str, language: str = "en") -> bytes:
    """
    Convert text to speech audio.
    Returns audio bytes (MP3 format).
    """
    if language == "uz":
        # Fallback for Uzbek — use Gemini's audio output capability
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
    
    return response.audio_content  # bytes


async def synthesize_uzbek_with_gemini(text: str) -> bytes:
    """
    Fallback TTS for Uzbek using Gemini 2.0 Flash's audio generation.
    Gemini can generate spoken audio in Uzbek.
    """
    import google.generativeai as genai
    
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    response = await model.generate_content_async(
        f"Please read the following text aloud in Uzbek with a natural, friendly tone: {text}",
        generation_config=genai.GenerationConfig(
            response_modalities=["audio"],
            speech_config=genai.SpeechConfig(
                voice_config=genai.VoiceConfig(
                    prebuilt_voice_config=genai.PrebuiltVoiceConfig(voice_name="Kore")
                )
            )
        )
    )
    
    # Extract audio bytes from response
    for part in response.parts:
        if part.inline_data and part.inline_data.mime_type.startswith("audio/"):
            return part.inline_data.data
    
    raise Exception("Gemini did not return audio output")
```

#### 1.6 Widget Chat API Endpoint (widget_chat.py)

```python
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File
from ..schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/widget/chat", response_model=ChatResponse)
async def widget_chat(
    request: ChatRequest,
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint — called by the widget from client websites.
    Authenticated via API key (not JWT).
    """
    # 1. Validate API key and get site
    site = await get_site_by_api_key(db, x_api_key)
    if not site:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # 2. Check rate limit
    await check_rate_limit(site.id, site.user.plan)
    
    # 3. Load site map from DB
    site_map = await get_site_map(db, site.id)
    widget_config = await get_widget_config(db, site.id)
    
    # 4. Send to Gemini with site context
    ai_response = await chat_with_visitor(
        message=request.message,
        conversation_history=request.conversation_history,
        site_map=site_map,
        widget_config=widget_config,
        language=request.language
    )
    
    # 5. Generate TTS audio
    audio_bytes = await synthesize_speech(ai_response["text"], ai_response["language"])
    audio_base64 = base64.b64encode(audio_bytes).decode()
    
    # 6. Log conversation for analytics (async, don't block response)
    asyncio.create_task(log_conversation(db, site.id, request, ai_response))
    
    return ChatResponse(
        text=ai_response["text"],
        audio=audio_base64,           # Base64 encoded MP3
        audio_format="audio/mp3",
        actions=ai_response["actions"],
        language=ai_response["language"]
    )


@router.post("/widget/transcribe")
async def widget_transcribe(
    audio: UploadFile = File(...),
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
):
    """
    Transcribe audio from widget microphone.
    Widget sends recorded audio blob, we return text.
    """
    site = await get_site_by_api_key(db, x_api_key)
    if not site:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    audio_bytes = await audio.read()
    widget_config = await get_widget_config(db, site.id)
    
    result = await transcribe_audio(
        audio_bytes=audio_bytes,
        language_hints=widget_config.supported_languages  # ["uz-UZ", "ru-RU", "en-US"]
    )
    
    return result
```

**Chat Schemas (schemas/chat.py):**
```python
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    language: str = "auto"    # "auto", "uz", "ru", "en"
    current_url: str = "/"    # Current page the visitor is on

class ChatAction(BaseModel):
    type: str                  # "navigate_to", "open_external_link"
    params: dict               # {"target": "/#services", "highlight": true}

class ChatResponse(BaseModel):
    text: str
    audio: str                 # Base64 encoded audio
    audio_format: str          # "audio/mp3"
    actions: list[ChatAction]
    language: str
```

#### 1.7 CORS Configuration

Very important — the widget makes requests from other people's domains:

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

# For widget endpoints: allow any origin but validate via API key
# For dashboard endpoints: only allow dashboard domain

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Widget can be on any domain
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["X-API-Key", "Content-Type"],
)

# IMPORTANT: Additionally validate the Origin header against
# site.allowed_origins in the widget endpoints for extra security
```

---

### 2. WIDGET (Vanilla JS)

#### 2.1 Entry Point (index.js)

```javascript
// This is what runs when the script tag loads:
// <script src="https://widget.voiceai.uz/widget.js" data-key="vaw_live_xxx"></script>

(function() {
    'use strict';
    
    // 1. Read API key from script tag
    const script = document.currentScript || document.querySelector('script[data-key]');
    const apiKey = script?.getAttribute('data-key');
    
    if (!apiKey) {
        console.error('[VoiceAI] Missing data-key attribute');
        return;
    }
    
    // 2. Load widget config from API
    const API_BASE = 'https://api.voiceai.uz';  // or read from data-api attribute
    
    fetch(`${API_BASE}/api/v1/widget/config`, {
        headers: { 'X-API-Key': apiKey }
    })
    .then(res => res.json())
    .then(config => {
        // 3. Initialize widget with config
        initWidget(apiKey, config);
    })
    .catch(err => {
        console.error('[VoiceAI] Failed to load config:', err);
    });
})();
```

#### 2.2 Shadow DOM UI (chat-ui.js)

```javascript
function initWidget(apiKey, config) {
    // Create host element
    const host = document.createElement('div');
    host.id = 'voiceai-widget-host';
    document.body.appendChild(host);
    
    // Attach Shadow DOM — isolates CSS completely
    const shadow = host.attachShadow({ mode: 'closed' });
    
    // Inject styles + HTML into Shadow DOM
    shadow.innerHTML = `
        <style>${getWidgetStyles(config)}</style>
        
        <!-- Floating Mic Button -->
        <button id="voiceai-trigger" aria-label="Voice Assistant">
            <svg><!-- mic icon SVG --></svg>
            <div class="pulse-ring"></div>    <!-- Attention-grabbing pulse -->
        </button>
        
        <!-- Chat Panel (hidden by default) -->
        <div id="voiceai-panel" class="hidden">
            <div class="panel-header">
                <div class="avatar"></div>
                <span class="title">AI Assistant</span>
                <div class="lang-toggle">
                    <button data-lang="uz">UZ</button>
                    <button data-lang="ru">RU</button>
                    <button data-lang="en">EN</button>
                </div>
                <button class="close-btn">&times;</button>
            </div>
            
            <div class="messages-area" id="messages">
                <!-- Chat bubbles appear here -->
            </div>
            
            <!-- Voice visualization area -->
            <div class="voice-visualizer" id="visualizer">
                <canvas id="waveform"></canvas>
                <span class="status-text">Tap to speak</span>
            </div>
            
            <!-- Large mic button -->
            <button id="mic-btn" class="mic-button">
                <svg><!-- large mic icon --></svg>
            </button>
            
            <!-- Text fallback input -->
            <div class="text-input-row">
                <input type="text" placeholder="Or type here..." id="text-input" />
                <button id="send-btn">→</button>
            </div>
        </div>
    `;
    
    // Initialize event handlers, voice manager, etc.
    setupEventHandlers(shadow, apiKey, config);
}
```

#### 2.3 Voice Manager (voice-manager.js)

This orchestrates the full voice cycle:

```javascript
class VoiceManager {
    constructor(apiKey, apiBase) {
        this.apiKey = apiKey;
        this.apiBase = apiBase;
        this.mediaRecorder = null;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.state = 'idle'; // idle | listening | processing | speaking
    }
    
    async startListening() {
        this.state = 'listening';
        this.updateUI(); // Show listening animation
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks = [];
        
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        
        this.mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop()); // Release mic
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            await this.processAudio(audioBlob);
        };
        
        this.mediaRecorder.start();
        
        // Auto-stop after silence detection or max 15 seconds
        this.startSilenceDetection(stream);
    }
    
    stopListening() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }
    
    async processAudio(audioBlob) {
        this.state = 'processing';
        this.updateUI(); // Show thinking animation
        
        // Step 1: Send audio to backend for STT
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        const sttResponse = await fetch(`${this.apiBase}/api/v1/widget/transcribe`, {
            method: 'POST',
            headers: { 'X-API-Key': this.apiKey },
            body: formData
        });
        const sttResult = await sttResponse.json();
        
        // Show user's transcribed message in chat
        this.addMessage('user', sttResult.text);
        
        // Step 2: Send text to chat API
        const chatResponse = await fetch(`${this.apiBase}/api/v1/widget/chat`, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: sttResult.text,
                conversation_history: this.conversationHistory,
                language: sttResult.language,
                current_url: window.location.pathname
            })
        });
        const chatResult = await chatResponse.json();
        
        // Show AI message in chat
        this.addMessage('assistant', chatResult.text);
        
        // Step 3: Execute navigation actions (OUTSIDE Shadow DOM)
        for (const action of chatResult.actions) {
            this.executeAction(action);
        }
        
        // Step 4: Play TTS audio
        this.state = 'speaking';
        this.updateUI(); // Show speaking animation
        await this.playAudio(chatResult.audio, chatResult.audio_format);
        
        this.state = 'idle';
        this.updateUI();
    }
    
    async playAudio(base64Audio, mimeType) {
        const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
        const audioBuffer = await this.audioContext.decodeAudioData(audioBytes.buffer);
        
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        
        return new Promise(resolve => {
            source.onended = resolve;
            source.start(0);
        });
    }
    
    executeAction(action) {
        // This runs OUTSIDE Shadow DOM — manipulates the host page
        if (action.type === 'navigate_to') {
            const target = action.params.target;
            
            if (target.startsWith('/') && !target.includes('#')) {
                // Full page navigation
                window.location.href = target;
            } else if (target.includes('#')) {
                // Section scroll
                const sectionId = target.split('#')[1];
                const path = target.split('#')[0];
                
                // Navigate to page first if needed
                if (path && path !== window.location.pathname) {
                    window.location.href = target;
                    return;
                }
                
                // Scroll to section
                const element = document.getElementById(sectionId) 
                    || document.querySelector(`[data-section="${sectionId}"]`);
                
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight if requested
                    if (action.params.highlight) {
                        element.style.transition = 'outline 0.3s ease, box-shadow 0.3s ease';
                        element.style.outline = '3px solid ' + (this.config?.primary_color || '#6C5CE7');
                        element.style.boxShadow = `0 0 20px ${this.config?.primary_color || '#6C5CE7'}40`;
                        setTimeout(() => {
                            element.style.outline = 'none';
                            element.style.boxShadow = 'none';
                        }, 3000);
                    }
                }
            }
        } else if (action.type === 'open_external_link') {
            window.open(action.params.url, '_blank');
        }
    }
}
```

#### 2.4 Mic Button Animations (animations.js)

The mic button should have distinct visual states:

```
IDLE:        Static mic icon, subtle breathing pulse on outer ring
LISTENING:   Mic icon turns red, concentric pulse rings animate outward (like radar)
             Audio waveform visualization (canvas) shows live audio levels
PROCESSING:  Spinning dots or orbiting particles animation
SPEAKING:    Sound wave bars animation (equalizer style), icon changes to speaker
```

#### 2.5 Webpack Config

```javascript
// webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'widget.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    optimization: {
        minimize: true,      // Minify for small bundle size
    },
    // Target: ~40-50KB gzipped
    // NO external dependencies — everything is vanilla JS
};
```

---

### 3. DASHBOARD (React)

#### 3.1 Key Pages

**Add New Site (/sites/new):**
- Form: website URL input (validated with Zod)
- "Analyze" button → triggers crawl
- Show real-time crawl progress (polling or WebSocket)
- When done → redirect to site map editor

**Site Map Editor (/sites/[id]/sitemap):**
- Tree view showing: Pages → Sections
- Each section shows: heading, section_id, content_summary
- Editable: user can rename sections, add/remove sections, edit summaries
- "Re-crawl" button to refresh

**Get Script Tag (/sites/[id]):**
- Display the script tag for copy-paste:
  ```html
  <script src="https://widget.voiceai.uz/widget.js" data-key="vaw_live_xxxxx" async defer></script>
  ```
- "Copy" button
- Installation instructions for popular platforms (WordPress, Wix, Tilda, etc.)

**Customize Widget (/sites/[id]/customize):**
- Color picker for primary color
- Position selector (bottom-right / bottom-left)
- Greeting message input
- Language toggles (uz, ru, en)
- Live preview of the widget on the right side

**Analytics (/sites/[id]/analytics):**
- Chart: conversations per day (Recharts)
- Top 10 most asked questions
- Language breakdown pie chart
- Average conversation length
- Most triggered navigation actions

#### 3.2 State Management

```
Redux Toolkit:
- authSlice: { user, token, isAuthenticated }
- siteSlice: { currentSite, sites } (for active selection)

React Query:
- useSites() — GET /api/v1/sites
- useSiteMap(siteId) — GET /api/v1/sites/:id/map
- useCrawlStatus(siteId) — GET /api/v1/crawl/:id/status (polling)
- useAnalytics(siteId) — GET /api/v1/analytics/:id
- mutations: createSite, updateSiteMap, triggerCrawl, updateWidgetConfig
```

---

### 4. DOCKER COMPOSE

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: voiceai
      POSTGRES_USER: voiceai
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://voiceai:${DB_PASSWORD}@postgres:5432/voiceai
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      GOOGLE_APPLICATION_CREDENTIALS: /app/gcloud-key.json
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./backend:/app
      - ./gcloud-key.json:/app/gcloud-key.json:ro
    depends_on:
      - postgres
    ports:
      - "8000:8000"

  dashboard:
    build: ./dashboard
    environment:
      VITE_API_URL: ${API_URL}
    ports:
      - "3000:3000"

  # Playwright needs special setup for headless browser
  crawler-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.crawler    # Includes playwright browsers
    environment:
      DATABASE_URL: postgresql+asyncpg://voiceai:${DB_PASSWORD}@postgres:5432/voiceai
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./widget/dist:/usr/share/nginx/html/widget  # Serve widget.js
      - ./certbot:/etc/letsencrypt                   # SSL certs
    depends_on:
      - backend
      - dashboard

volumes:
  pgdata:
```

---

### 5. NGINX CONFIG

```nginx
server {
    listen 80;
    server_name api.voiceai.uz;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name app.voiceai.uz;

    location / {
        proxy_pass http://dashboard:3000;
    }
}

server {
    listen 80;
    server_name widget.voiceai.uz;

    # Serve widget.js with aggressive caching + CORS
    location /widget.js {
        alias /usr/share/nginx/html/widget/widget.js;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "public, max-age=3600";  # 1 hour cache
        add_header Content-Type "application/javascript";
    }
}
```

---

### 6. ENVIRONMENT VARIABLES (.env.example)

```env
# Database
DB_PASSWORD=your_secure_password

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Google Cloud (for STT + TTS)
GOOGLE_APPLICATION_CREDENTIALS=./gcloud-key.json
GOOGLE_CLOUD_PROJECT=your-project-id

# JWT
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# URLs
API_URL=https://api.voiceai.uz
DASHBOARD_URL=https://app.voiceai.uz
WIDGET_URL=https://widget.voiceai.uz

# Rate limits
FREE_PLAN_REQUESTS_PER_MONTH=100
PRO_PLAN_REQUESTS_PER_MONTH=5000
BUSINESS_PLAN_REQUESTS_PER_MONTH=50000
```

---

### 7. IMPLEMENTATION ORDER

Build in this exact order:

**Phase 1: Foundation**
1. Backend project setup (FastAPI, SQLAlchemy, Alembic, database models, migrations)
2. Auth endpoints (register, login, JWT)
3. Site CRUD endpoints

**Phase 2: Crawler**
4. Playwright crawler service
5. Site map builder (extract pages + sections)
6. Gemini summarization of sections
7. Crawl trigger endpoint + background task

**Phase 3: Widget Chat (Text Only First)**
8. Gemini chat service with function calling
9. Widget chat API endpoint (text in, text + actions out)
10. Basic widget (Shadow DOM, text chat, navigation) — no voice yet
11. Test on a sample website

**Phase 4: Voice**
12. Google Cloud STT integration (transcribe endpoint)
13. Google Cloud TTS integration (audio in chat response)
14. Uzbek TTS fallback via Gemini
15. Widget: MediaRecorder for audio capture
16. Widget: AudioContext for playback
17. Widget: Mic button animations and states

**Phase 5: Dashboard**
18. React project setup (Vite, shadcn/ui, Redux, React Query)
19. Auth pages (login, register)
20. Site management (add site, view list, get script tag)
21. Site map editor (tree view, edit sections)
22. Widget customization page
23. Analytics page

**Phase 6: Polish**
24. Rate limiting
25. Error handling and fallbacks
26. Widget bundle optimization (webpack)
27. Docker Compose setup
28. Nginx config
29. SSL certificates
30. Deploy and test on real websites

---

### 8. KEY TECHNICAL NOTES

- **Audio format**: Widget records in `audio/webm` (best browser support), backend converts if needed for Google STT
- **Audio response**: Backend returns base64-encoded MP3 in the chat response — widget decodes and plays via AudioContext
- **Bundle size**: Widget must be under 50KB gzipped — no frameworks, no dependencies, pure vanilla JS
- **Shadow DOM mode**: Use `closed` mode so the host page cannot access widget internals
- **HTTPS required**: Microphone access requires HTTPS — widget won't work on HTTP sites
- **Mobile**: Ensure the widget is fully responsive and touch-friendly. The mic button should be large enough for thumb tapping
- **Silence detection**: Use AudioContext analyzer to detect when user stops speaking, auto-stop recording after 2 seconds of silence
- **Conversation history**: Keep last 10 messages in widget memory (JS variable), send with each request for context. Reset on page reload.
