# UI/UX Guidelines

## Overview

This guide establishes the design principles, patterns, and standards for the Docu application interface. It ensures consistency, accessibility, and an exceptional user experience across all features.

## Design Principles

### 1. Clarity First
- **Clear Information Hierarchy**: Most important information is immediately visible
- **Descriptive Labels**: No ambiguous terms or blockchain jargon
- **Visual Feedback**: Every action has clear feedback

### 2. Progressive Disclosure
- **Simplified Entry**: Complex features revealed gradually
- **Context-Aware**: Show options when relevant
- **Guided Experiences**: Step-by-step for complex tasks

### 3. Trust & Security
- **Transaction Transparency**: Clear about what will happen
- **Security Indicators**: Visual cues for secure actions
- **Error Prevention**: Confirm destructive actions

### 4. Accessibility
- **WCAG 2.1 AA Compliance**: Minimum standard
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Semantic HTML and ARIA

## Visual Design System

### Color Palette

#### Primary Colors
```css
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93bbfd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
}
```

#### Semantic Colors
```css
:root {
  /* Success */
  --success: #10b981;
  --success-light: #d1fae5;
  --success-dark: #065f46;
  
  /* Warning */
  --warning: #f59e0b;
  --warning-light: #fef3c7;
  --warning-dark: #92400e;
  
  /* Error */
  --error: #ef4444;
  --error-light: #fee2e2;
  --error-dark: #991b1b;
  
  /* Info */
  --info: #3b82f6;
  --info-light: #dbeafe;
  --info-dark: #1e40af;
}
```

#### Neutral Colors
```css
:root {
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

[Placeholder: Color Palette Visual - Grid showing all color swatches with hex values]

### Typography

#### Font Stack
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

#### Type Scale
```css
/* Headings */
.text-h1 { font-size: 2.25rem; line-height: 2.5rem; font-weight: 800; }
.text-h2 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; }
.text-h3 { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }
.text-h4 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; }
.text-h5 { font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; }

/* Body */
.text-body-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-body { font-size: 1rem; line-height: 1.5rem; }
.text-body-sm { font-size: 0.875rem; line-height: 1.25rem; }

/* Utility */
.text-caption { font-size: 0.75rem; line-height: 1rem; }
.text-overline { font-size: 0.75rem; line-height: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
```

### Spacing System

8px base unit grid system:

```css
/* Spacing Scale */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## Component Guidelines

### Buttons

#### Button Variants

1. **Primary Button**
   - Main actions (Submit, Save, Confirm)
   - One per view/section
   - High contrast

2. **Secondary Button**
   - Alternative actions
   - Less emphasis than primary
   - Clear but not dominant

3. **Outline Button**
   - Tertiary actions
   - Non-critical operations
   - Minimal visual weight

4. **Destructive Button**
   - Delete, Remove, Revoke
   - Red color scheme
   - Requires confirmation

```typescript
// Button usage examples
<Button variant="default">Register Document</Button>
<Button variant="secondary">Save Draft</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete Document</Button>
```

[Placeholder: Button Variants Screenshot - Shows all button types and states]

#### Button States

- **Default**: Base appearance
- **Hover**: Subtle color change
- **Active**: Pressed state
- **Disabled**: 50% opacity
- **Loading**: Spinner icon

### Forms

#### Input Fields

```typescript
// Standard input field
<FormField label="Document Title" required>
  <Input
    placeholder="Enter document title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    error={errors.title}
  />
</FormField>
```

#### Form Layout Patterns

1. **Single Column**: Mobile and simple forms
2. **Two Column**: Desktop complex forms
3. **Stepped Forms**: Multi-page workflows

#### Validation

- **Inline Validation**: As user types
- **On Blur**: When leaving field
- **On Submit**: Final check
- **Error Messages**: Below fields

### Cards

#### Card Structure

```typescript
<Card>
  <CardHeader>
    <CardTitle>Document Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Card Variants

1. **Default Card**: Standard container
2. **Interactive Card**: Hover states
3. **Selected Card**: Active selection
4. **Disabled Card**: Non-interactive

### Navigation

#### Primary Navigation

- **Sidebar**: Desktop persistent menu
- **Bottom Nav**: Mobile navigation
- **Breadcrumbs**: Hierarchical location

#### Navigation States

```css
/* Active state */
.nav-item-active {
  background: var(--primary-100);
  color: var(--primary-700);
  font-weight: 600;
}

/* Hover state */
.nav-item:hover {
  background: var(--gray-100);
}
```

### Modals & Dialogs

#### Modal Sizes

- **Small**: 400px max-width
- **Medium**: 600px max-width
- **Large**: 800px max-width
- **Full**: 90vw max-width

#### Modal Best Practices

1. **Clear Title**: Describe the action
2. **Focused Content**: One primary task
3. **Escape Route**: X button and Esc key
4. **Action Buttons**: Clear primary action

### Loading States

#### Loading Patterns

1. **Skeleton Screens**
   ```typescript
   <Skeleton className="h-4 w-[250px]" />
   <Skeleton className="h-4 w-[200px]" />
   ```

2. **Spinners**
   ```typescript
   <Loader2 className="h-4 w-4 animate-spin" />
   ```

3. **Progress Bars**
   ```typescript
   <Progress value={progress} className="w-full" />
   ```

4. **Loading Messages**
   - "Loading documents..."
   - "Processing transaction..."
   - "Uploading to IPFS..."

### Empty States

#### Components

```typescript
<EmptyState
  icon={<FileX className="h-12 w-12" />}
  title="No documents found"
  message="Upload your first document to get started"
  action={{
    label: "Upload Document",
    onClick: () => navigate('/documents/register')
  }}
/>
```

### Error States

#### Error Display

1. **Inline Errors**: Form validation
2. **Toast Notifications**: Temporary errors
3. **Error Pages**: 404, 500
4. **Error Boundaries**: Component failures

## Interaction Patterns

### Feedback Mechanisms

#### Success Feedback
```typescript
toast.success('Document uploaded successfully', {
  description: 'Your document has been registered on the blockchain'
});
```

#### Error Feedback
```typescript
toast.error('Upload failed', {
  description: 'Please check your file and try again',
  action: {
    label: 'Retry',
    onClick: () => retryUpload()
  }
});
```

### Confirmation Patterns

#### Destructive Actions
```typescript
<AlertDialog>
  <AlertDialogTrigger>Delete Document</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete
        your document from the system.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Drag and Drop

#### File Upload Pattern
```typescript
<div
  className={cn(
    "border-2 border-dashed rounded-lg p-8 text-center",
    isDragging && "border-primary bg-primary/5"
  )}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  <Upload className="mx-auto h-12 w-12 text-gray-400" />
  <p className="mt-2">Drag and drop or click to upload</p>
</div>
```

## Mobile Design

### Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape / Desktop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Touch Targets

- **Minimum Size**: 44x44px
- **Spacing**: 8px between targets
- **Thumb Reach**: Important actions in bottom half

### Mobile-Specific Components

1. **Bottom Sheet**: Mobile modals
2. **Swipe Actions**: Delete, archive
3. **Pull to Refresh**: Update lists
4. **Floating Action Button**: Primary action

[Placeholder: Mobile Design Examples - Screenshots of mobile-specific UI patterns]

## Accessibility Guidelines

### Focus Management

```css
/* Focus styles */
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### ARIA Labels

```typescript
<Button
  aria-label="Upload new document"
  aria-describedby="upload-help-text"
>
  <Upload className="h-4 w-4" />
</Button>
```

### Color Contrast

- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum
- **Interactive Elements**: 3:1 minimum

### Screen Reader Support

```typescript
// Announce dynamic changes
<div role="status" aria-live="polite">
  {isLoading && <span className="sr-only">Loading documents...</span>}
</div>
```

## Animation Guidelines

### Timing Functions

```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Duration Scale

```css
:root {
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

### Animation Patterns

1. **Micro-interactions**: 150-200ms
2. **Page Transitions**: 300ms
3. **Loading Animations**: Continuous
4. **Hover Effects**: 150ms

## Dark Mode

### Implementation

```typescript
// Theme toggle
const { theme, setTheme } = useTheme();

<Button
  variant="ghost"
  size="icon"
  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
>
  {theme === 'light' ? <Moon /> : <Sun />}
</Button>
```

### Color Adjustments

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  /* Adjust shadows for dark mode */
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.3);
}
```

## Icons

### Icon Library

Using Lucide React for consistent iconography:

```typescript
import {
  FileText,    // Documents
  Shield,      // Security
  Users,       // User management
  Settings,    // Configuration
  Upload,      // Upload action
  Download,    // Download action
  Share2,      // Share action
  Eye,         // View action
  Edit,        // Edit action
  Trash2,      // Delete action
} from 'lucide-react';
```

### Icon Sizes

```typescript
// Standard sizes
<Icon className="h-4 w-4" />  // Small
<Icon className="h-5 w-5" />  // Default
<Icon className="h-6 w-6" />  // Large
<Icon className="h-8 w-8" />  // Extra large
```

## Best Practices

### Do's

1. **Consistent Spacing**: Use spacing scale
2. **Clear Hierarchy**: Visual importance
3. **Predictable Patterns**: Familiar UX
4. **Performance**: Optimize animations
5. **Accessibility**: WCAG compliance

### Don'ts

1. **Overcrowd**: Too much information
2. **Inconsistent**: Mixed patterns
3. **Hidden Actions**: Important features buried
4. **Poor Contrast**: Hard to read
5. **Tiny Targets**: Hard to click/tap

## Design Tokens

Export design tokens for consistency:

```typescript
export const tokens = {
  colors: {
    primary: colors.blue,
    success: colors.green,
    warning: colors.amber,
    error: colors.red,
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
};
```