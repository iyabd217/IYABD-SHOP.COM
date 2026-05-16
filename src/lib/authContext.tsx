import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { signInWithCustomToken, signOut as signOutFirebase } from 'firebase/auth';
import { auth } from './firebase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  address?: string;
  coins?: number;
  registrationDate?: any;
  division?: string;
  district?: string;
  area?: string;
  street?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (data: { 
    email: string; 
    password: string; 
    name: string; 
    phone: string; 
    address: string;
    division?: string;
    district?: string;
    area?: string;
    street?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateAddress: (address: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  loginWithOTP: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync profile from Supabase
  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/verify');
        const data = await res.json();
        
        if (data.isAdmin) {
          const tRes = await fetch('/api/admin/firebase-token');
          if (tRes.ok) {
            const tData = await tRes.json();
            if (tData.token) {
              await signInWithCustomToken(auth, tData.token);
            }
          }
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user || null;
        setUser(u);
        if (u) {
            await fetchProfile(u.id);
        } else {
            setProfile(null);
        }
        setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
        const u = session?.user || null;
        setUser(u);
        if (u) {
            fetchProfile(u.id);
        } else {
            setLoading(false);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const registerWithEmail = async (data: { 
    email: string; 
    password: string; 
    name: string; 
    phone: string; 
    address: string;
    division?: string;
    district?: string;
    area?: string;
    street?: string;
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: data.email, 
        password: data.password,
        options: { data: { name: data.name } }
    });
    if (authError || !authData.user) throw authError;

    // Create Supabase User Profile
    const userProfile: UserProfile = {
      uid: authData.user.id,
      email: data.email,
      displayName: data.name,
      photoURL: null,
      phoneNumber: data.phone,
      address: data.address,
      division: data.division,
      district: data.district,
      area: data.area,
      street: data.street,
      coins: 200, // Registration bonus
    };
    
    const { error: profileError } = await supabase.from('users').insert([userProfile]);
    if (profileError) throw profileError;
    
    setProfile(userProfile);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateAddress = async (address: string) => {
    if (user) {
      const { error } = await supabase.from('users').update({ address }).eq('uid', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, address } : null);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
     if (user) {
       const { error } = await supabase.from('users').update(data).eq('uid', user.id);
       if (error) throw error;
       setProfile(prev => prev ? { ...prev, ...data } : null);
     }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        // Authenticate in Firebase explicitly
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (e: any) {
          if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
             try {
                await createUserWithEmailAndPassword(auth, email, password);
             } catch(createErr) {
                console.error("Firebase Auth create error:", createErr);
             }
          } else if (e.code === 'auth/operation-not-allowed') {
             console.warn("Firebase email/password auth is not enabled. Admin functions will operate in degraded mode.");
          } else {
             console.error("Firebase Auth sign in error:", e.message || e);
          }
        }
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Admin Login Error:", err);
      return false;
    }
  };

  const adminLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
    await signOutFirebase(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      loginWithEmail, 
      registerWithEmail,
      logout,
      updateAddress,
      updateProfile,
      isAdmin,
      adminLogin,
      adminLogout,
      loginWithOTP: async () => {},
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
