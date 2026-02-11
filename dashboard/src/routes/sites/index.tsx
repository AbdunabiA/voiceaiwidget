import { Link } from 'react-router-dom';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SiteCard from '@/components/sites/SiteCard';
import { useSites } from '@/hooks/useSites';

export default function SitesList() {
  const { data: sites, isLoading } = useSites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
        <Link to="/sites/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Site
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}

      {sites && sites.length === 0 && (
        <div className="text-center py-16">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No sites yet</h3>
          <p className="text-gray-500 mt-1 mb-4">Add your first website to get started</p>
          <Link to="/sites/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Site
            </Button>
          </Link>
        </div>
      )}

      {sites && sites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
