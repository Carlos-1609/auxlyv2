import { Text, View } from 'react-native';

import { WaveLoader } from '@/components/ui/wave-loader';
import { colors } from '@/constants/theme';

export function AppLoadingScreen() {
  return (
    <View testID="app-loading-screen" className="flex-1 items-center justify-center bg-background px-6 py-8">
      <View className="items-center gap-7">
        <View
          className="h-36 w-36 items-center justify-center rounded-full border"
          style={{ backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}1F` }}
        >
          <View
            pointerEvents="none"
            className="absolute h-28 w-28 rounded-full"
            style={{ backgroundColor: `${colors.primary}0A` }}
          />
          <WaveLoader label="Finding your circle" />
        </View>

        <View className="items-center gap-3">
          <Text className="text-4xl font-extrabold tracking-[-1.5px] text-foreground">Auxly</Text>
          <Text className="text-sm text-muted">Finding your circle…</Text>
        </View>
      </View>
    </View>
  );
}
