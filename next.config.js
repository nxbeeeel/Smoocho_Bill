const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // PWA Configuration
  scope: '/',
  sw: 'sw.js',
  fallbacks: {
    document: '/offline'
  },
  
  // Build optimization
  buildExcludes: [
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/
  ],
  
  // Runtime caching strategies
  runtimeCaching: [
    // Google Fonts
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
    },
    // Google Fonts CSS
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    // Static assets
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // API calls
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutes
        },
        networkTimeoutSeconds: 10
      }
    },
    // Static pages
    {
      urlPattern: /^\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ],
  
  // Additional PWA features
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  
  // Workbox configuration
  workboxOptions: {
    disableDevLogs: true,
    clientsClaim: true,
    skipWaiting: true
  }
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
