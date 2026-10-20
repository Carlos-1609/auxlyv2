export type AuthFormValues = {
  email: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
};

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateAuthForm(mode: 'login' | 'signup' | 'forgot' | 'reset', values: AuthFormValues) {
  const errors: AuthFormErrors = {};

  if (mode !== 'reset' && !isValidEmail(normalizeEmail(values.email))) {
    errors.email = 'Enter a valid email address.';
  }

  if (mode === 'signup' && (!values.name?.trim() || values.name.trim().length > 60)) {
    errors.name = 'Enter your name (up to 60 characters).';
  }

  if (mode !== 'forgot') {
    if (!values.password) errors.password = 'Enter your password.';
    else if (mode !== 'login' && values.password.length < 8) {
      errors.password = 'Use at least 8 characters.';
    }
  }

  if ((mode === 'signup' || mode === 'reset') && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Your passwords don’t match.';
  }

  return errors;
}
