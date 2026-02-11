import { useState } from 'react';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateSection } from '@/hooks/useSites';
import type { SiteMap, Page, Section } from '@/types';

export default function SiteMapEditorComponent({ siteMap, siteId }: { siteMap: SiteMap; siteId: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const updateSection = useUpdateSection();

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-2">
      {siteMap.pages.map((page) => (
        <PageNode key={page.id} page={page} siteId={siteId} expanded={expanded} toggle={toggle} updateSection={updateSection} />
      ))}
    </div>
  );
}

function PageNode({
  page, siteId, expanded, toggle, updateSection,
}: {
  page: Page; siteId: string; expanded: Record<string, boolean>; toggle: (id: string) => void; updateSection: ReturnType<typeof useUpdateSection>;
}) {
  const isOpen = expanded[page.id];

  return (
    <div className="border rounded-lg">
      <button onClick={() => toggle(page.id)} className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 text-left">
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="font-medium text-sm">{page.title}</span>
        <span className="text-xs text-gray-400 ml-auto">{page.url}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-2">
          {page.sections.map((section) => (
            <SectionNode key={section.id} section={section} siteId={siteId} updateSection={updateSection} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionNode({
  section, siteId, updateSection,
}: {
  section: Section; siteId: string; updateSection: ReturnType<typeof useUpdateSection>;
}) {
  const [heading, setHeading] = useState(section.heading);
  const [summary, setSummary] = useState(section.content_summary);
  const changed = heading !== section.heading || summary !== section.content_summary;

  const save = () => {
    updateSection.mutate({ siteId, sectionId: section.id, data: { heading, content_summary: summary } });
  };

  return (
    <div className="ml-6 p-3 bg-gray-50 rounded-md space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-mono">{section.section_id}</span>
      </div>
      <Input value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Section heading" className="text-sm" />
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full text-sm border rounded-md p-2 min-h-[60px] resize-y"
        placeholder="Content summary"
      />
      {changed && (
        <Button size="sm" onClick={save} disabled={updateSection.isPending}>
          <Save className="w-3 h-3 mr-1" /> Save
        </Button>
      )}
    </div>
  );
}
