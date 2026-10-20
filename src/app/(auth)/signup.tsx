import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { EmailDivider } from '@/components/auth/email-divider';
import { SocialSignIn } from '@/components/auth/social-sign-in';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Notice } from '@/components/ui/notice';
import { useAuthAction } from '@/hooks/use-auth-action';
import { signInWithProvider, signUpWithEmail } from '@/lib/auth/actions';
import { normalizeEmail, validateAuthForm, type AuthFormErrors } from '@/lib/auth/validation';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const { isBusy, error, run } = useAuthAction();

  function submit() {
    if (isBusy) return;
    const nextErrors = validateAuthForm('signup', { name, email, password, confirmPassword });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    void run(async () => {
      const hasSession = await signUpWithEmail(name, email, password);
      if (hasSession) router.replace('/home');
      else router.replace({ pathname: '/check-email', params: { email: normalizeEmail(email) } });
    });
  }

  return (
    <AuthShell title="Make yourself at home." subtitle="One Auxly account. All your people. All your music services.">
      <SocialSignIn disabled={isBusy} onSignIn={(provider) => { void run(() => signInWithProvider(provider)); }} />
      <EmailDivider />
      {error && <Notice message={error} />}
      <View className="gap-4">
        <FormField label="Your name" value={name} onChangeText={setName} placeholder="What should we call you?" autoCapitalize="words" autoComplete="name" textContentType="name" maxLength={60} error={errors.name} editable={!isBusy} />
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" error={errors.email} editable={!isBusy} />
        <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" password autoComplete="new-password" textContentType="newPassword" hint="At least 8 characters. Make it yours." error={errors.password} editable={!isBusy} />
        <FormField label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="One more time" password autoComplete="new-password" textContentType="newPassword" error={errors.confirmPassword} editable={!isBusy} returnKeyType="go" onSubmitEditing={submit} />
        <Button label={isBusy ? 'Creating your account…' : 'Create account'} loading={isBusy} icon="arrow-right" onPress={submit} />
      </View>
      <Text className="text-center text-sm leading-6 text-muted">
        Already part of the circle? <Link href="/login" className="font-bold text-secondary">Sign in</Link>
      </Text>
    </AuthShell>
  );
}
