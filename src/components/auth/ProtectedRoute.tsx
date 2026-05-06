import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: AppRole[];
  permission?: string; // Deprecated - kept for compatibility but ignored
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  allowedRoles,
  permission,
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading, isStaff, isAgent, roles, hasPermission } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // /admin shell: only staff (non-customer, non-pure-agent) can enter.
  // Agents have their own /agent panel.
  if (location.pathname.startsWith('/admin')) {
    if (!isStaff()) {
      if (isAgent()) return <Navigate to="/agent" replace />;
      return <Navigate to="/" replace />;
    }
  }

  // Role gate
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = roles.some(role => allowedRoles.includes(role));
    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Permission gate (granular per route)
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
