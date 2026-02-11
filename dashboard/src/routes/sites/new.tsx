import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteCreateSchema, type SiteCreateFormData } from '@/lib/validators';
import { useCreateSite, useTriggerCrawl } from '@/hooks/useSites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import CrawlProgress from '@/components/sites/CrawlProgress';

export default function NewSite() {
  const navigate = useNavigate();
  const createSite = useCreateSite();
  const triggerCrawl = useTriggerCrawl();
  const [siteId, setSiteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteCreateFormData>({ resolver: zodResolver(siteCreateSchema) });

  const onSubmit = async (data: SiteCreateFormData) => {
    try {
      setError('');
      const site = await createSite.mutateAsync(data);
      setSiteId(site.id);
      await triggerCrawl.mutateAsync(site.id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create site');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Site</CardTitle>
          <CardDescription>Enter your website URL and we'll analyze its structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}

          {!siteId ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name</Label>
                <Input id="name" placeholder="My Website" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input id="url" placeholder="https://example.com" {...register('url')} />
                {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={createSite.isPending}>
                {createSite.isPending ? 'Creating...' : 'Analyze Website'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <CrawlProgress siteId={siteId} />
              <Button onClick={() => navigate(`/sites/${siteId}/sitemap`)} className="w-full">
                View Site Map
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
