import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Globe, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSites } from '@/hooks/useSites';
import type { RootState } from '@/store/store';

export default function DashboardHome() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: sites } = useSites();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name || 'there'}!</h1>
        <p className="text-gray-500 mt-1">Manage your AI voice widgets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sites?.length || 0}</p>
              <p className="text-sm text-gray-500">Active Sites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sites?.filter((s) => s.crawl_status === 'completed').length || 0}</p>
              <p className="text-sm text-gray-500">Sites Ready</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-center">
            <Link to="/sites/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add New Site
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {sites && sites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Sites</h2>
          <div className="space-y-2">
            {sites.slice(0, 5).map((site) => (
              <Link
                key={site.id}
                to={`/sites/${site.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{site.name}</p>
                    <p className="text-xs text-gray-500">{site.url}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 capitalize">{site.crawl_status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
