import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import type { SignInProvider } from '@/lib/auth/actions';

type SocialSignInProps = { disabled: boolean; onSignIn(provider: SignInProvider): void };

export function SocialSignIn({ disabled, onSignIn }: SocialSignInProps) {
  const [nativeApple, setNativeApple] = useState(false);
  useEffect(() => {
    let active = true;
    if (Platform.OS === 'ios') {
      void AppleAuthentication.isAvailableAsync().then((available) => { if (active) setNativeApple(available); });
    }
    return () => { active = false; };
  }, []);

  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        disabled={disabled}
        aria-disabled={disabled}
        onPress={() => onSignIn('google')}
        className={`min-h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 active:opacity-70 ${disabled ? 'opacity-40' : ''}`}
      >
        <FontAwesome name="google" size={19} color="#4285F4" accessible={false} aria-hidden />
        <Text className="text-base font-semibold text-foreground">Continue with Google</Text>
      </Pressable>
      {nativeApple ? (
        <View pointerEvents={disabled ? 'none' : 'auto'} style={{ opacity: disabled ? 0.4 : 1 }}>
          <AppleAuthentication.AppleAuthenticationButton
            accessibilityState={{ disabled }}
            aria-disabled={disabled}
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={16}
            style={{ height: 56, width: '100%' }}
            onPress={() => { if (!disabled) onSignIn('apple'); }}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
          disabled={disabled}
          aria-disabled={disabled}
          onPress={() => onSignIn('apple')}
          className={`min-h-14 flex-row items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 active:opacity-70 ${disabled ? 'opacity-40' : ''}`}
        >
          <FontAwesome name="apple" size={23} color="#000000" accessible={false} aria-hidden />
          <Text className="text-base font-semibold text-black">Continue with Apple</Text>
        </Pressable>
      )}
    </View>
  );
}
