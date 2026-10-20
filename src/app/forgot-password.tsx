import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Notice } from '@/components/ui/notice';
import { useAuthAction } from '@/hooks/use-auth-action';
import { requestPasswordReset } from '@/lib/auth/actions';
import { validateAuthForm, type AuthFormErrors } from '@/lib/auth/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const { isBusy, error, run } = useAuthAction();

  function submit() {
    if (isBusy) return;
    const nextErrors = validateAuthForm('forgot', { email });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    void run(async () => { await requestPasswordReset(email); setSent(true); });
  }

  return (
    <AuthShell title="Find your way back." subtitle="It happens. We’ll send you a link to choose a new password.">
      {sent ? (
        <Notice tone="success" message="If an account exists for that address, a password reset link is on its way. Open it on this device, in the same app or browser." />
      ) : (
        <View className="gap-5">
          <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" error={errors.email} editable={!isBusy} returnKeyType="send" onSubmitEditing={submit} />
          {error && <Notice message={error} />}
          <Button label={isBusy ? 'Sending your link…' : 'Send reset link'} loading={isBusy} icon="mail" onPress={submit} />
        </View>
      )}
      <Text className="text-center text-sm text-muted">
        <Link href="/login" className="font-bold text-secondary">Back to sign in</Link>
      </Text>
    </AuthShell>
  );
}
