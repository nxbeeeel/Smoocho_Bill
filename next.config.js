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
  // Completely disable minification for better error details
  webpack: (config, { dev, isServer }) => {
    // Always disable minification
    config.optimization.minimize = false
    config.optimization.minimizer = []
    
    // Add source maps for better debugging
    config.devtool = 'source-map'
    
    return config
  }
}

module.exports = withPWA(nextConfig)
