import { AuthSetupError } from '@/lib/supabase';

export class AuthCancelledError extends Error {}

export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthSetupError) return error.message;
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  switch (code) {
    case 'invalid_credentials': return 'That email and password don’t match. Please try again.';
    case 'email_not_confirmed': return 'Check your inbox and confirm your email before signing in.';
    case 'weak_password': return 'Choose a stronger password with at least 8 characters.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': return 'Too many attempts. Please wait a moment and try again.';
    case 'otp_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found': return 'This sign-in link has expired. Request a new one.';
    case 'provider_disabled': return 'This sign-in option isn’t available yet. Please try another method.';
    case 'email_address_invalid': return 'Enter a valid email address.';
    case 'email_address_not_authorized': return 'Email delivery isn’t available for this address yet. Try another sign-in method.';
    case 'same_password': return 'Choose a password different from your current one.';
    case 'user_already_exists': return 'Try signing in, or reset your password if you need help.';
    default: return 'We couldn’t complete that request. Check your connection and try again.';
  }
}
