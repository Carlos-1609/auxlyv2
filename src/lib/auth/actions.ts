import * as AppleAuthentication from 'expo-apple-authentication';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { AuthCancelledError } from '@/lib/auth/errors';
import { parseAuthRedirect } from '@/lib/auth/redirect';
import { normalizeEmail } from '@/lib/auth/validation';
import { getSupabase } from '@/lib/supabase';

export type SignInProvider = 'google' | 'apple';
type CallbackResult = { recovery: boolean };
const exchanges = new Map<string, Promise<CallbackResult>>();

export function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'auxly://auth/callback';
}

export function completeAuthRedirect(url: string): Promise<CallbackResult> {
  const params = parseAuthRedirect(url, getAuthRedirectUrl());
  const fingerprint = JSON.stringify(params);
  const existing = exchanges.get(fingerprint);
  if (existing) return existing;

  // A native deep link and the browser result can arrive together. Exchange each code once.
  const exchange = (async () => {
    const supabase = getSupabase();
    if (params.kind === 'code') {
      let recovery = false;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') recovery = true;
      });
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          params.code, params.flowId ? { flowId: params.flowId } : undefined,
        );
        if (error) throw error;
        return { recovery };
      } finally {
        subscription.unsubscribe();
      }
    }
    const { error } = await supabase.auth.verifyOtp({ token_hash: params.tokenHash, type: params.type });
    if (error) throw error;
    return { recovery: params.type === 'recovery' };
  })();

  exchanges.set(fingerprint, exchange);
  if (exchanges.size > 10) exchanges.delete(exchanges.keys().next().value!);
  return exchange;
}

export async function signInWithProvider(provider: SignInProvider) {
  const supabase = getSupabase();
  if (Platform.OS !== 'web' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error('AUXLY_DEVELOPMENT_BUILD_REQUIRED');
  }

  if (provider === 'apple' && Platform.OS === 'ios' && await AppleAuthentication.isAvailableAsync()) {
    const rawNonce = Crypto.randomUUID();
    const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
    let credential: AppleAuthentication.AppleAuthenticationCredential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        nonce,
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') {
        throw new AuthCancelledError();
      }
      throw error;
    }
    if (!credential.identityToken) throw new Error('Apple did not return a sign-in token.');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple', token: credential.identityToken, nonce: rawNonce,
    });
    if (error) throw error;
    const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
    if (fullName) {
      // Apple shares this only on first authorization. A name-save failure must not undo sign-in.
      await supabase.auth.updateUser({ data: { full_name: fullName } }).catch(() => undefined);
    }
    return;
  }

  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
      ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
    },
  });
  if (error) throw error;
  if (Platform.OS === 'web') return; // Supabase redirects the current browser tab.
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') throw new AuthCancelledError();
  if (result.type !== 'success') throw new Error('Sign-in did not complete.');
  await completeAuthRedirect(result.url);
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email: normalizeEmail(email), password });
  if (error) throw error;
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await getSupabase().auth.signUp({
    email: normalizeEmail(email), password,
    options: { data: { full_name: name.trim() }, emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
  return Boolean(data.session);
}

export async function resendConfirmation(email: string) {
  const { error } = await getSupabase().auth.resend({
    type: 'signup', email: normalizeEmail(email), options: { emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: getAuthRedirectUrl() });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
}
