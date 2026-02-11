import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './routes/login';
import RegisterPage from './routes/register';
import DashboardHome from './routes/index';
import SitesList from './routes/sites/index';
import NewSite from './routes/sites/new';
import SiteOverview from './routes/sites/[id]/index';
import SiteMapEditor from './routes/sites/[id]/sitemap';
import CustomizeWidget from './routes/sites/[id]/customize';
import AnalyticsPage from './routes/sites/[id]/analytics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="sites" element={<SitesList />} />
        <Route path="sites/new" element={<NewSite />} />
        <Route path="sites/:id" element={<SiteOverview />} />
        <Route path="sites/:id/sitemap" element={<SiteMapEditor />} />
        <Route path="sites/:id/customize" element={<CustomizeWidget />} />
        <Route path="sites/:id/analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}
