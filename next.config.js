/** @type {import('next').NextConfig} */
const nextConfig = {
  dynamic: 'force-dynamic',
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
