# Technology Stack - Package Configuration

## Project Information
- **Name**: frontend
- **Version**: 0.1.0
- **Type**: Private project

## Available Scripts

### Development
- **`npm run dev`**: Start Next.js development server with hot reload
- **`npm run build`**: Create optimized production build
- **`npm run start`**: Start production server
- **`npm run lint`**: Run ESLint for code quality checks

## Core Framework Dependencies

### Next.js & React
- **next**: ^14.2.4 - React framework with App Router
- **react**: ^18 - Core React library
- **react-dom**: ^18 - React DOM rendering

### UI Framework
- **@chakra-ui/react**: ^3.2.0 - Component library
- **@emotion/react**: ^11.13.5 - CSS-in-JS for Chakra UI
- **@emotion/styled**: ^11.13.5 - Styled components for Chakra UI
- **framer-motion**: ^11.11.17 - Animation library for Chakra UI

## Healthcare Data Visualization

### Charts and Analytics
- **recharts**: ^2.10.4 - React chart library for healthcare dashboards
- **d3**: ^7.9.0 - Data visualization and manipulation
- **three-spritetext**: ^1.8.2 - 3D text rendering for advanced visualizations

### Data Processing
- **papaparse**: ^5.4.1 - CSV parsing for data export functionality
- **date-fns**: ^3.6.0 - Date manipulation for encounter timestamps
- **date-fns-tz**: ^3.1.3 - Timezone handling for healthcare data

## HTTP and State Management

### API Integration
- **axios**: ^1.7.7 - HTTP client with JWT token management
- **js-cookie**: ^3.0.5 - Secure cookie management for authentication

### Form Management
- **react-datepicker**: ^6.6.0 - Date selection for encounter filtering
- **react-select**: ^5.8.0 - Advanced dropdown components

## Styling System

### Hybrid Approach
- **tailwindcss**: ^3.3.0 - Utility-first CSS framework
- **autoprefixer**: ^10.0.1 - CSS vendor prefixing
- **postcss**: ^8 - CSS processing
- **next-themes**: ^0.4.3 - Dark/light mode support

## Icons and Visual Elements

### Icon Libraries
- **@fortawesome/fontawesome-svg-core**: ^6.5.1 - FontAwesome core
- **@fortawesome/free-solid-svg-icons**: ^6.5.1 - Solid icon set
- **@fortawesome/react-fontawesome**: ^0.2.0 - React FontAwesome components
- **react-icons**: ^5.4.0 - Additional icon collection

## Development Tools

### TypeScript Support
- **typescript**: ^5 - Type safety and enhanced development experience
- **@types/node**: ^20 - Node.js type definitions
- **@types/react**: ^18 - React type definitions
- **@types/react-dom**: ^18 - React DOM type definitions
- **@types/d3**: ^7.4.3 - D3 visualization type definitions
- **@types/js-cookie**: ^3.0.6 - Cookie management type definitions
- **@types/papaparse**: ^5.3.14 - CSV parsing type definitions
- **@types/react-datepicker**: ^6.2.0 - Date picker type definitions

### Build Tools
- **@swc/cli**: ^0.5.1 - Fast JavaScript/TypeScript compiler
- **@swc/core**: ^1.6.6 - SWC compiler core
- **next-transpile-modules**: ^10.0.1 - Module transpilation for Next.js

### Code Quality
- **eslint**: ^8 - JavaScript/TypeScript linting
- **eslint-config-next**: 14.0.4 - Next.js specific ESLint rules

## Image Optimization
- **sharp**: ^0.33.4 - High-performance image processing for Next.js

## Architecture Highlights

### Modern React Stack
- **Next.js 14** with App Router for improved performance and developer experience
- **React 18** with latest features and optimizations
- **TypeScript** throughout for type safety

### Healthcare-Focused Libraries
- **D3 + Recharts** combination for comprehensive data visualization
- **Date-fns** with timezone support for accurate medical encounter timestamps
- **PapaParse** for CSV export functionality required in research environments

### Hybrid Styling Strategy
- **Chakra UI** for consistent component design system
- **TailwindCSS** for utility-based styling and rapid development
- **Emotion** for CSS-in-JS support with Chakra UI

### Performance Optimizations
- **SWC compiler** for faster builds compared to Babel
- **Sharp** for optimized image processing
- **Next.js** built-in optimizations for production builds

### Developer Experience
- **ESLint** with Next.js configuration for code quality
- **TypeScript** with comprehensive type definitions
- **Hot reload** development server for rapid iteration

This technology stack is specifically chosen to support healthcare data visualization, research-grade data export, and compliance with medical data handling requirements while maintaining modern development practices and performance standards.
