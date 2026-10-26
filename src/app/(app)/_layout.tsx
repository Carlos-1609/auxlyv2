import { Stack } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';
import { PlaylistDraftProvider } from '@/providers/playlist-draft-provider';

export default function SignedInLayout() {
  const { session } = useAuth();

  return (
    // A different user gets a fresh draft; refreshing a token for the same user does not reset it.
    <PlaylistDraftProvider key={session?.user.id ?? 'signed-out'}>
      <Stack screenOptions={{ headerShown: false }} />
    </PlaylistDraftProvider>
  );
}
