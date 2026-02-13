import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '../proxy';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url) => ({ type: 'redirect', url })),
  },
  NextRequest: jest.fn(),
}));

describe('Proxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing /dashboard without token', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard',
        },
        url: 'http://localhost:3000/dashboard',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(request.cookies.get).toHaveBeenCalledWith('access_token');
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/login',
        })
      );
    });

    it('should redirect to login when accessing /dashboard/nested without token', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard/nested/path',
        },
        url: 'http://localhost:3000/dashboard/nested/path',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should redirect to login when accessing /profile without token', () => {
      const request = {
        nextUrl: {
          pathname: '/profile',
        },
        url: 'http://localhost:3000/profile',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(request.cookies.get).toHaveBeenCalledWith('access_token');
      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should allow access to /dashboard when token exists', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard',
        },
        url: 'http://localhost:3000/dashboard',
        cookies: {
          get: jest.fn(() => ({ value: 'valid-token' })),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(request.cookies.get).toHaveBeenCalledWith('access_token');
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow access to /profile when token exists', () => {
      const request = {
        nextUrl: {
          pathname: '/profile',
        },
        url: 'http://localhost:3000/profile',
        cookies: {
          get: jest.fn(() => ({ value: 'valid-token' })),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should include "from" parameter in redirect URL', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard/settings',
        },
        url: 'http://localhost:3000/dashboard/settings',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          searchParams: expect.any(URLSearchParams),
        })
      );
    });
  });

  describe('Login Page', () => {
    it('should redirect to /dashboard when accessing /login with valid token', () => {
      const request = {
        nextUrl: {
          pathname: '/login',
        },
        url: 'http://localhost:3000/login',
        cookies: {
          get: jest.fn(() => ({ value: 'valid-token' })),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/dashboard',
        })
      );
    });

    it('should allow access to /login without token', () => {
      const request = {
        nextUrl: {
          pathname: '/login',
        },
        url: 'http://localhost:3000/login',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('Public Routes', () => {
    it('should allow access to home page without token', () => {
      const request = {
        nextUrl: {
          pathname: '/',
        },
        url: 'http://localhost:3000/',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow access to public routes without token', () => {
      const publicPaths = ['/about', '/contact', '/dataset'];

      publicPaths.forEach((path) => {
        jest.clearAllMocks();

        const request = {
          nextUrl: {
            pathname: path,
          },
          url: `http://localhost:3000${path}`,
          cookies: {
            get: jest.fn(() => undefined),
          },
        } as unknown as NextRequest;

        proxy(request);

        // Should not redirect
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with empty token value', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard',
        },
        url: 'http://localhost:3000/dashboard',
        cookies: {
          get: jest.fn(() => ({ value: '' })),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should handle requests with null token', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard',
        },
        url: 'http://localhost:3000/dashboard',
        cookies: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should handle nested protected routes correctly', () => {
      const nestedPaths = ['/dashboard/settings', '/dashboard/reports/view', '/profile/edit'];

      nestedPaths.forEach((path) => {
        jest.clearAllMocks();

        const request = {
          nextUrl: {
            pathname: path,
          },
          url: `http://localhost:3000${path}`,
          cookies: {
            get: jest.fn(() => undefined),
          },
        } as unknown as NextRequest;

        proxy(request);

        expect(NextResponse.redirect).toHaveBeenCalled();
      });
    });

    it('should handle register page without token', () => {
      const request = {
        nextUrl: {
          pathname: '/register',
        },
        url: 'http://localhost:3000/register',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should handle verify-email page without token', () => {
      const request = {
        nextUrl: {
          pathname: '/verify-email',
        },
        url: 'http://localhost:3000/verify-email',
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });
  });
});
