/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.polygon.io',
        pathname: '/v1/reference/company-branding/**',
      },
      {
        protocol: 'https',
        hostname: '**.polygon.io',
      },
    ],
  },
};

export default nextConfig;
