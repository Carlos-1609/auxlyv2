import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { colors } from '@/constants/theme';
import { completeAuthRedirect, getAuthRedirectUrl } from '@/lib/auth/actions';
import { authErrorMessage } from '@/lib/auth/errors';
import { AuthSetupError } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();
  const { isLoading, beginRecovery } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const query = JSON.stringify(params);

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    const url = new URL(getAuthRedirectUrl());
    const values = JSON.parse(query) as Record<string, string | string[]>;
    for (const name of ['code', 'sb_flow_id', 'token_hash', 'type', 'error', 'error_code']) {
      const value = values[name];
      if (Array.isArray(value)) value.forEach((entry) => url.searchParams.append(name, entry));
      else if (typeof value === 'string') url.searchParams.set(name, value);
    }

    void Promise.resolve().then(() => completeAuthRedirect(url.toString())).then(({ recovery }) => {
      if (!active) return;
      if (recovery) beginRecovery();
      router.replace(recovery ? '/reset-password' : '/home');
    }).catch((caught) => {
      if (!active) return;
      setError(caught instanceof AuthSetupError
        ? authErrorMessage(caught)
        : 'This link couldn’t be used. It may have expired or been opened in a different browser. Please request a new link.');
    });
    return () => { active = false; };
  }, [query, isLoading, beginRecovery]);

  return (
    <AuthShell title={error ? 'Let’s try that again.' : 'Finding your rhythm.'} subtitle={error ? 'Your account is still yours. We just need a fresh link.' : 'Finishing your secure sign-in…'}>
      {error ? (
        <>
          <Notice message={error} />
          <Button label="Back to sign in" onPress={() => router.replace('/login')} />
          <Button label="Request a password reset" variant="secondary" onPress={() => router.replace('/forgot-password')} />
        </>
      ) : (
        <View className="items-center gap-4 py-8" accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted">Just a moment.</Text>
        </View>
      )}
    </AuthShell>
  );
}
