export async function loadWidgetConfig(apiBase, apiKey) {
  const res = await fetch(`${apiBase}/api/v1/widget/config`, {
    headers: { 'X-API-Key': apiKey },
  });

  if (!res.ok) {
    throw new Error(`[VoiceAI] Failed to load config: ${res.status}`);
  }

  return res.json();
}
