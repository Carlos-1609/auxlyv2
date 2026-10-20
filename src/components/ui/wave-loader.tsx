import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Platform, View } from 'react-native';

import { colors } from '@/constants/theme';

// Different peaks, speeds, and start times keep the bars from moving in lockstep.
const bars = [
  { color: colors.primary, rest: 0.28, peak: 0.8, duration: 310, delay: 0 },
  { color: colors.warning, rest: 0.46, peak: 1, duration: 390, delay: 85 },
  { color: colors.secondary, rest: 0.7, peak: 0.96, duration: 270, delay: 170 },
  { color: colors.warning, rest: 0.4, peak: 0.9, duration: 350, delay: 255 },
  { color: colors.primary, rest: 0.24, peak: 0.74, duration: 440, delay: 340 },
] as const;

function useWaveAnimationEnabled() {
  // Stay still until the preference is known, including during static rendering.
  const [reduceMotion, setReduceMotion] = useState(true);
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    const motionSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (!active) return;
      preferenceChanged = true;
      setReduceMotion(enabled);
    });
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (active) setIsForeground(state === 'active');
    });

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active && !preferenceChanged) setReduceMotion(enabled);
    }).catch(() => {
      // Keep the static equalizer if the platform cannot read the preference.
    });

    return () => {
      active = false;
      motionSubscription?.remove();
      appStateSubscription?.remove();
    };
  }, []);

  return isForeground && !reduceMotion;
}

function WaveBar({ bar, animate, index }: { bar: typeof bars[number]; animate: boolean; index: number }) {
  const [level] = useState(() => new Animated.Value(bar.rest));

  useEffect(() => {
    level.setValue(bar.rest);
    if (!animate) return;

    const timing = {
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
      isInteraction: false,
    };
    const animation = Animated.sequence([
      Animated.delay(bar.delay),
      Animated.loop(Animated.sequence([
        Animated.timing(level, { ...timing, toValue: bar.peak, duration: bar.duration }),
        Animated.timing(level, { ...timing, toValue: bar.rest, duration: bar.duration + 100 }),
      ])),
    ]);

    animation.start();
    return () => animation.stop();
  }, [animate, bar, level]);

  return (
    <Animated.View
      testID={`wave-loader-bar-${index}`}
      style={{
        width: 8,
        height: 56,
        borderRadius: 4,
        backgroundColor: bar.color,
        transform: [{ scaleY: level }],
      }}
    />
  );
}

export function WaveLoader({ label = 'Loading' }: { label?: string }) {
  const animate = useWaveAnimationEnabled();

  return (
    <View
      testID="wave-loader"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      aria-busy
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
        style={{ height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}
      >
        {bars.map((bar, index) => <WaveBar key={index} bar={bar} animate={animate} index={index} />)}
      </View>
    </View>
  );
}
