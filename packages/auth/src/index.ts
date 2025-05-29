// Types
export * from './types/client';

// Configuration
export { DEFAULT_CONFIG, createAuthConfig, type AuthConfig } from './config';

// Enhanced Context and Provider
export { EnhancedAuthProvider, useEnhancedAuth as useEnhancedAuthContext, type UserRole, type User } from './contexts/EnhancedAuthContext';

// Legacy Context and Provider (backward compatibility)
export { AuthProvider, useAuthContext } from './contexts/AuthContext';

// Actions
export * from './actions';

// Storage utilities
export { AuthStorage, authStorage } from './utils/storage';
export * from './utils/storage';

// Flow components
export * from './flow';

// Hooks
export { useAuth, type UseAuthOptions } from './hooks/useAuth';
export { useSiweAuth, type UseSiweAuthOptions } from './hooks/useSiweAuth';
export { useEnhancedAuth, type UseEnhancedAuthReturn } from './hooks/useEnhancedAuth';

// Components
export { SiweButton, type SiweButtonProps } from './components/SiweButton';
export { AuthStatus, type AuthStatusProps } from './components/AuthStatus';
export { ProtectedRoute, type ProtectedRouteProps } from './components/ProtectedRoute';
export { UserProfile, type UserProfileProps } from './components/UserProfile';

// Utilities
export * from './utils/auth-helpers';
export * from './utils/crypto';
export { withAuth, withAuthProps, type WithAuthOptions } from './utils/withAuth';

// API Client (for advanced usage)
export { AuthApi, type AuthApiConfig, DEFAULT_AUTH_CONFIG } from './api/auth-api';

// Store (for advanced usage)
export { authStore } from './store/auth-store';