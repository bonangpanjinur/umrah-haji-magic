import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  requireAuth?: boolean;
  permissionKey?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true,
  permissionKey,
}: ProtectedRouteProps) {
  const { user, roles, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
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

  // Super Admin & Owner bypass all checks
  const isSuperUser = roles.includes('super_admin') || roles.includes('owner');

  // Check permission key first (granular)
  if (permissionKey && !isSuperUser) {
    if (!hasPermission(permissionKey)) {
      // Redirect to admin dashboard if they have admin access, otherwise home
      const hasAdminAccess = roles.some(r => ['branch_manager', 'finance', 'sales', 'marketing', 'operational', 'equipment'].includes(r));
      return <Navigate to={hasAdminAccess ? "/admin" : "/"} replace />;
    }
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && !isSuperUser) {
    const hasAllowedRole = allowedRoles.some(role => roles.includes(role));
    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
