import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  isRecovering: boolean;
  sessionError: string | null;
  beginRecovery(): void;
  finishRecovery(): void;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  // Static HTML cannot know the browser's saved session. Always start behind the
  // loading screen so hydration never flashes the signed-out welcome page.
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const beginRecovery = useCallback(() => setIsRecovering(true), []);
  const finishRecovery = useCallback(() => setIsRecovering(false), []);
  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut({ scope: 'local' });
    if (error) throw error;
  }, []);

  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;
    const supabase = isSupabaseConfigured ? getSupabase() : null;
    const subscription = supabase?.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      receivedAuthEvent = true;
      setSession(nextSession);
      setSessionError(null);
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
      if (event === 'SIGNED_OUT') setIsRecovering(false);
    }).data.subscription;

    // Listen first so a late storage read cannot overwrite a newly signed-in session.
    // An unconfigured preview resolves the same loading boundary without an auth request.
    const initialSession = supabase?.auth.getSession() ?? Promise.resolve({ data: { session: null }, error: null });
    void initialSession.then(({ data, error }) => {
      if (!active) return;
      if (error) throw error;
      if (!receivedAuthEvent) setSession(data.session);
    }).catch(() => {
      if (active) setSessionError('We couldn’t restore your session. Please sign in again.');
    }).finally(() => { if (active) setIsLoading(false); });

    const updateRefresh = (state: string) => {
      if (state === 'active') supabase?.auth.startAutoRefresh();
      else supabase?.auth.stopAutoRefresh();
    };
    const appState = supabase && Platform.OS !== 'web' ? AppState.addEventListener('change', updateRefresh) : null;
    if (Platform.OS !== 'web') updateRefresh(AppState.currentState);

    return () => {
      active = false;
      subscription?.unsubscribe();
      appState?.remove();
      if (Platform.OS !== 'web') supabase?.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      session, isLoading, isRecovering, sessionError,
      beginRecovery, finishRecovery, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider.');
  return auth;
}
