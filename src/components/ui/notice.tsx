import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors } from '@/constants/theme';

export function Notice({ message, tone = 'error' }: { message: string; tone?: 'error' | 'success' | 'info' }) {
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      className="flex-row items-start gap-3 rounded-2xl border bg-surface p-4"
      style={{ borderColor: `${colors[tone]}66` }}
    >
      <Icon name={tone === 'success' ? 'check-circle' : tone === 'error' ? 'alert-circle' : 'info'} size={18} color={colors[tone]} />
      <Text className="flex-1 text-sm leading-6 text-foreground">{message}</Text>
    </View>
  );
}
