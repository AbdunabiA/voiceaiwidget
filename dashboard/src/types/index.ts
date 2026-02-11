export interface User {
  id: string;
  email: string;
  full_name: string;
  plan: 'free' | 'pro' | 'business';
  created_at: string;
}

export interface Site {
  id: string;
  url: string;
  name: string;
  api_key: string;
  crawl_status: 'pending' | 'crawling' | 'completed' | 'failed';
  created_at: string;
  last_crawled_at: string | null;
}

export interface Section {
  id: string;
  section_id: string;
  heading: string;
  content_summary: string;
  content_raw: string;
  order: number;
}

export interface Page {
  id: string;
  url: string;
  title: string;
  meta_description: string | null;
  crawled_at: string;
  sections: Section[];
}

export interface SiteMap {
  site_id: string;
  site_name: string;
  site_url: string;
  pages: Page[];
}

export interface WidgetConfig {
  id: string;
  site_id: string;
  position: 'bottom-right' | 'bottom-left';
  primary_color: string;
  greeting_message: string;
  supported_languages: string[];
  voice_enabled: boolean;
  avatar_url: string | null;
}

export interface CrawlStatus {
  site_id: string;
  status: string;
  pages_crawled: number;
  total_pages: number;
  started_at: string | null;
}

export interface AnalyticsData {
  total_conversations: number;
  average_messages_per_conversation: number;
  language_breakdown: Record<string, number>;
  top_questions: { question: string; count: number }[];
  total_actions_triggered: number;
}
