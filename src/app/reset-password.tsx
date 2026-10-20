import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Notice } from '@/components/ui/notice';
import { useAuthAction } from '@/hooks/use-auth-action';
import { updatePassword } from '@/lib/auth/actions';
import { validateAuthForm, type AuthFormErrors } from '@/lib/auth/validation';
import { useAuth } from '@/providers/auth-provider';

export default function ResetPasswordScreen() {
  const { session, isRecovering, finishRecovery, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const { isBusy, error, run } = useAuthAction();

  if (!session || !isRecovering) {
    return (
      <AuthShell title="A fresh start." subtitle="Open a valid password reset link to choose a new password.">
        <Text className="text-base leading-7 text-muted">If you refreshed this page or your link expired, request a new one.</Text>
        <Button label="Send me a reset link" icon="mail" onPress={() => router.replace('/forgot-password')} />
      </AuthShell>
    );
  }

  function submit() {
    if (isBusy) return;
    const nextErrors = validateAuthForm('reset', { email: '', password, confirmPassword });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    void run(async () => {
      await updatePassword(password);
      finishRecovery();
      router.replace('/home');
    });
  }

  return (
    <AuthShell
      title="Back in the groove."
      subtitle="Choose a new password and get back to your circle."
      onBack={() => { void run(async () => { await signOut(); router.replace('/login'); }); }}
    >
      <View className="gap-4">
        <FormField label="New password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" password autoComplete="new-password" textContentType="newPassword" error={errors.password} editable={!isBusy} />
        <FormField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="One more time" password autoComplete="new-password" textContentType="newPassword" error={errors.confirmPassword} editable={!isBusy} returnKeyType="go" onSubmitEditing={submit} />
        {error && <Notice message={error} />}
        <Button label={isBusy ? 'Saving your password…' : 'Save new password'} loading={isBusy} icon="arrow-right" onPress={submit} />
      </View>
    </AuthShell>
  );
}
