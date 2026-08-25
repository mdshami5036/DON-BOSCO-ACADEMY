import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, School, UserRole } from '../../types/database';
import { db, store } from '../../services/db';
import { auth_firebase, db_firestore, isFirebaseConfigured } from '../../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: Profile | null;
  currentSchool: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole, schoolId?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithFirebase: (email: string, password: string) => Promise<{ success: boolean; user?: Profile; error?: string }>;
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

  // Initialize session from storage or Firebase Auth listener
  useEffect(() => {
    let unsubscribe = () => {};

    async function initAuth() {
      try {
        if (isFirebaseConfigured) {
          unsubscribe = onAuthStateChanged(auth_firebase, async (fbUser) => {
            if (fbUser) {
              try {
                const profileDoc = await getDoc(doc(db_firestore, 'profiles', fbUser.uid));
                if (profileDoc.exists()) {
                  const profileData = profileDoc.data() as Profile;
                  setUser(profileData);
                  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profileData));

                  const donBosco = store.schools.find((s) => s.id === 'sch-don-bosco') || store.schools[0];
                  setCurrentSchool(donBosco);
                  setIsLoading(false);
                  return;
                }
              } catch (e) {
                console.warn('Error loading Firestore profile:', e);
              }
            }
          });
        }

        // Local storage session fallback
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const savedSchool = localStorage.getItem(SCHOOL_STORAGE_KEY);

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser) as Profile;
          setUser(parsedUser);
          if (savedSchool) {
            setCurrentSchool(JSON.parse(savedSchool) as School);
          } else {
            const donBosco = store.schools.find((s) => s.id === 'sch-don-bosco') || store.schools[0];
            setCurrentSchool(donBosco);
          }
        } else {
          // Default admin profile
          const defaultAdmin: Profile = {
            id: 'usr-admin-don-bosco',
            email: 'donboscoacademy002@gmail.com',
            full_name: 'Md. Shami Ahmad',
            role: 'SCHOOL_ADMIN',
            is_super_admin: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(defaultAdmin);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAdmin));

          const donBosco = store.schools.find((s) => s.id === 'sch-don-bosco') || store.schools[0];
          if (donBosco) {
            setCurrentSchool(donBosco);
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
    return () => unsubscribe();
  }, []);

  const loginWithFirebase = async (email: string, password: string): Promise<{ success: boolean; user?: Profile; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase credentials not configured in .env' };
      }

      const credential = await signInWithEmailAndPassword(auth_firebase, email, password);
      const uid = credential.user.uid;

      const profileDoc = await getDoc(doc(db_firestore, 'profiles', uid));
      let foundProfile: Profile;

      if (profileDoc.exists()) {
        foundProfile = profileDoc.data() as Profile;
      } else {
        foundProfile = {
          id: uid,
          email: email.toLowerCase(),
          full_name: credential.user.displayName || email.split('@')[0].toUpperCase(),
          role: 'SCHOOL_ADMIN',
          is_super_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDoc(doc(db_firestore, 'profiles', uid), foundProfile);
      }

      setUser(foundProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundProfile));

      const donBosco = store.schools.find((s) => s.id === 'sch-don-bosco') || store.schools[0];
      setCurrentSchool(donBosco);
      localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(donBosco));

      return { success: true, user: foundProfile };
    } catch (err: any) {
      return { success: false, error: err.message || 'Firebase login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSupabase = loginWithFirebase;

  const login = async (email: string, role: UserRole = 'SCHOOL_ADMIN', schoolId?: string) => {
    setIsLoading(true);
    try {
      const donBosco = store.schools.find((s) => s.id === 'sch-don-bosco') || store.schools[0];
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
    let targetSchool: School | null = store.schools.find((s) => s.id === 'sch-don-bosco') || store.schools[0];

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
      let firebaseUserId = 'usr-admin-' + Date.now();
      if (isFirebaseConfigured && adminData.password) {
        try {
          const cred = await createUserWithEmailAndPassword(auth_firebase, adminData.email, adminData.password);
          firebaseUserId = cred.user.uid;
        } catch (e: any) {
          console.warn('Firebase user creation fallback:', e.message);
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
        id: firebaseUserId,
        email: adminData.email.toLowerCase(),
        full_name: adminData.name,
        role: 'SCHOOL_ADMIN',
        is_super_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db_firestore, 'profiles', firebaseUserId), adminProfile);
        } catch (e) {
          console.warn('Error writing profile to Firestore:', e);
        }
      }

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
    if (isFirebaseConfigured) {
      try {
        await firebaseSignOut(auth_firebase);
      } catch (e) {
        console.warn('Firebase signOut error:', e);
      }
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
        loginWithFirebase,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
