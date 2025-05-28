# Frontend Overview

## Introduction

The Docu web application is a modern, decentralized document verification platform built with React and Web3 technologies. It provides a user-friendly interface for managing documents, verifying authenticity, and controlling access through blockchain technology.

## Key Features

### 🔐 Web3 Authentication
- **Wallet Connection**: Seamless integration with MetaMask, WalletConnect, and other Web3 wallets
- **SIWE (Sign-In with Ethereum)**: Secure, decentralized authentication
- **Session Management**: Persistent sessions with JWT tokens
- **Multi-Wallet Support**: Switch between different wallet accounts

### 📄 Document Management
- **Upload & Registration**: Secure document upload to IPFS with on-chain registration
- **Verification Workflow**: Multi-party verification system
- **Access Control**: Granular permission management
- **Batch Operations**: Efficient bulk document handling

### 👥 Role-Based Interface
- **Dynamic UI**: Interface adapts based on user role
- **Admin Dashboard**: System administration and user management
- **Issuer Tools**: Document verification and credential issuance
- **Holder Features**: Personal document management
- **Verifier Access**: Document validation tools

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System-aware theme switching
- **Real-time Updates**: Live blockchain event monitoring
- **Progressive Disclosure**: Intuitive information architecture

## Technology Stack

### Core Framework
```json
{
  "react": "^18.3.1",
  "vite": "^5.4.11",
  "typescript": "^5.6.2"
}
```

### Web3 Integration
```json
{
  "wagmi": "^2.13.5",
  "viem": "^2.21.45",
  "connectkit": "^1.8.2"
}
```

### UI Framework
```json
{
  "@radix-ui/react-*": "Latest",
  "tailwindcss": "^3.4.17",
  "class-variance-authority": "^0.7.1"
}
```

### State Management
```json
{
  "@tanstack/react-query": "^5.62.11",
  "zustand": "^5.0.3"
}
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Pages   │  │Components│  │  Hooks   │  │  Utils   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    State Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Zustand │  │  Context │  │React Query│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                 Integration Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Wagmi  │  │    API   │  │   IPFS   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│              External Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Blockchain│  │  Backend │  │  Pinata  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Application Flow

### 1. Authentication Flow

```
[User] → [Connect Wallet] → [Sign Message] → [Verify Signature] → [Create Session]
                                    ↓
                            [Check DID Status]
                                    ↓
                         [Assign Roles] → [Dashboard]
```

### 2. Document Registration Flow

```
[Select File] → [Upload to IPFS] → [Get CID] → [Register On-Chain]
                                         ↓
                                 [Store Metadata]
                                         ↓
                                 [Emit Events] → [Update UI]
```

### 3. Verification Flow

```
[View Document] → [Request Verification] → [Issuer Reviews] → [Verify On-Chain]
                                                    ↓
                                            [Update Status]
                                                    ↓
                                            [Notify Holder]
```

## Key Components

### Layout Components
- **DashboardLayout**: Main application layout with sidebar navigation
- **Header**: Top navigation with wallet connection
- **Sidebar**: Role-based navigation menu

### Feature Components
- **DocumentCard**: Document display with actions
- **ConsentManagement**: Access control interface
- **RoleManagement**: User role assignment (admin only)
- **VerificationStatus**: Visual verification indicators

### UI Components
- **Button**: Styled button with variants
- **Card**: Content container component
- **Dialog**: Modal dialog system
- **Form**: Form controls with validation

## State Management

### Global State (Zustand)
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}
```

### Server State (React Query)
- Document queries with caching
- Mutation hooks for blockchain transactions
- Optimistic updates for better UX
- Background refetching

### Local State (React)
- Form state management
- UI state (modals, tooltips)
- Temporary user selections

## Routing Structure

```
/                       → Dashboard (role-based redirect)
/auth                   → Authentication page
/dashboard              → Role-specific dashboard
/documents              → Document list
/documents/:id          → Document details
/documents/register     → Register new document
/documents/verify       → Verify documents
/documents/shared       → Shared documents
/profile                → User profile
/admin/users            → User management (admin only)
```

## Security Features

### Client-Side Security
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based requests
- **Content Security Policy**: Restrictive CSP headers

### Web3 Security
- **Message Signing**: Cryptographic authentication
- **Transaction Confirmation**: User approval for all transactions
- **Address Validation**: Checksummed addresses
- **Network Verification**: Chain ID validation

## Performance Optimization

### Code Splitting
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
```

### Asset Optimization
- **Image Optimization**: WebP format with fallbacks
- **Bundle Splitting**: Vendor chunk separation
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip/Brotli compression

### Caching Strategy
- **Static Assets**: Long-term browser caching
- **API Responses**: React Query caching
- **Blockchain Data**: Local storage for gas savings

## Development Workflow

### Local Development
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Environment Configuration
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_VERSION=v1

# Blockchain Configuration
VITE_CHAIN_ID=31337
VITE_CONTRACT_ADDRESS=0x...

# IPFS Configuration
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud

# Feature Flags
VITE_ENABLE_TESTNET=true
VITE_ENABLE_ANALYTICS=false
```

## Browser Support

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Required Features
- Web3 wallet extension
- JavaScript enabled
- Local storage
- WebSocket support

## Accessibility

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: AA compliance minimum
- **Focus Management**: Clear focus indicators

### Internationalization
- **Language Support**: English (default)
- **RTL Support**: Prepared for RTL languages
- **Date/Time Formatting**: Locale-aware formatting
- **Number Formatting**: Currency and number localization

## Mobile Considerations

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Wide desktop */
2xl: 1536px /* Ultra-wide */
```

### Mobile-Specific Features
- **Touch Gestures**: Swipe actions for navigation
- **Wallet Integration**: WalletConnect for mobile wallets
- **Offline Support**: Service worker for offline access
- **Progressive Web App**: Installable PWA features

## Future Enhancements

### Planned Features
1. **Multi-language Support**: i18n implementation
2. **Advanced Search**: Full-text document search
3. **Batch Upload**: Multiple document upload
4. **QR Code Sharing**: Quick document sharing
5. **Push Notifications**: Real-time alerts

### Technical Improvements
1. **Server-Side Rendering**: Next.js migration
2. **GraphQL Integration**: Efficient data fetching
3. **WebAssembly**: Performance-critical operations
4. **P2P Features**: Direct document sharing