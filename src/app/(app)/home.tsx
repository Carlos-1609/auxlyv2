import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { Screen } from '@/components/ui/screen';
import { Wordmark } from '@/components/wordmark';
import { colors } from '@/constants/theme';
import { useAuthAction } from '@/hooks/use-auth-action';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const { isBusy, error, run } = useAuthAction();
  const fullName = session?.user.user_metadata.full_name;
  const name = typeof fullName === 'string' ? fullName.trim().split(/\s+/)[0].slice(0,40) : '';

  return (
    <Screen>
      <Wordmark />
      <View className="mx-auto w-full max-w-2xl flex-1 justify-center gap-6 py-12">
        <Text className="text-xs font-bold tracking-[2.5px] text-secondary">YOU’RE IN THE CIRCLE</Text>
        <Text accessibilityRole="header" className="text-[40px] font-extrabold leading-[46px] tracking-tight text-foreground">
          {name ? `Hey, ${name}.` : 'Welcome to Auxly.'}{'\n'}Let’s find your sound.
        </Text>
        <Text className="text-base leading-7 text-muted">You’re signed in{session?.user.email ? ` as ${session.user.email}` : ''}.</Text>
        <View className="gap-4 rounded-3xl border border-border bg-surface p-6">
          <Icon name="headphones" size={30} color={colors.primary} />
          <Text className="text-xl font-bold text-foreground">Your taste goes beyond one app.</Text>
          <Text className="text-base leading-7 text-muted">
            Bring your music services together. When it’s time to make a playlist, choose which connected account gets the mix.
          </Text>
          <Button label="Your music services" icon="arrow-right" onPress={() => router.push('/music-services')} />
        </View>
        {error && <Notice message={error} />}
        <Button label={isBusy ? 'Signing out…' : 'Sign out'} variant="secondary" icon="log-out" loading={isBusy} onPress={() => { void run(signOut); }} />
      </View>
    </Screen>
  );
}
