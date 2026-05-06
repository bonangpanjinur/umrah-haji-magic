import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile } from '@/types/database';
import { sortRoles } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  branchId: string | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isAgent: () => boolean;
  isCustomer: () => boolean;
  isSuperAdmin: () => boolean;
  hasPermission: (permissionKey: string) => boolean;
  permissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
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
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      // Skip if onAuthStateChange already handled this
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
        userRoles = sortRoles(rolesData.map(r => r.role as AppRole));
        setRoles(userRoles);
        const branchRole = rolesData.find(r => r.branch_id);
        setBranchId(branchRole?.branch_id || null);
      }

      // Fetch permissions for the user's roles
      if (userRoles.length > 0) {
        const { data: permData } = await (supabase as any)
          .from('role_permissions')
          .select('permission_key, is_enabled')
          .in('role', userRoles)
          .eq('is_enabled', true);
        if (permData) {
          setPermissions(Array.from(new Set(permData.map((p: any) => p.permission_key))));
        } else {
          setPermissions([]);
        }
      } else {
        setPermissions([]);
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
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    // All roles except 'customer' are considered admin/staff
    return roles.length > 0 && !roles.every(role => role === 'customer');
  };

  const isSuperAdmin = (): boolean => {
    return roles.includes('super_admin');
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
        signUp,
        signIn,
        signOut,
        hasRole,
        isAdmin,
        isSuperAdmin,
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
