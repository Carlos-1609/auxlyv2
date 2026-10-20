import { DarkTheme } from 'expo-router';

import colors from '@/theme/colors.json';

// The same tokens power Tailwind classes and components that need color props.
export { colors };

export const brandGradient = [colors.primary, colors.secondary] as const;

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.foreground,
    border: colors.border,
    notification: colors.info,
  },
};
