import { refreshToken } from './refreshToken';
import { getRefreshToken } from '../utils';

/**
 * Refresh the token and redirect to the specified URL
 * This is used when a user has a refresh token but no auth token
 *
 * @param redirectUrl The URL to redirect to after refreshing the token
 * @param navigate Navigation function (from react-router-dom)
 */
export async function refreshAndRedirect(redirectUrl: string = '/', navigate: (url: string) => void): Promise<void> {
  try {
    // Prevent redirect loops - don't redirect back to login or refresh pages
    const safeRedirectUrl =
      redirectUrl.startsWith('/auth/signin') || redirectUrl.startsWith('/auth/refresh') ? '/' : redirectUrl;

    // Get the refresh token from localStorage
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
      // No refresh token, redirect to login
      navigate(`/auth/signin?redirect=${encodeURIComponent(safeRedirectUrl)}`);
      return;
    }

    try {
      // Attempt to refresh the token
      const user = await refreshToken();

      if (!user) {
        throw new Error('Failed to refresh token');
      }

      // Token refreshed successfully, redirect to the original URL
      navigate(safeRedirectUrl);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Refresh failed, redirect to login
      navigate(`/auth/signin?redirect=${encodeURIComponent(safeRedirectUrl)}`);
    }
  } catch (error) {
    console.error('Error in refreshAndRedirect action:', error);
    // Something went wrong, redirect to login
    navigate('/auth/signin');
  }
}
