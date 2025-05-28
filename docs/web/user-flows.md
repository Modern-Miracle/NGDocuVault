# User Flows

## Overview

This document describes the key user journeys in the Docu application, detailing the steps users take to accomplish their goals and the system's responses at each stage.

## Core User Flows

### 1. First-Time User Onboarding

Complete flow for new users from landing to authenticated dashboard.

```
Landing Page → Connect Wallet → Sign Message → Create DID → Select Role → Dashboard
```

#### Detailed Steps

1. **Landing Page**
   - User visits application
   - Views value proposition
   - Clicks "Get Started" or "Connect Wallet"

2. **Wallet Connection**
   - Wallet selection modal appears
   - User selects preferred wallet
   - Approves connection in wallet

3. **Authentication**
   - SIWE message displayed
   - User signs message in wallet
   - Backend verifies signature

4. **DID Creation**
   - System checks for existing DID
   - If none, prompts for DID creation
   - User confirms transaction

5. **Role Selection**
   - User selects primary role
   - System grants appropriate permissions
   - Redirects to role-specific dashboard

[Placeholder: Onboarding Flow Diagram - Visual flowchart of the complete onboarding process]

### 2. Document Registration Flow

Process for uploading and registering a new document.

```
Dashboard → Register Document → Upload File → Add Metadata → Review → Submit → Confirmation
```

#### Detailed Steps

1. **Initiate Registration**
   ```typescript
   // User clicks "Register Document" button
   navigate('/documents/register');
   ```

2. **File Upload**
   - Drag-and-drop or browse for file
   - File validation (type, size)
   - Preview generation
   - Progress indication

3. **Metadata Entry**
   - Document title (required)
   - Description (optional)
   - Document type selection
   - Tags/categories

4. **IPFS Upload**
   - File uploaded to IPFS
   - CID generated
   - Hash calculation
   - Encryption (if enabled)

5. **Blockchain Registration**
   - Transaction preview
   - Gas estimation
   - User confirms in wallet
   - Transaction processing

6. **Confirmation**
   - Success message
   - Document ID displayed
   - Navigation options

[Placeholder: Document Registration Screenshots - Step-by-step UI screenshots]

### 3. Document Verification Flow

Issuer verifying a document submitted by a holder.

```
Verification Requests → Review Document → Verify Authenticity → Approve/Reject → Update Status
```

#### Detailed Steps

1. **View Requests**
   - Issuer accesses verification queue
   - Filters/sorts pending requests
   - Selects document to review

2. **Document Review**
   - Download original document
   - Verify against external sources
   - Check document integrity
   - Review metadata

3. **Verification Decision**
   ```typescript
   // Issuer approves document
   await verifyDocument({
     documentId: doc.id,
     status: 'verified',
     comments: 'Document authenticated'
   });
   ```

4. **Blockchain Update**
   - Verification recorded on-chain
   - Events emitted
   - Status updated

5. **Notification**
   - Holder notified of verification
   - Document status updated
   - Verification badge displayed

[Placeholder: Verification Interface - Screenshot of the verification review interface]

### 4. Document Sharing Flow

Holder sharing document access with a third party.

```
Document Details → Share → Enter Recipient → Set Expiration → Confirm → Access Granted
```

#### Detailed Steps

1. **Select Document**
   - Navigate to document list
   - Click on document to share
   - Access "Share" action

2. **Share Configuration**
   ```typescript
   interface ShareConfig {
     recipientAddress: string;
     expirationDate: Date;
     permissions: Permission[];
     message?: string;
   }
   ```

3. **Recipient Entry**
   - Enter wallet address
   - Optional: ENS resolution
   - Address validation

4. **Access Parameters**
   - Set expiration date/time
   - Choose permission level
   - Add optional message

5. **Transaction Confirmation**
   - Review share details
   - Confirm in wallet
   - Transaction processing

6. **Access Management**
   - Share recorded
   - Recipient can access
   - Revocation available

[Placeholder: Share Dialog - Screenshot of the document sharing interface]

### 5. Access Revocation Flow

Revoking previously granted document access.

```
Document Details → Manage Access → Select Grant → Revoke → Confirm → Access Removed
```

#### Process Steps

1. **Access Management View**
   - View all active shares
   - See expiration status
   - Identify share to revoke

2. **Revoke Selection**
   - Click revoke button
   - Confirmation dialog
   - Review implications

3. **Blockchain Update**
   - Revocation transaction
   - Immediate effect
   - Event emission

### 6. Bulk Document Operations

Managing multiple documents simultaneously.

```
Document List → Select Multiple → Choose Action → Configure → Execute → Results
```

#### Supported Operations

1. **Bulk Verification** (Issuer)
   ```typescript
   const selectedDocs = [doc1, doc2, doc3];
   await verifyDocuments({
     documentIds: selectedDocs.map(d => d.id),
     status: 'verified'
   });
   ```

2. **Bulk Download** (All Roles)
   - Select documents
   - Generate zip file
   - Download with manifest

3. **Bulk Share** (Holder)
   - Select documents
   - Single recipient
   - Uniform permissions

## Role-Specific Flows

### Admin Flows

#### User Role Management

```
User Management → Search User → View Roles → Modify Roles → Confirm → Update
```

1. **Access User Management**
   - Admin-only menu item
   - Protected route check
   - User list loads

2. **User Search**
   - Search by address/DID
   - Filter by role
   - Pagination

3. **Role Modification**
   ```typescript
   await updateUserRoles({
     userId: user.did,
     roles: ['holder', 'issuer'],
     reason: 'Approved for issuer role'
   });
   ```

[Placeholder: User Management Interface - Admin dashboard screenshot]

### Issuer Flows

#### Credential Issuance

```
Select Document → Issue Credential → Fill Details → Sign → Submit → Credential Created
```

1. **Document Selection**
   - From verified documents
   - Check eligibility
   - Prepare credential

2. **Credential Creation**
   - Choose credential type
   - Add claims
   - Set expiration

3. **Digital Signature**
   - Sign with issuer key
   - Cryptographic proof
   - Immutable record

### Holder Flows

#### Document Portfolio Management

```
Dashboard → My Documents → Organize → Create Collections → Add Documents → Save
```

1. **Portfolio View**
   - All documents grid/list
   - Filter options
   - Sort capabilities

2. **Collection Creation**
   - Name collection
   - Add description
   - Set privacy level

3. **Document Organization**
   - Drag to collection
   - Multi-select
   - Bulk operations

### Verifier Flows

#### Document Validation

```
Enter Document ID → Fetch Details → Verify Signatures → Check Status → Generate Report
```

1. **Document Lookup**
   - Enter ID or scan QR
   - Retrieve from blockchain
   - Load metadata

2. **Verification Steps**
   - Check signatures
   - Validate issuer
   - Verify timeline
   - Confirm authenticity

3. **Report Generation**
   - Verification summary
   - Timestamp proof
   - Shareable link

## Error Handling Flows

### Failed Transaction Recovery

```
Transaction Fails → Error Display → Retry Option → Alternative Actions
```

1. **Error Detection**
   - Transaction revert
   - Insufficient gas
   - Network issues

2. **User Notification**
   ```typescript
   toast.error('Transaction failed', {
     description: getErrorMessage(error),
     action: {
       label: 'Retry',
       onClick: () => retryTransaction()
     }
   });
   ```

3. **Recovery Options**
   - Retry with higher gas
   - Save draft
   - Contact support

### Session Recovery

```
Session Expires → Auto Refresh → If Fails → Re-authenticate → Restore State
```

1. **Token Refresh**
   - Automatic attempt
   - Background process
   - Seamless to user

2. **Re-authentication**
   - If refresh fails
   - Preserve navigation
   - Restore after login

## Mobile-Specific Flows

### Mobile Wallet Connection

```
Mobile Browser → WalletConnect → QR Code → Mobile Wallet → Approve → Connected
```

1. **Initiate Connection**
   - Detect mobile device
   - Show WalletConnect
   - Generate QR code

2. **Wallet Interaction**
   - Open wallet app
   - Scan QR code
   - Approve connection

3. **Mobile Optimization**
   - Responsive UI
   - Touch-friendly
   - Simplified navigation

[Placeholder: Mobile Flow Screenshots - Mobile-specific UI adaptations]

## Accessibility Flows

### Keyboard Navigation

Complete application navigation without mouse.

```
Tab Navigation → Focus Indicators → Action Keys → Screen Reader Announcements
```

1. **Navigation Pattern**
   - Logical tab order
   - Skip links
   - Focus trapping in modals

2. **Keyboard Shortcuts**
   - `Ctrl+N`: New document
   - `Ctrl+S`: Search
   - `Esc`: Close modal

### Screen Reader Flow

Optimized experience for screen reader users.

1. **Announcements**
   - Page changes
   - Action results
   - Error messages

2. **ARIA Labels**
   - Descriptive buttons
   - Form instructions
   - Status updates

## Performance Optimization Flows

### Progressive Loading

```
Initial Load → Critical Path → Lazy Components → Background Data → Full Interface
```

1. **Critical Path**
   - Authentication check
   - Core UI shell
   - Essential data

2. **Progressive Enhancement**
   - Lazy load routes
   - Defer non-critical
   - Optimize images

## Analytics and Tracking

### User Journey Analytics

Key metrics tracked throughout flows:

1. **Funnel Analysis**
   - Drop-off points
   - Time to complete
   - Success rates

2. **Error Tracking**
   - Common failures
   - Recovery success
   - Support triggers

3. **Performance Metrics**
   - Load times
   - Transaction times
   - API response times

## Best Practices

### Flow Design Principles

1. **Progressive Disclosure**
   - Show only needed info
   - Reduce cognitive load
   - Guide users forward

2. **Clear Feedback**
   - Loading states
   - Success confirmations
   - Error explanations

3. **Escape Hatches**
   - Cancel options
   - Save drafts
   - Undo actions

4. **Mobile First**
   - Touch targets
   - Simplified flows
   - Offline consideration

### Implementation Guidelines

1. **State Preservation**
   ```typescript
   // Save form state before wallet interaction
   const saveFormState = () => {
     localStorage.setItem('documentForm', JSON.stringify(formData));
   };
   ```

2. **Error Recovery**
   ```typescript
   // Implement retry with exponential backoff
   const retryWithBackoff = async (fn, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await delay(Math.pow(2, i) * 1000);
       }
     }
   };
   ```

3. **Loading States**
   ```typescript
   // Consistent loading UI
   {isLoading ? (
     <LoadingState message="Processing transaction..." />
   ) : (
     <ContentComponent />
   )}
   ```