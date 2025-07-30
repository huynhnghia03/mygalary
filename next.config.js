/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // Chỉ warning về lỗi type trong khi build, không fail build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Chỉ warning về lỗi eslint trong khi build, không fail build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
