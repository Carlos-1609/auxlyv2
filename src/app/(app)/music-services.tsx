import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Wordmark } from '@/components/wordmark';
import { colors } from '@/constants/theme';

export default function MusicServicesScreen() {
  return (
    <Screen>
      <Wordmark />
      <View className="mx-auto w-full max-w-2xl flex-1 justify-center gap-6 py-12">
        <Text className="text-xs font-bold tracking-[2.5px] text-secondary">ALL YOUR MUSIC, IN ONE CIRCLE</Text>
        <Text accessibilityRole="header" className="text-4xl font-extrabold tracking-tight text-foreground">Your music services.</Text>
        <Text className="text-base leading-7 text-muted">
          Your Auxly login is separate from your music. You’ll be able to connect multiple accounts and choose where each playlist is saved.
        </Text>
        <View className="gap-4 rounded-3xl border border-border bg-surface p-6">
          <Icon name="music" size={30} color={colors.secondary} />
          <Text className="text-xl font-bold text-foreground">Music connections are up next.</Text>
          <Text className="text-base leading-7 text-muted">No music accounts are connected yet. Spotify and Apple Music connections are coming in the next step.</Text>
          <View className="gap-3">
            {['Spotify', 'Apple Music'].map((service) => (
              <View key={service} className="flex-row items-center justify-between rounded-2xl border border-border px-4 py-4">
                <Text className="font-semibold text-foreground">{service}</Text>
                <Text className="text-xs text-muted">Coming next</Text>
              </View>
            ))}
          </View>
        </View>
        <Button label="Back to your circle" variant="secondary" icon="arrow-left" onPress={() => router.replace('/home')} />
      </View>
    </Screen>
  );
}
