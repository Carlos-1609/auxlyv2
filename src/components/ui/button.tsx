import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { brandGradient, colors } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ComponentProps<typeof Icon>['name'];
  loading?: boolean;
};

export function Button({ label, variant = 'primary', icon, disabled, loading, ...props }: ButtonProps) {
  const primary = variant === 'primary';
  const unavailable = Boolean(disabled || loading);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...props.accessibilityState, disabled: unavailable, busy: Boolean(loading) }}
      aria-disabled={unavailable}
      aria-busy={Boolean(loading)}
      disabled={unavailable}
      className={`min-h-14 justify-center overflow-hidden rounded-2xl active:opacity-80 ${
        primary ? 'bg-primary' : 'border border-border bg-surface'
      } ${disabled && !loading ? 'opacity-40' : ''}`}
    >
      {primary && (
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      <View className="flex-row items-center justify-center gap-3 px-6 py-4">
        <Text className={`text-base font-bold ${primary ? 'text-on-accent' : 'text-foreground'}`}>
          {label}
        </Text>
        {loading && <ActivityIndicator size="small" color={primary ? colors['on-accent'] : colors.foreground} />}
        {icon && !loading && (
          <Icon name={icon} size={18} color={primary ? colors['on-accent'] : colors.foreground} />
        )}
      </View>
    </Pressable>
  );
}
