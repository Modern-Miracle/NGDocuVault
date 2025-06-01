# Changelog

All notable changes to the Docu project will be documented in this file.

## [Unreleased]

### Added
- Comprehensive documentation structure in `/docs` folder
- Documentation for API, Web, Contracts, and Packages
- Architecture and deployment guides
- Contributing guidelines
- IPFS integration documentation
- Document upload guide
- Register Document component documentation

### Changed
- **UserManagement Component** (apps/web/src/pages/UserManagement.tsx)
  - Replaced deprecated `useDidSiwe` hook with standard `useAuth` and `useIsAdmin` hooks
  - Added loading state while checking admin permissions
  - Updated DID format from `did:eth:` to `did:docuvault:` in placeholder text
  - Enhanced input validation for Ethereum addresses and DID formats
  - Improved error handling with descriptive messages
  - Added required attributes to form fields
  - Implemented proper TypeScript types for better type safety
  - Fixed async clipboard operations

### Fixed
- Type errors in UserManagement component
- Proper role hash handling in UI
- Event timestamp handling for optional values
- Import/export issues in hooks index
- **IPFS Upload Functionality**
  - Fixed hash.ts server action issue by removing 'use server' directive
  - Updated RegisterDocument.tsx to use proper authentication hooks
  - Enhanced IPFS controller to handle missing encryption key gracefully
  - Improved error handling in upload process
  - Added proper content hash generation for blockchain registration

### Documentation
- Created standardized documentation structure
- Added component-specific documentation for UserManagement
- Created comprehensive command reference guide
- Added architecture overview and guides

## [Previous Releases]

### Contract Updates
- Implemented role-based access control with proper hash generation
- Added setup scripts for initial admin configuration
- Created registration scripts for all user roles
- Fixed circular dependency in DidAuth deployment

### API Updates
- Enhanced SIWE authentication flow
- Improved session management
- Added better error handling for DID operations

### Web App Updates
- Created role-based Dashboard component
- Implemented comprehensive event monitoring
- Enhanced user onboarding flows
- Improved wallet connection handling

### Infrastructure
- Set up Turborepo monorepo structure
- Configured shared packages for code reuse
- Implemented consistent TypeScript and ESLint configurations
- Added comprehensive testing setup