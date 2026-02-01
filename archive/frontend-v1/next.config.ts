import type { NextConfig } from 'next';

/**
 * Next.js Configuration for Project Bridge
 * 
 * Optimized for:
 * - Mobile-first African market (2G/3G connectivity)
 * - Static export for CDN deployment
 * - Minimal bundle size
 * - Tenant-aware feature loading
 */
const nextConfig: NextConfig = {
  // Static export for deployment to any static host
  output: 'export',
  distDir: 'dist',
  
  // Image optimization settings
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 640, 768, 1024],
    imageSizes: [64, 96, 128, 256],
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    NEXT_PUBLIC_DEFAULT_TENANT_ID: process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default',
  },

  // Bundle optimization
  experimental: {
    // Optimize barrel imports for common libraries
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Turbopack configuration
  turbopack: {},

  // Webpack customization for bundle optimization
  webpack: (config, { isServer, nextRuntime }) => {
    // Optimize client-side bundle
    if (!isServer) {
      // Split chunks more aggressively for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for third-party libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Common chunk for shared components
            common: {
              minChunks: 2,
              chunks: 'all',
              enforce: true,
              priority: 5,
            },
          },
        },
      };
    }

    return config;
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
