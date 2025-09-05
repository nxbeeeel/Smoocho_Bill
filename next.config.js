const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Optimize PWA configuration
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Enable production optimizations
  reactStrictMode: true,
  swcMinify: true, // Enable SWC minification
  // Enable production optimizations
  webpack: (config, { dev, isServer }) => {
    // Only disable minification in development for debugging
    if (dev) {
      config.optimization.minimize = false
      config.optimization.minimizer = []
      config.devtool = 'source-map'
    } else {
      // Enable production optimizations
      config.optimization.minimize = true
      config.devtool = false
    }
    
    return config
  }
}

module.exports = withPWA(nextConfig)
