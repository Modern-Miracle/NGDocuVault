// Display error message
export const getErrorMessage = (error: string) => {
  switch (error) {
    case 'AccessDenied':
      return "You don't have permission to access this resource.";
    case 'CredentialsSignin':
      return 'Sign in failed. Check the details you provided are correct.';
    case 'EmailCreateAccount':
      return 'Could not create an account with this email address.';
    case 'OAuthCallback':
      return 'There was an error with the sign in process.';
    case 'OAuthSignin':
      return 'Could not sign in with this provider.';
    case 'SessionRequired':
      return 'You must be signed in to access this page.';
    default:
      return '';
  }
};
