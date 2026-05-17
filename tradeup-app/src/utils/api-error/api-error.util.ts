import { PT_BR } from '@/i18n/pt-BR';
import { HttpClientError } from '@/errors/http-client.error';

type MessageMapping = [pattern: string | RegExp, translation: string];

const BACKEND_MESSAGE_MAP: MessageMapping[] = [
  ['The provided credentials are incorrect.', PT_BR.auth.errors.invalidCredentials],
  [/The email address .* is already registered\./, PT_BR.auth.errors.emailAlreadyTaken],
  ['Insufficient BRL balance to complete this trade.', PT_BR.trade.error.insufficientBrl],
  ['Insufficient BTC balance to complete this trade.', PT_BR.trade.error.insufficientBtc],
  [
    'The BTC price quote is currently unavailable. Please try again later.',
    PT_BR.trade.error.quoteUnavailable,
  ],
  [
    'The trade amount is too small and results in a zero value after rounding.',
    PT_BR.trade.error.zeroResult,
  ],
  ['Avatar must not exceed 5 MB.', PT_BR.profile.errors.avatarTooLarge],
  ['Avatar file could not be read as an image.', PT_BR.profile.errors.avatarInvalidFormat],
  ['Avatar dimensions must not exceed 4096px.', PT_BR.profile.errors.avatarInvalidDimensions],
];

function findTranslation(message: string): string | null {
  for (const [pattern, translation] of BACKEND_MESSAGE_MAP) {
    if (typeof pattern === 'string' && message === pattern) return translation;
    if (pattern instanceof RegExp && pattern.test(message)) return translation;
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpClientError)) return fallback;

  const message = error.response?.message;
  if (typeof message !== 'string' || !message.trim()) return fallback;

  if (error.code === 422) {
    return findTranslation(message) ?? message;
  }

  return fallback;
}
