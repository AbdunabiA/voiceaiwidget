import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Map, Palette, BarChart3, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScriptTagCopy from '@/components/sites/ScriptTagCopy';
import CrawlProgress from '@/components/sites/CrawlProgress';
import { useSite, useTriggerCrawl, useDeleteSite } from '@/hooks/useSites';

export default function SiteOverview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: site, isLoading } = useSite(id!);
  const triggerCrawl = useTriggerCrawl();
  const deleteSite = useDeleteSite();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading || !site) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-gray-500">{site.url}</p>
        </div>
        <Badge variant={site.crawl_status === 'completed' ? 'success' : 'warning'}>{site.crawl_status}</Badge>
      </div>

      <ScriptTagCopy apiKey={site.api_key} />

      <CrawlProgress siteId={site.id} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={`/sites/${id}/sitemap`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <Map className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">Site Map</p>
                <p className="text-sm text-gray-500">View & edit crawled pages</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to={`/sites/${id}/customize`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <Palette className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">Customize</p>
                <p className="text-sm text-gray-500">Widget appearance</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to={`/sites/${id}/analytics`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-sm text-gray-500">Conversation stats</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => triggerCrawl.mutate(site.id)}
          disabled={triggerCrawl.isPending || site.crawl_status === 'crawling'}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-crawl Website
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteSite.isPending}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Site
        </Button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Site</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{site.name}</strong>? This will permanently remove all crawled pages, conversations, and widget configuration. This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteSite.isPending}
                onClick={() => {
                  deleteSite.mutate(site.id, {
                    onSuccess: () => navigate('/sites'),
                  });
                }}
              >
                {deleteSite.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
