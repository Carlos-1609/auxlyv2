// Music-service authorization is independent of Supabase's login identities.
export type MusicProvider = 'spotify' | 'apple-music';

export type ConnectedMusicAccount = {
  id: string;
  userId: string;
  provider: MusicProvider;
  providerAccountId: string;
  displayName: string;
};

export type PlaylistCreationInput = {
  roomId: string;
  name: string;
  // Select a specific connection, not just a provider or the user's login method.
  destinationConnectionId: ConnectedMusicAccount['id'];
};
