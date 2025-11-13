const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for next-pwa compatibility
  turbopack: false
};

module.exports = withPWA(nextConfig);
