# Web Application Documentation

The Docu web application is a React-based frontend for decentralized document verification.

## 📑 Table of Contents

- [Overview](./overview.md)
- [Architecture](./architecture.md)
- [Components](./components.md)
- [Hooks](./hooks.md)
- [State Management](./state-management.md)
- [Routing](./routing.md)
- [Authentication Flow](./authentication-flow.md)
- [Testing](./testing.md)

## 🎯 Key Features

- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **SIWE Authentication**: Secure Sign-In with Ethereum
- **Document Management**: Upload, verify, and share documents
- **Role-Based UI**: Different interfaces for Admin, Issuer, Verifier, and Holder
- **Real-Time Updates**: Event monitoring from smart contracts
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Key Technologies

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and caching
- **wagmi**: Ethereum wallet connection
- **viem**: Ethereum interface
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Zustand**: State management

## 🧩 Component Structure

```
components/
├── auth/           # Authentication components
├── documents/      # Document management UI
├── layouts/        # Page layouts
├── providers/      # Context providers
├── ui/            # Reusable UI components
└── user-flow/     # User onboarding flows
```

## 📱 Pages

- **Dashboard**: Role-specific dashboard views
- **Documents**: Document list and management
- **Register Document**: Upload new documents
- **Verify Document**: Verify document authenticity
- **User Management**: Admin-only user role management
- **Profile**: User profile and settings
- **Shared Documents**: View documents shared with you

## 🔐 Recent Updates

### User Management Component
- Replaced deprecated `useDidSiwe` with standard `useAuth` hook
- Added proper admin permission checking with loading states
- Updated DID format from `did:eth:` to `did:docuvault:`
- Enhanced input validation and error handling
- Improved type safety with proper TypeScript types
- Better UX with required fields and descriptive placeholders

See [Component Documentation](./components.md) for detailed component guides.