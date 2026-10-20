import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { colors } from '@/constants/theme';
import { useAuthAction } from '@/hooks/use-auth-action';
import { resendConfirmation } from '@/lib/auth/actions';
import { isValidEmail } from '@/lib/auth/validation';

export default function CheckEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' && isValidEmail(params.email) ? params.email : '';
  const [remaining, setRemaining] = useState(60);
  const [resent, setResent] = useState(false);
  const { isBusy, error, run } = useAuthAction();

  useEffect(() => {
    if (!remaining) return;
    const timer = setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <AuthShell title="Check your inbox." subtitle="One quick confirmation, then you’re part of the circle.">
      <View className="gap-4 rounded-3xl border border-border bg-surface p-6">
        <Icon name="mail" size={30} color={colors.secondary} />
        <Text className="text-base leading-7 text-foreground">
          {email ? `Look for a confirmation email at ${email}.` : 'Open the confirmation email we sent you.'}
        </Text>
        <Text className="text-sm leading-6 text-muted">
          Follow the link on this device in the same app or browser. If you don’t see it, check your spam folder.
        </Text>
      </View>
      {error && <Notice message={error} />}
      {resent && !error && <Notice tone="success" message="Another confirmation email is on its way if your account still needs verification." />}
      <Button
        label={isBusy ? 'Sending…' : remaining ? `Resend email in ${remaining}s` : 'Resend confirmation email'}
        variant="secondary"
        disabled={remaining > 0 || !email}
        loading={isBusy}
        onPress={() => { void run(async () => { await resendConfirmation(email); setResent(true); setRemaining(60); }); }}
      />
      <Link href="/login" className="py-2 text-center text-sm font-bold text-secondary">Back to sign in</Link>
    </AuthShell>
  );
}
