import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Site, SiteMap, CrawlStatus, AnalyticsData, WidgetConfig } from '@/types';

export function useSites() {
  return useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data } = await api.get('/sites');
      return data;
    },
  });
}

export function useSite(id: string) {
  return useQuery<Site>({
    queryKey: ['sites', id],
    queryFn: async () => {
      const { data } = await api.get(`/sites/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSiteMap(id: string) {
  return useQuery<SiteMap>({
    queryKey: ['siteMap', id],
    queryFn: async () => {
      const { data } = await api.get(`/sites/${id}/map`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCrawlStatus(id: string, enabled = true) {
  return useQuery<CrawlStatus>({
    queryKey: ['crawlStatus', id],
    queryFn: async () => {
      const { data } = await api.get(`/crawl/${id}/status`);
      return data;
    },
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'crawling' || status === 'pending' ? 2000 : false;
    },
  });
}

export function useAnalytics(id: string) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', id],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useWidgetConfig(id: string) {
  return useQuery<WidgetConfig>({
    queryKey: ['widgetConfig', id],
    queryFn: async () => {
      const { data } = await api.get(`/sites/${id}/widget-config`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      await api.delete(`/sites/${siteId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { url: string; name: string }) => {
      const { data: site } = await api.post('/sites', data);
      return site as Site;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });
}

export function useTriggerCrawl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data } = await api.post(`/crawl/${siteId}`);
      return data;
    },
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: ['crawlStatus', siteId] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      siteId,
      sectionId,
      data,
    }: {
      siteId: string;
      sectionId: string;
      data: { heading?: string; content_summary?: string; section_id?: string };
    }) => {
      await api.put(`/sites/${siteId}/map/sections/${sectionId}`, data);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['siteMap', vars.siteId] });
    },
  });
}

export function useUpdateWidgetConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, data }: { siteId: string; data: Partial<WidgetConfig> }) => {
      const { data: config } = await api.put(`/sites/${siteId}/widget-config`, data);
      return config;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['widgetConfig', vars.siteId] });
    },
  });
}
