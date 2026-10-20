import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Wordmark } from '@/components/wordmark';
import { colors } from '@/constants/theme';

export function AuthShell({ title, subtitle, children, onBack }: PropsWithChildren<{ title: string; subtitle: string; onBack?: () => void }>) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Screen>
        <View className="flex-row items-center justify-between">
          <Wordmark />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Auxly"
            onPress={onBack ?? (() => router.replace('/'))}
            className="min-h-11 min-w-11 items-center justify-center rounded-full border border-border"
          >
            <Icon name="arrow-left" size={19} color={colors.foreground} />
          </Pressable>
        </View>
        <View className="flex-1 justify-center py-10 sm:py-14">
          <View className="mx-auto w-full max-w-[440px] gap-6">
            <View className="gap-3">
              <Text className="text-xs font-bold tracking-[2.5px] text-secondary">YOUR PEOPLE. YOUR SOUND.</Text>
              <Text accessibilityRole="header" className="text-[38px] font-extrabold leading-[43px] tracking-[-1.5px] text-foreground">
                {title}
              </Text>
              <Text className="text-base leading-7 text-muted">{subtitle}</Text>
            </View>
            {children}
          </View>
        </View>
        <View className="mx-auto w-full max-w-[440px] flex-row items-start gap-2 border-t border-border pt-5">
          <Icon name="headphones" size={14} color={colors.muted} />
          <Text className="flex-1 text-xs leading-5 text-muted">
            Your music accounts come later. Connect one or more services after signing in.
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
