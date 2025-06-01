# Packages Documentation

Shared packages and libraries used across the Docu monorepo.

## 📑 Table of Contents

- [Overview](./overview.md)
- [ABI Package](./abi.md)
- [Auth Package](./auth.md)
- [UI Components](./ui.md)
- [Configuration Packages](./config.md)
- [GraphQL Packages](./graphql.md)
- [Development Tools](./dev-tools.md)

## 📦 Core Packages

### @docu/abi
Smart contract ABIs and TypeScript types
- Centralized contract interfaces
- Auto-generated from compiled contracts
- Shared across web and API

### @docu/auth
Authentication utilities and hooks
- SIWE authentication helpers
- JWT token management
- Session utilities

### @docu/ui
Shared UI components
- Reusable React components
- Consistent styling
- Accessibility features

### @docu/typescript-config
Shared TypeScript configuration
- Base tsconfig settings
- Consistent compiler options
- Type checking rules

### @docu/eslint-config
Shared ESLint configuration
- Code style rules
- Best practices enforcement
- Consistent formatting

## 🔧 GraphQL Packages

### @docu/graphql-schema-codegen
GraphQL schema generation from contracts
- Automated schema generation
- Type-safe queries
- Contract event mapping

### @docu/graphql-client-codegen
GraphQL client code generation
- React hooks generation
- Type-safe operations
- Query optimization

## 🚀 Usage

```bash
# Install all packages
pnpm install

# Build packages
pnpm build

# Run type checking
pnpm check-types
```

## 📋 Package Structure

```
packages/
├── abi/                    # Contract ABIs
├── auth/                   # Auth utilities
├── ui/                     # UI components
├── typescript-config/      # TS config
├── eslint-config/         # ESLint rules
├── graphql-schema-codegen/ # Schema generation
└── graphql-client-codegen/ # Client generation
```

## 🔄 Recent Updates

### ABI Package
- Updated contract ABIs for latest deployments
- Added proper TypeScript exports
- Enhanced type safety

### Auth Package
- Improved SIWE authentication flow
- Better error handling
- Session management utilities

See individual package documentation for detailed usage guides.