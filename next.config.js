const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config to silence Next.js 16 warning while using next-pwa
  turbopack: {}
};

module.exports = withPWA(nextConfig);
