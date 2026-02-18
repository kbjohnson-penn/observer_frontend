/**
 * Next.js Configuration for Observer Platform
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Experimental features
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },

  // Enable gzip compression for responses
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Use SWC minifier for better performance
  swcMinify: true,

  // Image optimization configuration
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Define device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Define image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features and APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy (CSP)
          // Note: Adjust this based on your specific needs and external resources
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Chakra UI
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:8000",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
      {
        // Add HSTS header for production domains only
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
        // Only apply in production (comment out if testing locally)
        has: [
          {
            type: 'host',
            value: '(?!localhost).*', // Not localhost
          },
        ],
      },
    ];
  },
};

export default nextConfig;
