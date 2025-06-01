import { useAuthStore } from './auth-store';

/**
 * Initialize the auth store
 * This helps ensure that the persisted state from cookies is properly loaded
 * before any components attempt to access the auth state.
 *
 * Call this function at application startup.
 */
export function initializeStore(): void {
  // This will trigger the state hydration from cookies
  const state = useAuthStore.getState();

  if (process.env.NODE_ENV === 'development') {
    console.log('Auth store initialized with state:', {
      isSignedIn: state.isSignedIn,
      hasAddress: !!state.address,
      hasDid: !!state.did,
      roles: {
        isAdmin: state.isAdmin,
        isIssuer: state.isIssuer,
        isVerifier: state.isVerifier,
      },
    });
  }
}

// Export a ready-to-use instance of the store
export const authStore = useAuthStore;
