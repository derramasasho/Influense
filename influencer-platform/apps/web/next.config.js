/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@influencer-platform/ui", "@influencer-platform/database"],
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'pbs.twimg.com',
      'instagram.com',
      'cloudinary.com'
    ],
  },
  i18n: {
    locales: ['en', 'bg'],
    defaultLocale: 'bg',
    localeDetection: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig