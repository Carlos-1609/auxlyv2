import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppLoadingScreen } from '@/components/ui/app-loading-screen';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Wordmark } from '@/components/wordmark';
import { brandGradient, colors } from '@/constants/theme';

const feedback = {
  success: { label: 'Success', icon: 'check-circle', message: 'Your mix is ready for a first listen.' },
  warning: { label: 'Warning', icon: 'alert-triangle', message: 'A few tracks need a second look.' },
  error: { label: 'Error', icon: 'alert-circle', message: 'That connection needs another try.' },
  info: { label: 'Info', icon: 'info', message: 'Everyone brings something to the mix.' },
} as const;

type FeedbackTone = keyof typeof feedback;

const brandTokens = ['primary', 'secondary', 'background', 'surface', 'foreground'] as const;

export default function ThemeScreen() {
  const [tone, setTone] = useState<FeedbackTone>('success');
  const selectedFeedback = feedback[tone];

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Wordmark />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Auxly home"
          onPress={() => router.replace('/')}
          className="min-h-11 min-w-11 items-center justify-center rounded-full border border-border active:opacity-60"
        >
          <Icon name="x" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <View className="gap-8 py-10">
        <View className="gap-3">
          <Text className="text-xs font-bold tracking-[2.5px] text-secondary">THE AUXLY FEEL</Text>
          <Text accessibilityRole="header" className="text-4xl font-extrabold tracking-tight text-foreground">
            Warm colors. Loud personality.
          </Text>
          <Text className="max-w-xl text-base leading-7 text-muted">
            Orange energy, a little sunshine, and room for the music to stand out.
          </Text>
        </View>

        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 28, minHeight: 164, justifyContent: 'space-between', gap: 24 }}
        >
          <Icon name="radio" size={26} color={colors['on-accent']} />
          <Text className="text-3xl font-extrabold tracking-tight text-on-accent">Good music connects us.</Text>
        </LinearGradient>

        <View className="gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <View className="gap-2">
            <Text accessibilityRole="header" className="text-lg font-bold text-foreground">A little rhythm while you wait</Text>
            <Text className="text-sm leading-6 text-muted">
              A live preview of our five-bar equalizer. Motion follows your device’s accessibility settings.
            </Text>
          </View>
          <View className="h-[340px] overflow-hidden rounded-2xl border border-border">
            <AppLoadingScreen />
          </View>
        </View>

        <View className="gap-4">
          <Text accessibilityRole="header" className="text-lg font-bold text-foreground">The core palette</Text>
          <View className="flex-row flex-wrap gap-3">
            {brandTokens.map((token) => (
              <View key={token} className="min-w-[130px] flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
                <View style={{ height: 80, backgroundColor: colors[token] }} />
                <View className="gap-1 p-4">
                  <Text className="text-sm font-semibold capitalize text-foreground">{token}</Text>
                  <Text className="text-xs text-muted">{colors[token]}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <View className="gap-2">
            <Text accessibilityRole="header" className="text-lg font-bold text-foreground">A color for every moment</Text>
            <Text className="text-sm leading-6 text-muted">Tap a status to preview its feedback style.</Text>
          </View>
          <View accessibilityRole="tablist" className="flex-row flex-wrap gap-2">
            {(Object.keys(feedback) as FeedbackTone[]).map((key) => (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityState={{ selected: key === tone }}
                aria-selected={key === tone}
                onPress={() => setTone(key)}
                className="min-h-11 flex-row items-center gap-2 rounded-xl border px-3 py-3 active:opacity-70"
                style={{
                  borderColor: key === tone ? colors[key] : colors.border,
                  backgroundColor: key === tone ? `${colors[key]}14` : colors['surface-raised'],
                }}
              >
                <Icon name={feedback[key].icon} size={15} color={colors[key]} />
                <Text className="text-sm font-semibold" style={{ color: colors[key] }}>{feedback[key].label}</Text>
              </Pressable>
            ))}
          </View>
          <View
            accessibilityLiveRegion="polite"
            className="gap-2 rounded-2xl border-l-4 bg-background p-5"
            style={{ borderLeftColor: colors[tone] }}
          >
            <Text className="text-sm font-bold" style={{ color: colors[tone] }}>
              {selectedFeedback.label} · {colors[tone]}
            </Text>
            <Text className="text-base leading-6 text-foreground">{selectedFeedback.message}</Text>
            <Text className="text-xs text-muted">Style preview</Text>
          </View>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <Text accessibilityRole="header" className="text-lg font-bold text-foreground">The finishing touches</Text>
          <Text className="text-sm leading-6 text-muted">
            Soft corners, warm white text, and a bright gradient for the next good thing.
          </Text>
          <View className="gap-3 sm:flex-row">
            <View className="sm:flex-1">
              <Button label="Back to the music" icon="arrow-right" onPress={() => router.replace('/')} />
            </View>
            <View className="sm:flex-1">
              <Button label="Disabled state" variant="secondary" disabled />
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}
