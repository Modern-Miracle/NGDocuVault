/**
 * Parse DID Registry contract errors
 * @param error - The error to parse
 * @returns Parsed error or null if not recognized
 */
export const parseDidRegistryError = (error: unknown) => {
  if (!error) return null;

  // Check if the error contains a message that matches DID Registry error patterns
  const errorString = error.toString();

  // Define error patterns to match against
  const errorPatterns = [
    { pattern: /DidRegistry__DIDAlreadyRegistered/, message: 'DID is already registered' },
    { pattern: /DidRegistry__DeactivatedDID/, message: 'DID is deactivated' },
    { pattern: /DidRegistry__InvalidDID/, message: 'Invalid DID provided' },
    { pattern: /DidRegistry__Unauthorized/, message: 'Unauthorized action' },
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
  return { message: 'Unknown DID Registry contract error' };
};
