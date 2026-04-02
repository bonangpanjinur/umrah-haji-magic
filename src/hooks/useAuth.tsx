import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  branchId: string | null;
  isLoading: boolean;
  permissions: Record<string, boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const authHandledRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        authHandledRef.current = true;

        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setRoles([]);
          setPermissions({});
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (authHandledRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role, branch_id')
        .eq('user_id', userId);
      
      let userRoles: AppRole[] = [];
      if (rolesData) {
        userRoles = rolesData.map(r => r.role as AppRole);
        setRoles(userRoles);
        const branchRole = rolesData.find(r => r.branch_id);
        setBranchId(branchRole?.branch_id || null);
      }

      // Fetch permissions for user's roles
      if (userRoles.length > 0) {
        const { data: permData } = await supabase
          .from('role_permissions')
          .select('permission_key, is_enabled, role')
          .in('role', userRoles);

        if (permData) {
          // Merge permissions: if ANY role grants access, it's enabled
          const permMap: Record<string, boolean> = {};
          for (const p of permData) {
            const key = p.permission_key;
            if (p.is_enabled) {
              permMap[key] = true;
            } else if (!(key in permMap)) {
              permMap[key] = false;
            }
          }
          setPermissions(permMap);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setBranchId(null);
    setPermissions({});
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  // Only true admin roles — not all staff
  const isAdmin = (): boolean => {
    return roles.some(role => ['super_admin', 'owner', 'branch_manager'].includes(role));
  };

  // Check if user has a specific permission
  // Super Admin & Owner always have full access
  const hasPermission = (key: string): boolean => {
    if (roles.includes('super_admin') || roles.includes('owner')) return true;
    return permissions[key] === true;
  };

  // Check if user has any staff/admin role (for admin panel access)
  const isStaff = (): boolean => {
    return roles.some(role => ['super_admin', 'owner', 'branch_manager', 'finance', 'sales', 'marketing', 'operational', 'equipment'].includes(role));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        branchId,
        isLoading,
        permissions,
        signUp,
        signIn,
        signOut,
        hasRole,
        isAdmin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
