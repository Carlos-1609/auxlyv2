import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <View className="mx-auto w-full max-w-md flex-1 justify-center gap-5 py-12">
        <Text className="text-sm font-bold text-secondary">404 · OFF THE RECORD</Text>
        <Text accessibilityRole="header" className="text-4xl font-extrabold text-foreground">
          This track is missing.
        </Text>
        <Text className="text-base leading-7 text-muted">Let’s get you back to familiar sounds.</Text>
        <Button label="Back to Auxly" icon="arrow-left" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
