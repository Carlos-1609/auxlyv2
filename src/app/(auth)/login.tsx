import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View, type TextInput } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { EmailDivider } from '@/components/auth/email-divider';
import { SocialSignIn } from '@/components/auth/social-sign-in';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Notice } from '@/components/ui/notice';
import { useAuthAction } from '@/hooks/use-auth-action';
import { signInWithEmail, signInWithProvider } from '@/lib/auth/actions';
import { validateAuthForm, type AuthFormErrors } from '@/lib/auth/validation';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const passwordInput = useRef<TextInput>(null);
  const { isBusy, error, run } = useAuthAction();
  const { sessionError } = useAuth();

  function submit() {
    if (isBusy) return;
    const nextErrors = validateAuthForm('login', { email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    void run(async () => {
      await signInWithEmail(email, password);
      router.replace('/home');
    });
  }

  return (
    <AuthShell title={'Your next mix\nstarts here.'} subtitle="Sign in to Auxly. Good company is one step away.">
      <SocialSignIn disabled={isBusy} onSignIn={(provider) => { void run(() => signInWithProvider(provider)); }} />
      <EmailDivider />
      {(error || sessionError) && <Notice message={error || sessionError!} />}
      <View className="gap-4">
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" error={errors.email} editable={!isBusy} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => passwordInput.current?.focus()} />
        <FormField inputRef={passwordInput} label="Password" value={password} onChangeText={setPassword} placeholder="Your password" password autoComplete="current-password" textContentType="password" error={errors.password} editable={!isBusy} returnKeyType="go" onSubmitEditing={submit} />
        <Link href="/forgot-password" className="self-end py-2 text-sm font-semibold text-secondary">Forgot password?</Link>
        <Button label={isBusy ? 'Signing in…' : 'Sign in'} loading={isBusy} icon="arrow-right" onPress={submit} />
      </View>
      <Text className="text-center text-sm leading-6 text-muted">
        New to the circle? <Link href="/signup" className="font-bold text-secondary">Create an account</Link>
      </Text>
    </AuthShell>
  );
}
