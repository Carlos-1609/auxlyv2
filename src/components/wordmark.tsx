import { Text, View } from 'react-native';

export function Wordmark() {
  return (
    <View className="flex-row items-center gap-2.5" accessibilityLabel="Auxly">
      <View className="h-7 flex-row items-center gap-1" accessibilityElementsHidden aria-hidden>
        <View className="h-3 w-1 rounded-full bg-secondary" />
        <View className="h-6 w-1 rounded-full bg-primary" />
        <View className="h-4 w-1 rounded-full bg-secondary" />
      </View>
      <Text className="text-2xl font-extrabold tracking-tight text-foreground">Auxly</Text>
    </View>
  );
}
