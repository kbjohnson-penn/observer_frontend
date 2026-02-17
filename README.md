# Observer Frontend

Next.js 16.1.6 frontend application for healthcare data visualization and analysis.

## Features

- **Interactive Dashboards**: Healthcare metrics and patient data visualization
- **JWT Authentication**: Secure token-based authentication with auto-refresh
- **Responsive Design**: Optimized for desktop and mobile devices
- **Hybrid Styling**: Chakra UI v3 components + TailwindCSS utilities
- **TypeScript**: Full type safety and IntelliSense support
- **App Router**: Next.js 16.1.6 App Router architecture

**Note**: This is a Git submodule. For Docker setup, see the main repository README.

## Development Setup

**Prerequisites**: This submodule is designed to run via Docker from the main repository.

### Local Development (without Docker)

If you need to run locally:

```bash
# Install dependencies
npm install

# Configure environment (see main repo /env/ files)
# Copy .env.local.example to .env.local if needed

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint checks
npx tsc --noEmit    # TypeScript checks
npm run format       # Prettier code formatting
npm run test        # Run tests (if implemented)
```

## Architecture

### Framework Stack

- **Next.js 16.1.6** with App Router
- **TypeScript** for type safety
- **Chakra UI v3** component library
- **TailwindCSS** utility classes (hybrid approach)
- **Axios** for API communication with JWT token management

### Authentication System

- JWT-based authentication with access/refresh tokens
- Automatic token refresh via axios interceptors
- AuthContext provides authentication state management
- Protected routes via middleware

### Project Structure

```
src/
├── app/               # Next.js App Router pages and layouts
│   ├── dashboard/     # Protected dashboard pages
│   ├── login/         # Authentication pages
│   └── layout.tsx     # Root layout with providers
├── components/        # Reusable UI components
│   ├── ui/            # Chakra UI component wrappers
│   └── navigation/    # Navigation and layout components
├── contexts/          # React context providers (AuthContext)
├── interfaces/        # TypeScript type definitions
├── lib/               # API client and utilities
└── proxy.ts           # Authentication proxy
```

### Environment Configuration

```bash
# Required environment variable
NEXT_PUBLIC_BACKEND_API=http://backend:8000/api/v1
```

### Styling Approach

- **Hybrid styling**: Chakra UI components with TailwindCSS utilities
- Use Chakra UI's style props for component-specific styling
- Use TailwindCSS classes for layout and general styling
- Responsive design with mobile-first approach

### API Integration

- API client with automatic JWT token management
- Axios interceptors for authentication and error handling
- Type-safe API calls with TypeScript interfaces
- Error handling and loading states

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog

For version details and update history, see [CHANGELOG.md](CHANGELOG.md).
