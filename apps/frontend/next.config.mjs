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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3003/api/:path*',
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
