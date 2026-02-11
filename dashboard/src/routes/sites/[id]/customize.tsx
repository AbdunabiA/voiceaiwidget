import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WidgetPreview from '@/components/sites/WidgetPreview';
import { useWidgetConfig, useUpdateWidgetConfig } from '@/hooks/useSites';

export default function CustomizeWidget() {
  const { id } = useParams<{ id: string }>();
  const { data: config } = useWidgetConfig(id!);
  const updateConfig = useUpdateWidgetConfig();

  const [position, setPosition] = useState('bottom-right');
  const [primaryColor, setPrimaryColor] = useState('#6C5CE7');
  const [greeting, setGreeting] = useState('');
  const [languages, setLanguages] = useState<string[]>(['uz', 'ru', 'en']);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (config) {
      setPosition(config.position);
      setPrimaryColor(config.primary_color);
      setGreeting(config.greeting_message);
      setLanguages(config.supported_languages);
      setVoiceEnabled(config.voice_enabled);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate({
      siteId: id!,
      data: {
        position: position as 'bottom-right' | 'bottom-left',
        primary_color: primaryColor,
        greeting_message: greeting,
        supported_languages: languages,
        voice_enabled: voiceEnabled,
      },
    });
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customize Widget</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-28" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <div className="flex gap-2">
                {['bottom-right', 'bottom-left'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                      position === pos ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Greeting Message</Label>
              <textarea
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full border rounded-md p-3 text-sm min-h-[80px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2">
                {['uz', 'ru', 'en'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                      languages.includes(lang) ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded"
                id="voice"
              />
              <Label htmlFor="voice">Voice enabled</Label>
            </div>

            <Button onClick={handleSave} disabled={updateConfig.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
          <WidgetPreview color={primaryColor} position={position} greeting={greeting} />
        </div>
      </div>
    </div>
  );
}
