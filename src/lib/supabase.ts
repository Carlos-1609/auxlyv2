import 'react-native-url-polyfill/auto';
import '@/lib/auth/pkce-crypto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { sessionStorage } from '@/lib/auth/session-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

function hasConfiguration() {
  if (!url || !key) return false;
  try {
    const parsed = new URL(url);
    return Boolean(parsed.hostname && (parsed.protocol === 'https:' || parsed.protocol === 'http:'));
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = hasConfiguration();
let client: SupabaseClient | undefined;

export class AuthSetupError extends Error {
  constructor() {
    super('Sign-in is being set up. Please try again shortly.');
  }
}

// Lazy initialization lets developers preview screens before setting up Supabase.
export function getSupabase() {
  if (!isSupabaseConfigured || !url || !key) throw new AuthSetupError();
  client ??= createClient(url, key, {
    auth: {
      storage: sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
  return client;
}
