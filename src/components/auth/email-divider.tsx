import { Text, View } from 'react-native';

export function EmailDivider() {
  return (
    <View className="flex-row items-center gap-4">
      <View className="h-px flex-1 bg-border" />
      <Text className="text-xs text-muted">or continue with email</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
