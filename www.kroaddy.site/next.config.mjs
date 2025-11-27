/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    
    env: {
      // Gateway URL (환경별 다름)
      GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:8080',
    },
    
    // Webpack 설정 (WebSocket 지원)
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          net: false,
          tls: false,
        };
      }
      return config;
    },
};

export default nextConfig;
