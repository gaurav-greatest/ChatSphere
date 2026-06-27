import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCredentials, logout } from '@/features/auth/authSlice';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      // If we don't have an access token but we aren't marked authenticated, try to refresh
      if (!accessToken) {
        try {
          const { data } = await api.post('/auth/refresh');
          dispatch(setCredentials(data.data));
        } catch (error) {
          dispatch(logout());
        }
      }
      setChecking(false);
    };

    if (!isAuthenticated) {
      checkAuth();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, accessToken, dispatch]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto" />
          <p className="text-surface-300 text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
