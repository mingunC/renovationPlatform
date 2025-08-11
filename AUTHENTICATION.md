# Authentication System Documentation

This document describes the comprehensive authentication system implemented for the Renovate Platform.

## Overview

The authentication system uses **Supabase Auth** integrated with a custom user management system built on **Prisma** and **PostgreSQL**. It supports role-based access control with two user types: **Customers** and **Contractors**.

## Features

### 🔐 Core Authentication
- **Sign Up**: Email/password registration with user type selection
- **Sign In**: Email/password login with role-based redirects
- **Sign Out**: Secure session termination
- **Password Reset**: Email-based password recovery
- **Session Management**: Persistent login sessions
- **Remember Me**: Optional extended session duration

### 👥 User Types & Routing
- **Customer**: Access to `/request`, `/my-projects`, `/compare`
- **Contractor**: Access to `/dashboard`, `/bids`, `/contractor-onboarding`
- **Protected Routes**: Automatic redirects based on authentication and role
- **Onboarding Flow**: Guided setup for new contractors

### 🛡️ Security Features
- **Middleware Protection**: Route-level access control
- **Type-based Authorization**: Role verification for sensitive actions
- **Secure Redirects**: Safe redirect handling with validation
- **CSRF Protection**: Built-in security measures

## File Structure

```
app/
├── (auth)/
│   ├── login/page.tsx              # Enhanced login with forgot password
│   ├── register/page.tsx           # Tabbed registration (Customer/Contractor)
│   └── contractor-onboarding/page.tsx
├── auth/
│   ├── callback/route.ts           # Supabase auth callback handler
│   └── reset-password/page.tsx     # Password reset form
├── api/
│   ├── auth/
│   │   └── profile/route.ts        # User profile management
│   └── contractors/route.ts        # Contractor profile management
└── middleware.ts                   # Route protection & access control

components/forms/
├── login-form.tsx                  # Enhanced login form
├── register-form.tsx               # Type-aware registration
└── contractor-onboarding-form.tsx  # Business profile setup

lib/
└── supabase.ts                     # Auth clients & helper functions
```

## User Registration Flow

### Customer Registration
1. User selects "I'm a Homeowner" tab
2. Fills out: name, email, phone, password
3. Creates Supabase auth account
4. Creates user profile in database
5. Redirects to `/request` (project submission)

### Contractor Registration
1. User selects "I'm a Contractor" tab
2. Fills out: name, email, phone, password
3. Creates Supabase auth account
4. Creates user profile in database
5. Redirects to `/contractor-onboarding` (business setup)

## Login Flow

### Authentication Process
1. User enters email/password
2. Supabase authentication validation
3. Fetch user profile from database
4. Role-based redirect:
   - **Customer** → `/my-projects`
   - **Contractor (complete profile)** → `/dashboard`
   - **Contractor (incomplete)** → `/contractor-onboarding`

### Forgot Password
1. User clicks "Forgot password?" link
2. Enters email address
3. Receives reset link via email
4. Redirects to secure password reset page
5. Updates password and returns to login

## Middleware Protection

The middleware (`middleware.ts`) handles:

### Route Protection
- **Public routes**: `/`, `/login`, `/register`, `/auth/*`
- **Customer routes**: `/request`, `/my-projects`, `/compare`
- **Contractor routes**: `/dashboard`, `/bids`, `/contractor-onboarding`

### Access Control Logic
```typescript
// Unauthenticated users → redirect to login
if (!session && !isPublicRoute) {
  redirect('/login?redirectTo=' + pathname)
}

// Wrong user type → redirect to appropriate dashboard
if (userType === 'CUSTOMER' && isContractorRoute) {
  redirect('/my-projects')
}

// Incomplete contractor profile → force onboarding
if (userType === 'CONTRACTOR' && !hasContractorProfile) {
  redirect('/contractor-onboarding')
}
```

## API Endpoints

### Authentication
- `POST /api/auth` - Sign up/in/out
- `GET /api/auth/profile?id={userId}` - Get user profile
- `POST /api/auth/profile` - Create user profile
- `PUT /api/auth/profile` - Update user profile

### Contractor Management
- `POST /api/contractors` - Create contractor profile
- `GET /api/contractors?userId={id}` - Get contractor profile
- `PUT /api/contractors` - Update contractor profile

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  type user_type NOT NULL, -- 'CUSTOMER' | 'CONTRACTOR'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Contractors Table
```sql
CREATE TABLE contractors (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  business_name VARCHAR NOT NULL,
  business_number VARCHAR,
  service_areas TEXT[],
  categories TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  insurance_verified BOOLEAN DEFAULT FALSE,
  wsib_verified BOOLEAN DEFAULT FALSE
);
```

## Environment Variables

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## Usage Examples

### Client-side Authentication
```typescript
import { supabase, authHelpers } from '@/lib/supabase'

// Sign up
const { data, error } = await authHelpers.signUp(
  email, 
  password, 
  { name, phone, user_type: 'CUSTOMER' }
)

// Sign in
const { data, error } = await authHelpers.signIn(email, password)

// Get current user
const { data: { user } } = await authHelpers.getUser()

// Sign out
await authHelpers.signOut()
```

### Server-side Authentication
```typescript
import { createSupabaseServerClient } from '@/lib/supabase'

// In API routes or server components
const supabase = await createSupabaseServerClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Protecting Server Actions
```typescript
import { createSupabaseServerClient } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function createProject(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // Fetch user profile to check role
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id }
  })
  
  if (userProfile?.type !== 'CUSTOMER') {
    throw new Error('Access denied')
  }
  
  // Create project...
}
```

## Security Considerations

### Password Requirements
- Minimum 6 characters
- Validated on both client and server
- Secure Supabase password policies

### Session Security
- HTTP-only cookies for session storage
- Automatic session refresh
- Secure logout with token invalidation

### CSRF Protection
- Built-in Next.js CSRF protection
- Supabase JWT validation
- Secure cookie configuration

### Authorization Checks
- Middleware-level route protection
- API endpoint user verification
- Database-level user type validation

## Error Handling

### Authentication Errors
- Invalid credentials → User-friendly error messages
- Network errors → Retry mechanisms
- Session expiry → Automatic re-authentication prompts

### Authorization Errors
- Wrong user type → Automatic redirect
- Missing permissions → Access denied messages
- Incomplete profiles → Onboarding flow

## Testing the Authentication System

### Manual Testing Steps

1. **Registration Flow**:
   - Visit `/register`
   - Test both Customer and Contractor tabs
   - Verify email validation and password requirements
   - Check redirects after successful registration

2. **Login Flow**:
   - Visit `/login`
   - Test valid/invalid credentials
   - Verify role-based redirects
   - Test "Remember me" functionality

3. **Protected Routes**:
   - Try accessing `/dashboard` without authentication
   - Login as Customer and try accessing Contractor routes
   - Verify middleware redirects work correctly

4. **Password Reset**:
   - Use "Forgot password?" link
   - Check email delivery (if configured)
   - Test password reset flow

## Troubleshooting

### Common Issues

1. **"User not found" errors**:
   - Ensure user profile is created after Supabase registration
   - Check database connection and user table

2. **Infinite redirect loops**:
   - Verify middleware logic for user type checking
   - Check that contractor profiles exist for contractor users

3. **Session not persisting**:
   - Verify Supabase configuration
   - Check cookie settings and domain configuration

4. **Email not sending**:
   - Configure Supabase email templates
   - Set up custom SMTP if needed

### Development Tips

- Use Supabase Dashboard to monitor auth events
- Check browser Network tab for API call errors
- Use `console.log` in middleware for debugging redirects
- Test with different user types and profile states
