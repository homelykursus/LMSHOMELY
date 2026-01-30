import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Basic optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-select', 
      '@radix-ui/react-tabs',
      'lucide-react',
      'recharts'
    ]
  },

  // Server external packages (for Word processing)
  serverExternalPackages: [
    'mammoth',
    'docxtemplater',
    'pizzip',
    'libreoffice-convert',
    'sharp'
  ],

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Handle Word processing dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
      buffer: false,
    };

    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },

  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Basic settings
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;