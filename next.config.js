const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Enable development mode for better error details
  reactStrictMode: true,
  swcMinify: false,
  // Disable minification to get better error details
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.optimization.minimize = false
    }
    return config
  }
}

module.exports = withPWA(nextConfig)
