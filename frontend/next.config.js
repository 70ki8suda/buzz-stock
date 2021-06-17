const path = require('path');
const withReactSvg = require('next-react-svg');
module.exports = withReactSvg({
  distDir: 'build',
  reactStrictMode: true,
  poweredByHeader: false,
  include: path.resolve(__dirname, 'src/public/images'),
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
});
