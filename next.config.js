/// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',   // For Cloudinary images
      'img.clerk.com',        // For Clerk avatars
      'images.clerk.dev',     // (Optional, for Clerk dev images)
      'api.dicebear.com',     // For Dicebear Avatars
    ],
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript build errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during build
  },
};

module.exports = nextConfig;


