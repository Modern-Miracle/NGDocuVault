# Web Application Documentation

The Docu web application is a modern React-based frontend for decentralized document verification, built with Web3 technologies and designed for exceptional user experience.

## 📑 Table of Contents

### Core Documentation
- [Overview](./overview.md) - Introduction, features, and technology stack
- [Architecture](./architecture.md) - Technical architecture and design patterns
- [Authentication Flow](./authentication-flow.md) - Web3 wallet connection and SIWE
- [Components](./components.md) - Component library and usage

### Development Guides
- [State Management](./state-management.md) - Global and local state patterns
- [Hooks](./hooks.md) - Custom React hooks documentation
- [Routing](./routing.md) - Application routing and navigation
- [UI/UX Guidelines](./ui-ux-guidelines.md) - Design system and patterns

### Features
- [User Flows](./user-flows.md) - Key user journeys and interactions
- [Performance](./performance.md) - Optimization techniques
- [Testing](./testing.md) - Testing strategies and examples
- [Deployment](./deployment.md) - Build and deployment guide

### Reference
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [Component Examples](./examples.md) - Code examples and patterns

## 🎯 Key Features

### Web3 Integration
- **Multi-Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **SIWE Authentication**: Secure, passwordless authentication
- **Real-time Updates**: Blockchain event monitoring
- **Transaction Management**: User-friendly transaction flow

### Document Management
- **Secure Upload**: IPFS integration with encryption
- **Verification Workflow**: Multi-party verification system
- **Access Control**: Granular permission management
- **Batch Operations**: Efficient bulk document handling

### User Experience
- **Responsive Design**: Mobile-first approach
- **Progressive Disclosure**: Intuitive information architecture
- **Dark Mode**: System-aware theme switching
- **Accessibility**: WCAG 2.1 AA compliance

### Role-Based Features
- **Admin Dashboard**: System administration tools
- **Issuer Interface**: Document verification workflow
- **Holder Portal**: Personal document management
- **Verifier Tools**: Document validation interface

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Technology Stack

### Core Framework
- **React 18.3**: UI library with concurrent features
- **TypeScript 5.6**: Type-safe development
- **Vite 5.4**: Fast build tool and dev server

### Web3 Stack
- **wagmi 2.13**: React hooks for Ethereum
- **viem 2.21**: TypeScript Ethereum library
- **ConnectKit 1.8**: Wallet connection UI

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS 3.4**: Utility-first styling
- **CVA**: Component variant management

### State & Data
- **TanStack Query 5.62**: Server state management
- **Zustand 5.0**: Client state management
- **React Hook Form 7.54**: Form handling

## 🧩 Project Structure

```
apps/web/
├── src/
│   ├── api/                 # API client layer
│   ├── components/          # React components
│   │   ├── auth/           # Authentication
│   │   ├── dashboard/      # Dashboard views
│   │   ├── documents/      # Document features
│   │   ├── layouts/        # Layout components
│   │   ├── providers/      # Context providers
│   │   └── ui/            # Base UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── pages/              # Page components
│   ├── services/           # Business logic
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── public/                 # Static assets
└── tests/                  # Test files
```

## 📱 Key Pages

### Public Pages
- **Landing**: Marketing and information
- **Authentication**: Wallet connection flow

### Protected Pages
- **Dashboard**: Role-specific home page
- **Documents**: Document management
- **Document Details**: Individual document view
- **Register Document**: Upload workflow
- **Verify Documents**: Verification interface
- **Shared Documents**: Shared access view
- **Profile**: User settings
- **User Management**: Admin controls

## 🔒 Security Features

- **Message Signing**: Cryptographic authentication
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Token-based security
- **Network Validation**: Chain ID verification

## 🎨 Design System

- **Color Palette**: Consistent brand colors
- **Typography**: Clear hierarchy
- **Spacing**: 8px grid system
- **Components**: Reusable UI elements
- **Icons**: Consistent iconography
- **Animations**: Smooth transitions

## 🧪 Development Workflow

### Local Development
```bash
# Start all services
pnpm dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Commitlint**: Commit conventions

## 📊 Performance

- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: WebP with fallbacks
- **Bundle Optimization**: Tree shaking
- **Caching Strategy**: React Query caching

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Required: Web3 wallet extension

## 🔄 Recent Updates

### Component Improvements
- Enhanced authentication flow with better error handling
- Improved document upload with progress tracking
- Optimized dashboard performance
- Added comprehensive loading states
- Better mobile responsiveness

### Technical Updates
- Migrated to latest React Query
- Improved TypeScript coverage
- Enhanced error boundaries
- Better state management patterns
- Optimized bundle size

## 🚀 Deployment

### Production Build
```bash
# Build application
pnpm build

# Analyze bundle
pnpm build --analyze

# Preview build
pnpm preview
```

### Environment Variables
```env
VITE_API_URL=https://api.docu.io
VITE_CHAIN_ID=1
VITE_CONTRACT_ADDRESS=0x...
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud
VITE_WALLETCONNECT_PROJECT_ID=...
```

## 📞 Support

- **Documentation**: This guide
- **GitHub Issues**: Bug reports and features
- **Discord**: Community support
- **Email**: support@docu.io