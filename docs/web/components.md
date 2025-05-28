# Components Documentation

## Overview

The Docu frontend uses a component-based architecture with reusable, composable UI elements. Components are organized by feature and complexity, following React best practices and accessibility standards.

## Component Organization

```
components/
├── auth/                 # Authentication-related components
├── dashboard/           # Dashboard-specific components
├── document-details/    # Document detail views
├── document-verification/ # Verification workflows
├── documents/           # Document management
├── documents-management/ # Advanced document features
├── layouts/             # Layout components
├── profile/             # User profile components
├── providers/           # Context providers
├── register-document/   # Document registration flow
├── shared-documents/    # Shared document features
├── ui/                  # Base UI components
├── user-flow/          # User onboarding flows
└── user-management/    # Admin user management
```

## Core Components

### Layout Components

#### DashboardLayout

Main application layout with responsive sidebar navigation.

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

**Features:**
- Responsive sidebar that collapses on mobile
- Persistent navigation state
- Role-based menu items
- Smooth transitions

[Placeholder: DashboardLayout Screenshot - Shows the main layout with sidebar and content area]

#### Header

Top navigation bar with wallet connection and user menu.

```typescript
export function Header() {
  const { user, signOut } = useAuth();
  
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Docu Vault</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <WalletConnect />
          <UserMenu user={user} onSignOut={signOut} />
        </div>
      </div>
    </header>
  );
}
```

**Features:**
- Wallet connection status
- User profile dropdown
- Notification bell (future)
- Search functionality (future)

### Authentication Components

#### SIWEButton

Sign-In with Ethereum button component.

```typescript
interface SIWEButtonProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function SIWEButton({ onSuccess, onError, className }: SIWEButtonProps) {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signIn();
      onSuccess?.(user);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      Sign In with Ethereum
    </Button>
  );
}
```

#### AuthStatus

Displays current authentication status.

```typescript
export function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Skeleton className="h-10 w-32" />;
  }
  
  if (!isAuthenticated) {
    return (
      <Badge variant="outline" className="text-red-600">
        Not Authenticated
      </Badge>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-green-600">
        Authenticated
      </Badge>
      <span className="text-sm text-muted-foreground">
        {truncateAddress(user.address)}
      </span>
    </div>
  );
}
```

### Document Components

#### DocumentCard

Displays document information in a card format.

```typescript
interface DocumentCardProps {
  document: Document;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  onVerify?: () => void;
  onShare?: () => void;
  onView?: () => void;
}

export function DocumentCard({
  document,
  variant = 'default',
  showActions = true,
  onVerify,
  onShare,
  onView,
}: DocumentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{document.title}</CardTitle>
            <CardDescription>
              {formatDocumentType(document.type)}
            </CardDescription>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uploaded</span>
            <span>{formatDate(document.uploadedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hash</span>
            <span className="font-mono text-xs">
              {truncateHash(document.hash)}
            </span>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onView}>
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
          {!document.isVerified && onVerify && (
            <Button size="sm" variant="outline" onClick={onVerify}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Verify
            </Button>
          )}
          {onShare && (
            <Button size="sm" variant="outline" onClick={onShare}>
              <Share2 className="mr-1 h-4 w-4" />
              Share
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
```

[Placeholder: DocumentCard Screenshot - Shows a document card with status badge and action buttons]

#### DocumentList

Renders a list of documents with sorting and filtering.

```typescript
interface DocumentListProps {
  documents: Document[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onDocumentClick?: (document: Document) => void;
}

export function DocumentList({
  documents,
  isLoading,
  viewMode = 'grid',
  onDocumentClick,
}: DocumentListProps) {
  if (isLoading) {
    return <DocumentListSkeleton count={6} viewMode={viewMode} />;
  }
  
  if (documents.length === 0) {
    return <EmptyState message="No documents found" />;
  }
  
  if (viewMode === 'grid') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onView={() => onDocumentClick?.(doc)}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <DocumentListItem
          key={doc.id}
          document={doc}
          onClick={() => onDocumentClick?.(doc)}
        />
      ))}
    </div>
  );
}
```

#### RegisterDocumentForm

Multi-step form for document registration.

```typescript
export function RegisterDocumentForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DocumentFormData>({
    file: null,
    title: '',
    description: '',
    type: DocumentType.GENERIC,
  });
  
  const { mutate: registerDocument, isLoading } = useRegisterDocument();
  
  const handleSubmit = async () => {
    if (!formData.file) return;
    
    try {
      // Upload to IPFS
      const cid = await uploadToIPFS(formData.file);
      
      // Calculate hash
      const hash = await calculateFileHash(formData.file);
      
      // Register on blockchain
      await registerDocument({
        cid,
        hash,
        metadata: {
          title: formData.title,
          description: formData.description,
          type: formData.type,
        },
      });
      
      toast.success('Document registered successfully!');
    } catch (error) {
      toast.error('Failed to register document');
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Document</CardTitle>
        <StepIndicator currentStep={step} totalSteps={3} />
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <FileUploadStep
            file={formData.file}
            onFileSelect={(file) => setFormData({ ...formData, file })}
            onNext={() => setStep(2)}
          />
        )}
        
        {step === 2 && (
          <DocumentDetailsStep
            formData={formData}
            onChange={(updates) => setFormData({ ...formData, ...updates })}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        
        {step === 3 && (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

[Placeholder: RegisterDocumentForm Screenshot - Shows the multi-step document registration form]

### Dashboard Components

#### RoleBasedDashboard

Renders different dashboard views based on user role.

```typescript
export function RoleBasedDashboard() {
  const { user } = useAuth();
  
  const dashboardComponents = {
    admin: AdminDashboard,
    issuer: IssuerDashboard,
    verifier: VerifierDashboard,
    holder: HolderDashboard,
  };
  
  const DashboardComponent = user?.roles.map(role => 
    dashboardComponents[role]
  ).filter(Boolean)[0] || HolderDashboard;
  
  return <DashboardComponent />;
}
```

#### StatsCard

Displays statistical information in a card.

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs">
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### UI Components

#### Button

Extended button component with multiple variants.

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Dialog

Modal dialog component with accessibility features.

```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200">
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
```

#### Form Components

Comprehensive form components with validation.

```typescript
// Form Field
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// Input with validation
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
```

### Shared Components

#### ConsentManagement

Manages document access permissions.

```typescript
interface ConsentManagementProps {
  documentId: string;
  currentPermissions: Permission[];
  onUpdate: (permissions: Permission[]) => void;
}

export function ConsentManagement({
  documentId,
  currentPermissions,
  onUpdate,
}: ConsentManagementProps) {
  const [permissions, setPermissions] = useState(currentPermissions);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Management</CardTitle>
        <CardDescription>
          Control who can access this document
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {permissions.map((permission) => (
            <PermissionItem
              key={permission.id}
              permission={permission}
              onRevoke={() => handleRevoke(permission.id)}
              onUpdate={(updates) => handleUpdate(permission.id, updates)}
            />
          ))}
        </div>
        
        <Button
          onClick={() => setShowAddDialog(true)}
          className="mt-4"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Grant Access
        </Button>
      </CardContent>
      
      <AddPermissionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPermission}
      />
    </Card>
  );
}
```

[Placeholder: ConsentManagement Screenshot - Shows the permission management interface]

#### ShareDialog

Dialog for sharing documents with other users.

```typescript
interface ShareDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  document,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const { mutate: shareDocument } = useShareDocument();
  
  const handleShare = async () => {
    if (!recipientAddress || !expirationDate) return;
    
    await shareDocument({
      documentId: document.id,
      recipientAddress,
      expiresAt: expirationDate,
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Grant temporary access to {document.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <FormField label="Recipient Address" required>
            <Input
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </FormField>
          
          <FormField label="Access Expires" required>
            <DatePicker
              date={expirationDate}
              onDateChange={setExpirationDate}
              minDate={new Date()}
            />
          </FormField>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare}>
            Share Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Component Patterns

### Loading States

```typescript
// Skeleton loading
export function DocumentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Loading spinner
export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
    </div>
  );
}
```

### Empty States

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = <FileX className="h-12 w-12" />,
  title = 'No results found',
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Error States

```typescript
interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

## Accessibility

All components follow WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Focus Management**: Clear focus indicators
- **Color Contrast**: AA compliance minimum

```typescript
// Example: Accessible button
<Button
  aria-label="Verify document"
  aria-pressed={isVerified}
  aria-busy={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Verifying...' : 'Verify'}
</Button>
```

## Theming

Components support light/dark themes through CSS variables:

```css
/* Theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

## Best Practices

1. **Component Composition**: Build complex components from simple ones
2. **Props Interface**: Always define TypeScript interfaces
3. **Default Props**: Provide sensible defaults
4. **Error Boundaries**: Wrap complex components
5. **Memoization**: Use React.memo for expensive renders
6. **Accessibility**: Include ARIA labels and keyboard support
7. **Testing**: Write unit tests for all components