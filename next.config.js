/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Suppress pino-pretty warning (optional dependency)
    config.ignoreWarnings = [
      { module: /node_modules\/pino/ },
    ];
    
    return config;
  },
};

module.exports = nextConfig;
