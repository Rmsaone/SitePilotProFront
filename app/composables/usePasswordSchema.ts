import { z } from 'zod';

/**
 * Mirrors the backend rule: Password::min(8)->mixedCase()->numbers()->symbols().
 */
export const usePasswordSchema = () => {
  const { t } = useI18n();

  return z.string({ required_error: t('auth.validation.required') })
    .min(8, t('auth.validation.passwordMin'))
    .regex(/[A-Z]/, t('auth.validation.passwordUpper'))
    .regex(/[a-z]/, t('auth.validation.passwordLower'))
    .regex(/\d/, t('auth.validation.passwordNumber'))
    .regex(/[^A-Z0-9]/i, t('auth.validation.passwordSymbol'));
};
