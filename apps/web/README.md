# NGDocuVault Web Application

The NGDocuVault Web Application is a React-based frontend that provides a user-friendly interface for the decentralized document management platform. It features wallet integration, document management, and AI-powered assistance for immigrants navigating complex bureaucratic processes.

## 🎯 Key Features

- **🔐 Web3 Authentication**: SIWE (Sign-In with Ethereum) wallet connection
- **📄 Document Management**: Upload, verify, and manage documents with IPFS storage
- **🛡️ Privacy-First**: Zero-knowledge proofs for document verification
- **🤖 Docu Assist**: AI-powered multilingual assistant for legal guidance
- **👥 Role-Based UI**: Tailored interfaces for Admins, Issuers, Verifiers, and Holders
- **🌍 Multi-Jurisdictional**: Support for EU, US, and Canadian identity standards
- **📱 Responsive Design**: Mobile-first design with accessibility features

## 🏗️ Architecture Overview

```
📁 src/
├── 🎯 components/         # React components
│   ├── 🔐 auth/          # Authentication components
│   ├── 📊 dashboard/     # Dashboard and analytics
│   ├── 📄 documents/     # Document management UI
│   ├── 🖼️ ui/           # Reusable UI components (shadcn/ui)
│   ├── 👤 user-flow/    # User onboarding and DID flows
│   └── 🔧 providers/     # Context providers
├── 📱 pages/             # Page components (routes)
├── 🪝 hooks/             # Custom React hooks
├── 📚 lib/               # Utility libraries and configurations
├── ⚙️ config/            # Application configuration
├── 🔧 utils/             # Utility functions
└── 🎨 assets/            # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- MetaMask or compatible Web3 wallet

### Environment Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```bash
   # API Configuration
   VITE_API_BASE_URL="http://localhost:5000"
   VITE_PINATA_GATEWAY_URL="https://gateway.pinata.cloud"
   
   # Blockchain Configuration
   VITE_LOCAL_RPC_URL="http://localhost:8545"
   VITE_CHAIN_ID="31337"
   
   # Contract Addresses (set after deployment)
   VITE_DID_REGISTRY_ADDRESS="0x..."
   VITE_DID_AUTH_ADDRESS="0x..."
   VITE_DOCU_VAULT_ADDRESS="0x..."
   
   # WalletConnect (optional)
   VITE_WALLETCONNECT_PROJECT_ID="your-project-id"
   
   # GraphQL (if using subgraph)
   VITE_GRAPHQL_ENDPOINT="http://localhost:8000/subgraphs/name/docuvault"
   ```

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

## 🔗 Application Routes

### Public Routes
```
/                    # Landing page or dashboard redirect
/landing            # Public landing page
/auth               # Authentication selection
/auth/siwe          # SIWE authentication flow
/login              # Redirect to /auth/siwe
```

### Protected Routes (Dashboard)
```
/dashboard          # Main dashboard (role-specific)
/documents          # Document management
/documents/:id      # Document details
/register-document  # Document registration form
/verify-document    # Document verification tools
/shared             # Shared documents management
/users-management   # User management (admin only)
/profile            # User profile and settings
```

## 🧩 Component Architecture

### Core Layout Components
- **`DashboardLayout`**: Main authenticated layout with sidebar navigation
- **`Header`**: Application header with user menu and notifications
- **`Sidebar`**: Navigation sidebar with role-based menu items

### Authentication Components
- **`ProtectedRoute`**: Route protection wrapper for authenticated users
- **`RoleProtectedRoute`**: Additional role-based access control
- **`SIWEButton`**: Wallet connection and SIWE authentication
- **`AuthStatus`**: Authentication status indicator
- **`UserProfile`**: User profile display and management

### Document Management Components
- **`DocumentList`**: Display and filter documents
- **`DocumentCard`**: Individual document display card
- **`RegisterDocumentForm`**: Document upload and registration
- **`DocumentDetails`**: Detailed document view with actions
- **`DocumentVerification`**: Document verification interface
- **`FileDropzone`**: Drag-and-drop file upload

### Dashboard Components
- **`AdminDashboard`**: Admin-specific dashboard view
- **`IssuerDashboard`**: Issuer role dashboard
- **`VerifierDashboard`**: Verifier role dashboard
- **`HolderDashboard`**: Document holder dashboard
- **`StatsCard`**: Dashboard statistics display
- **`RecentActivity`**: Recent activity feed

### User Flow Components
- **`DidCreationFlow`**: DID registration workflow
- **`DidDocumentForm`**: DID document management
- **`UserRoleDialog`**: Role selection and management
- **`KeySecurityConfirmation`**: Private key security warnings

## 🎨 UI Component System

Built on **shadcn/ui** with **Radix UI** primitives:

### Core UI Components
- **Forms**: Input, textarea, select, checkbox, radio groups
- **Navigation**: Tabs, breadcrumbs, pagination, menus
- **Feedback**: Toast notifications, alerts, loading states
- **Layout**: Cards, separators, aspect ratios, grids
- **Data Display**: Tables, charts, badges, avatars
- **Overlays**: Dialogs, sheets, popovers, tooltips

### Custom Components
- **`Logo`**: Application logo with branding
- **`FloatingShapes`**: Background decoration elements
- **`StepIndicator`**: Multi-step process indicators

## 🪝 Custom Hooks

### Authentication Hooks
- **`useAuth`**: Authentication state and actions
- **`useDidSiwe`**: SIWE authentication flow
- **`useWallet`**: Wallet connection and management

### Contract Interaction Hooks
- **`useDidRegistry`**: DID registry contract interactions
- **`useDidAuth`**: Authentication contract operations
- **`useDocuVault`**: Document management contract calls
- **`useDidIssuer`**: Credential issuance operations
- **`useDidVerifier`**: Credential verification

### Data Management Hooks
- **`useDocumentsData`**: Document list and filtering
- **`useDocumentDetails`**: Individual document operations
- **`useUserManagementData`**: User administration
- **`useSharedDocumentsData`**: Shared document management
- **`useDashboardStats`**: Dashboard analytics

### IPFS and Storage Hooks
- **`useIpfsQueries`**: IPFS data retrieval
- **`useIpfsMutations`**: IPFS upload and pinning
- **`useIpfUpload`**: File upload management

### Event Monitoring Hooks
- **`useDocuEvents`**: DocuVault contract events
- **`useDidRegistryEvents`**: DID registry events
- **`useDidAuthEvents`**: Authentication events

## 🔧 State Management

### Authentication State
- **Zustand Store**: `auth-store.ts` for authentication state
- **Persistent Storage**: Cookie-based session persistence
- **Session Management**: Automatic token refresh and logout

### React Query
- **Server State**: API calls and blockchain queries
- **Caching Strategy**: Optimistic updates and background sync
- **Error Handling**: Comprehensive error boundaries

### Wallet State
- **Wagmi**: Ethereum wallet integration
- **ConnectKit**: Wallet connection UI
- **Chain Management**: Multi-network support

## 🌐 Web3 Integration

### Wallet Providers
- **MetaMask**: Primary wallet support
- **WalletConnect**: Mobile wallet support
- **Injected Providers**: Generic wallet compatibility

### Smart Contract Integration
- **ethers.js v6**: Contract interaction library
- **Type-Safe Contracts**: Generated TypeScript types
- **Error Handling**: Contract error parsing and user-friendly messages

### Blockchain Networks
- **Local Development**: Hardhat node (chainId: 31337)
- **Testnet**: Sepolia (chainId: 11155111)
- **Mainnet**: Ethereum mainnet (chainId: 1)

## 📡 API Integration

### REST API Calls
- **Authentication**: SIWE challenge and verification
- **Document Management**: Upload, retrieval, and metadata
- **User Management**: Profile and role management
- **IPFS Operations**: File storage and pinning

### GraphQL Integration (Optional)
- **Subgraph Queries**: On-chain data indexing
- **Real-time Updates**: Event-driven data synchronization
- **Analytics**: Dashboard statistics and insights

## 🎨 Styling and Design

### Tailwind CSS
- **Utility-First**: Comprehensive utility classes
- **Custom Theme**: Branded color palette and typography
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Mode**: Support for dark theme (planned)

### Design System
- **Consistent Spacing**: Standardized spacing scale
- **Typography**: Defined text styles and hierarchy
- **Color Palette**: Accessible color combinations
- **Component Variants**: Size and style variants

## 🌍 Internationalization (Planned)

### Multi-language Support
- **Primary Languages**: English, German, Spanish, Arabic
- **Legal Terminology**: Accurate legal document translations
- **Cultural Adaptation**: Region-specific UI adjustments
- **RTL Support**: Right-to-left language support

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1440px+

### Mobile Features
- **Touch-Friendly**: Large touch targets and gestures
- **Progressive Web App**: PWA capabilities (planned)
- **Offline Support**: Limited offline functionality (planned)

## 🧪 Testing Strategy

### Component Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Mock Service Worker**: API mocking for tests

### E2E Testing (Planned)
- **Playwright**: End-to-end testing framework
- **User Flows**: Complete user journey testing
- **Cross-Browser**: Chrome, Firefox, Safari compatibility

### Testing Commands
```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 🔒 Security Considerations

### Frontend Security
- **No Private Keys**: Never store private keys in browser
- **Secure Communication**: HTTPS for all API calls
- **Input Validation**: Client-side validation for UX
- **XSS Protection**: Content Security Policy headers

### Web3 Security
- **Transaction Signing**: User confirmation for all transactions
- **Contract Verification**: Verify contract addresses
- **Slippage Protection**: Transaction parameter validation

## 🚀 Build and Deployment

### Production Build
```bash
# Create optimized production build
pnpm build

# Analyze bundle size
pnpm build --analyze

# Preview production build locally
pnpm preview
```

### Static Deployment
- **Azure Static Web Apps**: Primary deployment target
- **Vercel**: Alternative deployment option
- **Netlify**: Additional deployment option
- **IPFS**: Decentralized hosting option

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Caching Strategy**: Long-term caching for static assets

## 📊 Performance Optimization

### Bundle Optimization
- **Lazy Loading**: Route and component lazy loading
- **Asset Optimization**: Image compression and formats
- **Font Loading**: Optimized web font loading
- **Critical CSS**: Above-the-fold CSS prioritization

### Runtime Performance
- **Memoization**: React.memo and useMemo optimization
- **Virtual Scrolling**: Large list performance
- **Background Sync**: Non-blocking API calls
- **Error Boundaries**: Graceful error handling

## 🔧 Development Tools

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks for quality gates

### Development Experience
- **Vite**: Fast development server and HMR
- **React DevTools**: Component debugging
- **React Query DevTools**: API state debugging
- **Wallet DevTools**: Web3 interaction debugging

## 🤝 Contributing

Please see the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

### Frontend-Specific Guidelines
- Follow React best practices and hooks patterns
- Use TypeScript for all new components
- Implement responsive design for all UI components
- Write unit tests for complex components
- Follow the established component organization structure

## 📚 Additional Resources

- **[API Documentation](../api/README.md)**
- **[Smart Contract Documentation](../contract/README.md)**
- **[Deployment Guide](../../docs/deployment/)**
- **[Component Library](../../docs/web/components/)**

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

---

**NGDocuVault Web** - Empowering immigrants with intuitive, secure digital identity management.