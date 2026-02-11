import { useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SiteMapEditorComponent from '@/components/sites/SiteMapEditor';
import { useSiteMap, useTriggerCrawl } from '@/hooks/useSites';

export default function SiteMapEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: siteMap, isLoading } = useSiteMap(id!);
  const triggerCrawl = useTriggerCrawl();

  if (isLoading) return <p className="text-gray-500">Loading site map...</p>;
  if (!siteMap) return <p className="text-gray-500">No site map data available.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Map</h1>
          <p className="text-gray-500">{siteMap.site_name} — {siteMap.pages.length} pages</p>
        </div>
        <Button variant="outline" onClick={() => triggerCrawl.mutate(id!)} disabled={triggerCrawl.isPending}>
          <RefreshCw className="w-4 h-4 mr-2" /> Re-crawl
        </Button>
      </div>

      <SiteMapEditorComponent siteMap={siteMap} siteId={id!} />
    </div>
  );
}
