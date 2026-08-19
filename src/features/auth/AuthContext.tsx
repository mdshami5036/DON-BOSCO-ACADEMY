import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, School, UserRole } from '../../types/database';
import { db, store } from '../../services/db';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  currentSchool: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole, schoolId?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; user?: Profile; error?: string }>;
  registerSchool: (schoolData: any, adminData: any) => Promise<{ success: boolean; school?: School; error?: string }>;
  switchSchool: (schoolId: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'educloud_auth_user';
const SCHOOL_STORAGE_KEY = 'educloud_auth_school';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from storage or Supabase
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (profile) {
              setUser(profile as Profile);
              // Fetch user's school
              const { data: member } = await supabase
                .from('school_members')
                .select('school:schools(*)')
                .eq('user_id', profile.id)
                .single();

              if (member && (member as any).school) {
                setCurrentSchool((member as any).school as School);
              }
              setIsLoading(false);
              return;
            }
          }
        }

        // Local storage session fallback
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const savedSchool = localStorage.getItem(SCHOOL_STORAGE_KEY);

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Default initial login as Don Bosco Academy School Admin
          const defaultAdmin: Profile = {
            id: 'usr-admin-don-bosco',
            email: 'donboscoacademy002@gmail.com',
            full_name: 'Md. Shami Ahmad',
            role: 'SCHOOL_ADMIN',
            is_super_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(defaultAdmin);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAdmin));
        }

        if (savedSchool) {
          setCurrentSchool(JSON.parse(savedSchool));
        } else {
          const donBosco = store.schools.find(s => s.id === 'sch-don-bosco') || store.schools[0];
          setCurrentSchool(donBosco);
          if (donBosco) {
            localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(donBosco));
          }
        }
      } catch (err) {
        console.error('Error initializing auth', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; user?: Profile; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase credentials not configured in .env' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      let foundProfile: Profile | null = null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        foundProfile = profile as Profile;
        setUser(foundProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true, user: foundProfile };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, role: UserRole = 'SCHOOL_ADMIN', schoolId?: string) => {
    setIsLoading(true);
    try {
      const donBosco = store.schools.find(s => s.id === 'sch-don-bosco') || store.schools[0];
      const profile: Profile = {
        id: 'usr-' + Date.now(),
        email: email.toLowerCase(),
        full_name: email.split('@')[0].toUpperCase(),
        role,
        is_super_admin: role === 'SUPER_ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(profile);
      setCurrentSchool(donBosco);

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(donBosco));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const demoLoginAs = async (role: UserRole) => {
    let email = 'donboscoacademy002@gmail.com';
    let fullName = 'Md. Shami Ahmad';
    let targetSchool: School | null = store.schools.find(s => s.id === 'sch-don-bosco') || store.schools[0];

    if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') {
      email = 'donboscoacademy002@gmail.com';
      fullName = 'Md. Shami Ahmad';
    } else if (role === 'TEACHER') {
      email = 'teacher@donboscoacademy.edu.in';
      fullName = 'Rajesh Kumar Jha';
    } else if (role === 'STUDENT') {
      email = 'student@donboscoacademy.edu.in';
      fullName = 'Aman Kumar Singh';
    } else if (role === 'PARENT') {
      email = 'parent@donboscoacademy.edu.in';
      fullName = 'Ramesh Singh';
    }

    const profile: Profile = {
      id: 'usr-demo-' + role.toLowerCase(),
      email,
      full_name: fullName,
      role,
      is_super_admin: role === 'SUPER_ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));

    if (targetSchool) {
      setCurrentSchool(targetSchool);
      localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(targetSchool));
    }
  };

  const registerSchool = async (schoolData: any, adminData: any) => {
    setIsLoading(true);
    try {
      // 1. If Supabase is configured, create real auth user
      let supabaseUserId = 'usr-admin-' + Date.now();
      if (isSupabaseConfigured && adminData.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: adminData.email,
          password: adminData.password,
          options: {
            data: {
              full_name: adminData.name,
              role: 'SCHOOL_ADMIN',
            },
          },
        });
        if (authError) throw authError;
        if (authData.user) {
          supabaseUserId = authData.user.id;
        }
      }

      const createdSchool = await db.createSchool({
        name: schoolData.name,
        slug: schoolData.slug || schoolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        email: schoolData.email,
        phone: schoolData.phone,
        address: schoolData.address,
        city: schoolData.city,
        state: schoolData.state,
        country: schoolData.country,
        principal_name: schoolData.principal_name,
        logo_url: schoolData.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        subscription_plan_id: schoolData.subscription_plan_id || 'plan-starter',
      });

      const adminProfile: Profile = {
        id: supabaseUserId,
        email: adminData.email.toLowerCase(),
        full_name: adminData.name,
        role: 'SCHOOL_ADMIN',
        is_super_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(adminProfile);
      setCurrentSchool(createdSchool);

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminProfile));
      localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(createdSchool));

      await db.logAudit({
        school_id: createdSchool.id,
        user_email: adminData.email,
        action: 'REGISTER_SCHOOL',
        resource_type: 'SCHOOL',
        resource_id: createdSchool.id,
        details: { school_name: createdSchool.name, admin_email: adminData.email },
      });

      return { success: true, school: createdSchool };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const switchSchool = async (schoolId: string) => {
    const school = await db.getSchoolById(schoolId);
    if (school) {
      setCurrentSchool(school);
      localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(school));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentSchool,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithSupabase,
        registerSchool,
        switchSchool,
        logout,
        demoLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
