/**
 * Parse DID Auth contract errors
 * @param error - The error to parse
 * @returns Parsed error or null if not recognized
 */
export const parseDidAuthError = (error: unknown) => {
  if (!error) return null;

  // Check if the error contains a message that matches DID Auth error patterns
  const errorString = error.toString();

  // Define error patterns to match against
  const errorPatterns = [
    { pattern: /DidAuth__CredentialVerificationFailed/, message: 'Credential verification failed' },
    { pattern: /DidAuth__DeactivatedDID/, message: 'DID is deactivated' },
    { pattern: /DidAuth__InvalidCredential/, message: 'Invalid credential' },
    { pattern: /DidAuth__InvalidDID/, message: 'Invalid DID provided' },
    { pattern: /DidAuth__InvalidRole/, message: 'Invalid role specified' },
    { pattern: /DidAuth__Unauthorized/, message: 'Unauthorized action' },
    { pattern: /AccessControlUnauthorizedAccount/, message: 'Account is not authorized for this role' },
    { pattern: /OwnableUnauthorizedAccount/, message: 'Account is not the owner' },
  ];

  // Check if the error matches any of our patterns
  for (const { pattern, message } of errorPatterns) {
    if (pattern.test(errorString)) {
      return { message };
    }
  }

  // If no specific pattern matches, return a generic error
  return { message: 'Unknown DID Auth contract error' };
};
