import { Image } from 'expo-image';
import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Wordmark } from '@/components/wordmark';
import { colors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

const steps = [
  {
    number: '01',
    icon: 'headphones',
    title: 'Bring your taste',
    description: 'Connect your music account and bring the tracks you keep coming back to.',
  },
  {
    number: '02',
    icon: 'users',
    title: 'Add your people',
    description: 'Invite your friends. Everyone gets a little space in the mix.',
  },
  {
    number: '03',
    icon: 'shuffle',
    title: 'Find your shared sound',
    description: 'Blend your favorites into one playlist, saved to your chosen music service.',
  },
] as const;

export default function HomeScreen() {
  const [showSteps, setShowSteps] = useState(false);
  const { session, isRecovering } = useAuth();
  if (session) return <Redirect href={isRecovering ? '/reset-password' : '/home'} />;

  return (
    <Screen>
      <View className="flex-row items-center justify-between gap-4">
        <Wordmark />
        <View className="flex-row items-center gap-2 rounded-full border border-border px-3 py-2">
          <View className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <Text className="text-xs font-medium text-muted">Made for your circle</Text>
        </View>
      </View>

      <View className="flex-1 justify-center gap-8 py-8 lg:py-16">
        <View className="flex-col items-center gap-9 lg:flex-row-reverse lg:gap-14">
          <View className="w-full items-center lg:flex-1">
            <View className="w-full max-w-[380px] overflow-hidden rounded-[32px] border border-border bg-black">
              <Image
                source={require('../../assets/images/auxly-logo.png')}
                contentFit="contain"
                accessibilityLabel="Auxly logo: an orange-to-yellow soundwave letter A"
                style={{ width: '100%', aspectRatio: 1 }}
              />
              <View className="absolute bottom-5 left-5 right-5 flex-row items-center justify-center gap-2">
                <Icon name="music" size={13} color={colors.secondary} />
                <Text className="text-xs text-muted">A little more in sync.</Text>
              </View>
            </View>
          </View>

          <View className="w-full gap-5 lg:flex-1">
            <Text className="text-xs font-bold tracking-[2.5px] text-secondary">
              THE SOUND OF YOUR CIRCLE
            </Text>
            <Text
              accessibilityRole="header"
              className="text-[44px] font-extrabold leading-[49px] tracking-[-2px] text-foreground sm:text-[56px] sm:leading-[62px]"
            >
              Different tastes.{'\n'}
              <Text className="text-primary">One great mix.</Text>
            </Text>
            <Text className="max-w-md text-base leading-7 text-muted">
              Your on-repeat tracks. Their hidden gems. A playlist that sounds like all of you.
            </Text>

            <View className="mt-1 flex-row items-center gap-3">
              <View className="flex-row" accessibilityLabel="You and two friends">
                {['Y', 'A', 'J'].map((initial, index) => (
                  <View
                    key={initial}
                    className={`h-9 w-9 items-center justify-center rounded-full border-2 border-background ${
                      index === 0 ? 'bg-primary' : index === 1 ? '-ml-2 bg-secondary' : '-ml-2 bg-info'
                    }`}
                  >
                    <Text className="text-xs font-bold text-on-accent">{initial}</Text>
                  </View>
                ))}
              </View>
              <Text className="flex-1 text-sm leading-5 text-muted">Less passing the aux. More finding your sound.</Text>
            </View>

            <View className="mt-3 gap-3">
              <Button label="Find your circle" icon="arrow-right" onPress={() => router.push('/signup')} />
              <Text className="py-1 text-center text-sm text-muted">
                Already have an account? <Link href="/login" className="font-bold text-secondary">Sign in</Link>
              </Text>
              <Button
                label={showSteps ? 'Hide the steps' : 'How Auxly works'}
                icon={showSteps ? 'chevron-up' : 'arrow-down'}
                accessibilityState={{ expanded: showSteps }}
                aria-expanded={showSteps}
                variant="secondary"
                onPress={() => setShowSteps((current) => !current)}
              />
              <Button
                label="Explore the theme"
                variant="secondary"
                icon="arrow-up-right"
                onPress={() => router.push('/theme')}
              />
            </View>
          </View>
        </View>

        {showSteps && (
          <View className="gap-4 rounded-3xl border border-border bg-surface p-5 sm:flex-row sm:p-6">
            {steps.map((step) => (
              <View key={step.number} className="gap-3 p-2 sm:flex-1">
                <View className="flex-row items-center justify-between">
                  <Icon name={step.icon} size={23} color={colors.primary} />
                  <Text className="text-xs font-bold tracking-widest text-muted">{step.number}</Text>
                </View>
                <Text className="text-base font-bold text-foreground">{step.title}</Text>
                <Text className="text-sm leading-6 text-muted">{step.description}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Text className="text-xs text-muted">GOOD MUSIC. BETTER COMPANY.</Text>
        <Text className="text-xs text-muted">Auxly · The first track</Text>
      </View>
    </Screen>
  );
}
