import { Loader2 } from 'lucide-react';
import { useCrawlStatus } from '@/hooks/useSites';

export default function CrawlProgress({ siteId }: { siteId: string }) {
  const { data: status } = useCrawlStatus(siteId);

  if (!status) return null;

  const progress = status.total_pages > 0 ? (status.pages_crawled / status.total_pages) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {(status.status === 'crawling' || status.status === 'pending') && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        <span className="text-sm font-medium capitalize">{status.status}</span>
      </div>
      {status.status === 'crawling' && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500">{status.pages_crawled} / {status.total_pages} pages crawled</p>
        </>
      )}
    </div>
  );
}
