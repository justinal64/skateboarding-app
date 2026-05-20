import { getErrorMessage, getUserFriendlyError } from '@/utils/errors';

describe('getErrorMessage', () => {
  it('returns the message from an Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('stringifies a plain string', () => {
    expect(getErrorMessage('something broke')).toBe('something broke');
  });

  it('stringifies a number', () => {
    expect(getErrorMessage(42)).toBe('42');
  });

  it('stringifies null', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  it('stringifies undefined', () => {
    expect(getErrorMessage(undefined)).toBe('undefined');
  });
});

describe('getUserFriendlyError', () => {
  const cases: [string, string][] = [
    ['auth/email-already-in-use', 'This email is already registered.'],
    ['auth/wrong-password', 'Incorrect password.'],
    ['auth/user-not-found', 'No account found with this email.'],
    ['auth/weak-password', 'Password must be at least 6 characters.'],
    ['auth/invalid-email', 'Please enter a valid email address.'],
    ['auth/too-many-requests', 'Too many attempts. Please try again later.'],
    ['auth/network-request-failed', 'Network error. Check your connection.'],
  ];

  it.each(cases)('maps %s to the correct message', (code, expected) => {
    expect(getUserFriendlyError(new Error(code))).toBe(expected);
  });

  it('returns the fallback for an unrecognised error code', () => {
    expect(getUserFriendlyError(new Error('auth/unknown-error'))).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('returns the fallback for a non-Error value', () => {
    expect(getUserFriendlyError('totally unexpected')).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
