/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint and TypeScript checks enabled for production builds
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true,
  },
  // Environment-aware hostname binding
  // Development: localhost (avoids Windows permission issues)
  // Production: 0.0.0.0 (needed for Docker/server)
  host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://backend:3003/api/:path*'
          : 'http://backend:3003/api/:path*',
      },
    ]
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    }
    return config
  },
}

export default nextConfig
