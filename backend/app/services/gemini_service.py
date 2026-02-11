import google.generativeai as genai

from ..config import settings
from ..core.prompts import build_system_prompt

genai.configure(api_key=settings.GEMINI_API_KEY)

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
                            "description": "The URL path or section anchor to navigate to (e.g., '/about', '/#services', '/pricing#enterprise')",
                        },
                        "highlight": {
                            "type": "boolean",
                            "description": "Whether to visually highlight the section after navigating",
                        },
                    },
                    "required": ["target"],
                },
            },
            {
                "name": "open_external_link",
                "description": "Open an external link like social media, app store, or third-party service",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "The full URL to open",
                        }
                    },
                    "required": ["url"],
                },
            },
        ]
    }
]


async def chat_with_visitor(
    message: str,
    conversation_history: list,
    site_map: dict,
    widget_config: dict,
    language: str,
) -> dict:
    system_prompt = build_system_prompt(site_map, widget_config, language)

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=system_prompt,
        tools=WIDGET_TOOLS,
    )

    history = []
    for msg in conversation_history:
        history.append({"role": msg["role"], "parts": [msg["content"]]})

    chat = model.start_chat(history=history)
    response = await chat.send_message_async(message)

    text_response = ""
    actions = []

    for part in response.parts:
        if part.text:
            text_response += part.text
        if part.function_call:
            fn = part.function_call
            actions.append({"type": fn.name, "params": dict(fn.args)})

    return {
        "text": text_response,
        "actions": actions,
        "language": language,
    }


async def gemini_summarize(content: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash")
    prompt = (
        "Summarize the following website section content in 2-3 concise sentences. "
        "Focus on what the section is about and what information it provides to visitors:\n\n"
        f"{content[:3000]}"
    )
    response = await model.generate_content_async(prompt)
    return response.text.strip()
