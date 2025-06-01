/**
 * Parse DID Issuer contract errors
 * @param error - The error to parse
 * @returns Parsed error or null if not recognized
 */
export const parseDidIssuerError = (error: unknown) => {
  if (!error) return null;

  // Check if the error contains a message that matches DID Issuer error patterns
  const errorString = error.toString();

  // Define error patterns to match against
  const errorPatterns = [
    { pattern: /DidIssuer__CredentialAlreadyIssued/, message: 'Credential has already been issued' },
    { pattern: /DidIssuer__InvalidSubject/, message: 'Invalid subject provided' },
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
  return { message: 'Unknown DID Issuer contract error' };
};
