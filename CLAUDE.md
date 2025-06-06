# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

- **Development**: `npm run dev` - Start Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Create production build
- **Production**: `npm run start` - Start production server
- **Linting**: `npm run lint` - Run ESLint checks
- **Type checking**: `npx tsc --noEmit` - Check TypeScript types (no dedicated script exists)

Note: No test scripts are currently configured in package.json despite being referenced in CONTRIBUTING.md.

## Architecture Overview

### Framework Stack
- **Next.js 14** with App Router (not Pages Router)
- **TypeScript** for type safety
- **Chakra UI v3** for component library
- **TailwindCSS** for utility styling (hybrid approach)
- **Axios** for API communication with JWT token management

### Authentication System
- JWT-based authentication with access/refresh tokens stored in secure cookies
- Automatic token refresh on 401 responses via axios interceptors
- Authentication context provides `isAuthenticated`, `login`, `logout`, `verify` methods
- **Currently disabled** in middleware for this release (see middleware.ts:5)

### Layout Architecture
- Root layout wraps everything with Provider (Chakra) and AuthProvider
- AppLayout component determines authenticated vs public layout based on auth state
- Two main layout types:
  - `AuthenticatedLayout` - For logged-in users with navigation/sidebar
  - `PublicLayout` - For public pages

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - Chakra UI component wrappers and custom components
- `src/components/navigation/` - Navigation and sidebar components
- `src/contexts/` - React contexts (currently only AuthContext)
- `src/interfaces/` - TypeScript type definitions for data models
- `src/lib/` - Utilities and API client configuration

### API Integration
- Base API URL configured via `NEXT_PUBLIC_BACKEND_API` environment variable
- API client in `src/lib/apiClient.ts` handles authentication headers and token refresh
- Default timeout: 5 seconds

### Environment Setup
Copy `.env.local.example` to `.env.local` and configure:
```
NEXT_PUBLIC_BACKEND_API=http://127.0.0.1:8000/api/v1
```

### Styling Approach
- **Hybrid styling**: Chakra UI components with TailwindCSS utilities
- Use Chakra UI's style props for component-specific styling
- Use TailwindCSS classes for layout and general styling
- Avoid custom CSS unless necessary

### Development Workflow
- Work in feature branches, create PRs against `dev` branch
- Follow conventional commit format: `feat:`, `fix:`, `docs:`, etc.
- Authentication is currently disabled in middleware for development