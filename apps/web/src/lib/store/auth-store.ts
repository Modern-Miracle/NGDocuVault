import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { SiweMessage } from 'siwe';

// Cookie configuration
const COOKIE_NAME = 'siwe-auth-state';
const COOKIE_EXPIRATION_DAYS = 7;

export interface AuthState {
  // Authentication state
  isSignedIn: boolean;
  address: string | null;
  did: string | null;
  message: SiweMessage | null;
  signature: string | null;

  // Roles state
  isAdmin: boolean;
  isVerifier: boolean;
  isIssuer: boolean;

  // Status flags
  isLoading: boolean;
  error: Error | null;
}

export interface AuthActions {
  // Sign in/out actions
  setSignIn: (data: { address: string; did: string | null; message: SiweMessage; signature: string }) => void;
  setSignOut: () => void;

  // Role actions
  setRoles: (roles: { isAdmin: boolean; isVerifier: boolean; isIssuer: boolean }) => void;

  // Status actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// Initial state
const initialState: AuthState = {
  isSignedIn: false,
  address: null,
  did: null,
  message: null,
  signature: null,

  isAdmin: false,
  isVerifier: false,
  isIssuer: false,

  isLoading: false,
  error: null,
};

// Create the store with persistence
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Authentication actions
      setSignIn: (data) =>
        set({
          isSignedIn: true,
          address: data.address,
          did: data.did,
          message: data.message,
          signature: data.signature,
          isLoading: false,
          error: null,
        }),

      setSignOut: () => set(initialState),

      // Role actions
      setRoles: (roles) =>
        set({
          isAdmin: roles.isAdmin,
          isVerifier: roles.isVerifier,
          isIssuer: roles.isIssuer,
        }),

      // Status actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: COOKIE_NAME,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const cookieValue = Cookies.get(name);
          return cookieValue ? JSON.parse(cookieValue) : null;
        },
        setItem: (name, value) => {
          Cookies.set(name, JSON.stringify(value), {
            expires: COOKIE_EXPIRATION_DAYS,
            secure: import.meta.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
        },
        removeItem: (name) => {
          Cookies.remove(name);
        },
      })),
      // Only persist these specific parts of the state
      partialize: (state) => ({
        isSignedIn: state.isSignedIn,
        address: state.address,
        did: state.did,
        message: state.message,
        signature: state.signature,
        isAdmin: state.isAdmin,
        isVerifier: state.isVerifier,
        isIssuer: state.isIssuer,
      }),
    }
  )
);

// Selector helpers for components
export const selectIsAuthenticated = (state: AuthState) => state.isSignedIn;
export const selectAuthUser = (state: AuthState) => ({
  address: state.address,
  did: state.did,
});
export const selectAuthRoles = (state: AuthState) => ({
  isAdmin: state.isAdmin,
  isVerifier: state.isVerifier,
  isIssuer: state.isIssuer,
});
export const selectAuthLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
