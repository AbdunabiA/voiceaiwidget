import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeleteSite } from '@/hooks/useSites';
import type { Site } from '@/types';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  completed: 'success',
  crawling: 'warning',
  pending: 'secondary' as any,
  failed: 'destructive',
};

export default function SiteCard({ site }: { site: Site }) {
  const deleteSite = useDeleteSite();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{site.name}</h3>
                <p className="text-sm text-gray-500">{site.url}</p>
              </div>
            </div>
            <Badge variant={statusVariant[site.crawl_status] || 'secondary'}>{site.crawl_status}</Badge>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {site.last_crawled_at ? `Last crawled: ${new Date(site.last_crawled_at).toLocaleDateString()}` : 'Not crawled yet'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Link to={`/sites/${site.id}`}>
                <Button size="sm" variant="outline">
                  Manage <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Site</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{site.name}</strong>? This will permanently remove all data. This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteSite.isPending}
                onClick={() => {
                  deleteSite.mutate(site.id, {
                    onSuccess: () => setShowConfirm(false),
                  });
                }}
              >
                {deleteSite.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
