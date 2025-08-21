'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  type: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  contractor?: {
    id: string;
    business_name: string;
    profile_completed: boolean;
  };
}

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | null;
  logout: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowser();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const processingAuth = useRef(false);

  // React Query를 사용한 profile API 호출
  const { data: userProfile, refetch: refreshProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile> => {
      if (!user?.id) throw new Error('No user ID');
      
      console.log('🔍 Fetching user profile for:', user.id);
      
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const result = await response.json();
      console.log('✅ User profile fetched:', result);
      return result.user;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 15 * 60 * 1000, // 15분
  });

  // 인증 상태 확인
  useEffect(() => {
    const getUser = async () => {
      if (processingAuth.current) {
        console.log('⏸️ Auth processing already in progress...');
        return;
      }
      
      processingAuth.current = true;
      console.log('🔍 Starting user authentication check...');
      setLoading(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check error:', sessionError);
          setUser(null);
          return;
        }

        if (session?.user?.id) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
        } else {
          console.log('ℹ️ No user session found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Authentication check error:', error);
        setUser(null);
      } finally {
        processingAuth.current = false;
        setLoading(false);
        console.log('✅ Authentication check completed');
      }
    };

    getUser();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (processingAuth.current) {
        console.log('⏸️ Auth processing already in progress...');
        return;
      }

      processingAuth.current = true;
      
      try {
        if (session?.user?.id) {
          console.log('✅ User authenticated:', session.user.id);
          setUser(session.user);
        } else {
          console.log('ℹ️ User signed out');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
      } finally {
        processingAuth.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃 처리
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      queryClient.clear(); // React Query 캐시 클리어
      router.push('/');
      console.log('👋 User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile: userProfile || null,
    loading,
    isAuthenticated: !!user && !!userProfile,
    userType: userProfile?.type || null,
    logout,
    refreshProfile: () => refreshProfile(),
  };

  return (
    <AuthContext.Provider value={value}>
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
