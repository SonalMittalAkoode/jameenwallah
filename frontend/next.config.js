/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable CSS minification in production
  experimental: {
    optimizeCss: false, // Disabled to avoid conflicts with Next.js 15
  },
  // Minify CSS in production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  sassOptions: {
    quietDeps: true,
    silenceDeprecations: [
      // "mixed-decls", // Removed - obsolete in newer Sass versions
      "legacy-js-api",
      "import",
      "slash-div",
      "global-builtin",
    ],
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
      outputStyle: 'compressed',
      precision: 5,
    }),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jameenwallahapi.akoodedemo.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "jameenwallahapi.akoodedemo.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
    // Allow unoptimized images for better compatibility with external URLs
    unoptimized: false,
  },
  // Note: Next.js 15 automatically handles tree shaking and optimization
  // Manual webpack optimization config removed to avoid conflicts with Next.js caching
};

module.exports = withBundleAnalyzer(nextConfig);
