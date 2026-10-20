# Auxly authentication setup

The app implements Google, Apple, and email/password authentication using Supabase
Auth. Music-service accounts are separate. Apple sign-in does not connect Apple
Music, and Google sign-in does not connect YouTube Music.

## Current rollout status

- [x] Email/password authentication: verified in the development browser.
- [x] Google sign-in: provider configured and flow verified in the development browser.
- [ ] Apple sign-in: **deferred** until an Apple Developer account is available.
  Keep the existing implementation for later; Apple provider configuration,
  signing setup, and real-device verification are still pending. Email and Google
  are the currently verified sign-in methods; do not treat Apple as release-ready.

## 1. Connect the Supabase project

Create your project in the [Supabase dashboard](https://supabase.com/dashboard).
Copy `.env.example` to `.env`, then fill in the project's URL and publishable key
from its Connect dialog:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

These two values are public client configuration. Never put a service-role key,
database password, Google client secret, Apple `.p8` key, or Apple client secret
in an `EXPO_PUBLIC_` variable. Provider secrets stay in Supabase's dashboard.

Restart Expo after changing environment variables. Without configuration, screens
remain previewable, but submissions show an unavailable-sign-in message and never
pretend to authenticate.

## 2. Configure redirect URLs

In Supabase Authentication → URL Configuration, set your deployed web URL as the
Site URL when available. During local web development it can be
`http://localhost:8081`. Allow these app redirect URLs:

```text
auxly://auth/callback
http://localhost:8081/auth/callback
```

Add the exact callback for your production web origin when you deploy. If you use
a different local port, allow that exact origin too. The same `/auth/callback`
route handles Google/Apple OAuth, email confirmation, and password recovery.
Supabase's optional `sb_flow_id` parameter is preserved during PKCE exchanges.

The `https://YOUR_PROJECT.supabase.co/auth/v1/callback` URL used in Google/Apple
provider dashboards is different: the provider returns to Supabase first;
Supabase then redirects to Auxly. Use the exact URL shown by your project's
provider settings, including your custom Supabase domain if you have one.

## 3. Enable Google

1. Configure your app and consent screen in Google Cloud / Google Auth Platform.
2. Create a **Web application** OAuth client for the Supabase browser flow.
3. Add your Supabase provider callback as an authorized redirect URI.
4. Enable Google in Supabase Authentication → Sign In / Providers and enter that
   client ID and client secret there.
5. Add your test users if the Google consent configuration is in testing mode.

No Google client secret is needed in the mobile app. Google signs the person into
Auxly; it does not grant access to a music library.

Reference: [Supabase Google authentication](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 4. Enable Apple

For native iOS, choose an iOS bundle identifier that belongs to your Apple developer
account, add it as `expo.ios.bundleIdentifier` in `app.json`, and enable Sign in
with Apple for that identifier in Apple's developer portal. Register that
identifier with the Supabase Apple provider as an allowed client ID.

The repository already enables `ios.usesAppleSignIn` and the
`expo-apple-authentication` config plugin. iOS uses Apple's official native button
and sign-in sheet with a random nonce verified by Supabase. If Apple supplies a
name on first sign-in, the app saves it in the user's metadata.

For Apple sign-in on Android/web, also configure an Apple Services ID, website
domain, and the Supabase provider callback URL in the Apple developer portal.
Add the Services ID and generated Apple client secret to Supabase's Apple provider
settings. Keep the signing `.p8` key out of this repository. Apple's OAuth client
secret expires and needs rotation at least every six months.

References: [Supabase Apple authentication](https://supabase.com/docs/guides/auth/social-login/auth-apple)
and [Expo AppleAuthentication](https://docs.expo.dev/versions/v57.0.0/sdk/apple-authentication/).

## 5. Enable email/password

Enable Email in Supabase Auth, keep email confirmation enabled, and set the
minimum password length to at least eight characters to match the app.

The default confirmation and recovery email templates can use their normal
`{{ .ConfirmationURL }}` links. For PKCE, open those links on the same device and
app/browser that requested them. Browser private tabs and different browsers do
not share the verifier. If a recovery page is refreshed, request a new link.

The callback also supports a verified `token_hash` plus `type=email`,
`type=signup`, or `type=recovery` if you intentionally customize the templates;
it never accepts access tokens from a URL fragment.

Supabase's default mail service is restricted and rate limited. Configure your
own SMTP provider to test with arbitrary addresses or send production emails.
Forgot-password responses deliberately do not reveal whether an email exists.

References: [Password auth](https://supabase.com/docs/guides/auth/passwords),
[SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp), and
[email templates](https://supabase.com/docs/guides/auth/auth-email-templates).

## 6. Use a development build for mobile social sign-in

Expo Go cannot own the `auxly://` callback. The app asks you to use a development
build for mobile social sign-in. Email sign-in and UI previews can still be tried
in Expo Go via `npm run start:go`.

`expo-dev-client` and `eas.json` development profiles are included. When ready,
choose your bundle identifier / Android package name and create a development
build with your Expo account:

```sh
npx eas-cli@latest build --profile development --platform ios
# Or: --platform android
npm run dev
```

The `development-simulator` profile is also available for iOS simulators, though
native Apple sign-in should be verified on a physical device. Web testing uses
`npm run web` and does not need a native build.

## How the implementation fits together

- `src/lib/supabase.ts`: one lazily created PKCE client, no admin credentials.
- `src/providers/auth-provider.tsx`: restored sessions, auth events, sign-out, and
  foreground-only native token refresh. Auth callbacks never await other Supabase
  calls from inside the auth-state listener.
- `src/lib/auth/actions.ts`: real Google/Apple/email calls and one-time callback
  exchange. The provider's verified recovery event controls password-reset mode;
  a query parameter alone cannot enable it.
- `src/lib/auth/pkce-crypto.native.ts`: Expo-backed random values and SHA-256 for
  Supabase's S256 PKCE challenge on native Hermes runtimes. This adapter only
  provides the crypto methods needed by authentication, not full Web Crypto.
- `src/lib/auth/session-storage.native.ts`: encrypted SecureStore persistence.
  Large sessions are stored as small chunks with an atomic manifest switch;
  browser sessions use localStorage. Passwords are never persisted by the forms.
- `src/app/_layout.tsx`: the signed-in route group is guarded by a real session.
  These guards are UI navigation rules; future database access must also use RLS.
- `src/app/auth/callback.tsx` and `reset-password.tsx`: validated email/OAuth
  callbacks and recovery-only password updates.

## Multiple music services

`src/types/music.ts` describes future music connections independently of login
identities. A connected account has its own ID and belongs to a Supabase user.
There can be multiple connections per user, including more than one account with
the same provider. Playlist creation takes `destinationConnectionId` so the user
chooses a specific account, rather than the app guessing from the login provider.

When that feature is built, the backend must check ownership of the destination
connection and its playlist-write permission. Store provider refresh tokens only
on the backend and never in a client-readable connections table. No music-service
OAuth or database tables are created by this auth implementation.

## Verify

```sh
npm test
npm run typecheck
npm run lint
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

After configuring real credentials, test email signup/verification, sign-in,
session restoration after restart, sign-out, recovery, OAuth cancellation, Google
on each platform, and native Apple on a physical iPhone. Test the return link
while the app is open and after it was closed. Automated/mocked tests cannot
prove that your provider dashboard settings or Apple provisioning are correct.
