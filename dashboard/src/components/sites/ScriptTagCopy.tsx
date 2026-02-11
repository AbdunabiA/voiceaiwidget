import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScriptTagCopy({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);
  const isLocal = window.location.hostname === 'localhost';
  const widgetUrl = isLocal ? 'http://localhost:8000/widget.js' : 'https://widget.voiceai.uz/widget.js';
  const apiAttr = isLocal ? ` data-api="http://localhost:8000"` : '';
  const scriptTag = `<script src="${widgetUrl}" data-key="${apiKey}"${apiAttr} async defer></script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Installation Script</h3>
      <div className="relative">
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">{scriptTag}</pre>
        <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-xs text-gray-500">Paste this before the closing &lt;/body&gt; tag of your website.</p>
    </div>
  );
}
