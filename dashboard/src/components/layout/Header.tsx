import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold text-sm">
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium text-gray-700">{user?.full_name || 'User'}</span>
      </div>
    </header>
  );
}
