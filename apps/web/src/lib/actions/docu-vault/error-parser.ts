/**
 * Parse DocuVault contract errors
 * @param error - The error to parse
 * @returns Parsed error or null if not recognized
 */
export const parseDocuVaultError = (error: unknown) => {
  if (!error) return null;

  // Check if the error contains a message that matches DocuVault error patterns
  const errorString = error.toString();

  // Define error patterns to match against
  const errorPatterns = [
    { pattern: /DocuVault__AlreadyAdmin/, message: 'Address is already an admin' },
    { pattern: /DocuVault__AlreadyGranted/, message: 'Consent was already granted' },
    { pattern: /DocuVault__AlreadyRegistered/, message: 'Document is already registered' },
    { pattern: /DocuVault__AlreadyVerified/, message: 'Document is already verified' },
    { pattern: /DocuVault__CidMismatch/, message: 'CID does not match' },
    { pattern: /DocuVault__Expired/, message: 'Document is expired' },
    { pattern: /DocuVault__InvalidDate/, message: 'Invalid date provided' },
    { pattern: /DocuVault__InvalidHash/, message: 'Invalid hash provided' },
    { pattern: /DocuVault__InvalidInput/, message: 'Invalid input provided' },
    { pattern: /DocuVault__IsActive/, message: 'Issuer is already active' },
    { pattern: /DocuVault__IssuerRegistered/, message: 'Issuer is already registered' },
    { pattern: /DocuVault__NotActive/, message: 'Issuer is not active' },
    { pattern: /DocuVault__NotAdmin/, message: 'Caller is not an admin' },
    { pattern: /DocuVault__NotAuthorized/, message: 'Caller is not authorized' },
    { pattern: /DocuVault__NotGranted/, message: 'Consent has not been granted' },
    { pattern: /DocuVault__NotHolder/, message: 'Caller is not the document holder' },
    { pattern: /DocuVault__NotIssuer/, message: 'Caller is not the document issuer' },
    { pattern: /DocuVault__NotRegistered/, message: 'Document is not registered' },
    { pattern: /DocuVault__NotVerified/, message: 'Document is not verified' },
    { pattern: /DocuVault__ZeroAddress/, message: 'Zero address provided' },
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
  return { message: 'Unknown contract error' };
};
