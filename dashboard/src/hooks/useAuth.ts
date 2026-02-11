import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { setCredentials, logout as logoutAction } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    const { data: tokenData } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', tokenData.access_token);
    const { data: userData } = await api.get('/auth/me');
    dispatch(setCredentials({ user: userData, token: tokenData.access_token }));
    navigate('/sites');
  };

  const register = async (email: string, password: string, fullName: string) => {
    await api.post('/auth/register', { email, password, full_name: fullName });
    await login(email, password);
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  return { user, isAuthenticated, login, register, logout };
}
