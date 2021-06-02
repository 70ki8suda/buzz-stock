const path = require('path');

module.exports = {
  distDir: 'build',
  reactStrictMode: true,
  poweredByHeader: false,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      src: path.join(__dirname, 'src/'),
    };
    return config;
  },
  images: {
    domains: ['buzz-stock-nest.s3.ap-northeast-3.amazonaws.com'],
  },
};
