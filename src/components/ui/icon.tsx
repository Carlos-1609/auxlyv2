import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';

// Icon-font glyphs are decorative; keep them out of screen-reader labels.
export function Icon(props: ComponentProps<typeof Feather>) {
  return (
    <Feather
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    />
  );
}
