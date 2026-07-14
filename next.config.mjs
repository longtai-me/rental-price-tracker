/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^async_hooks$/,
        (resource) => {
          resource.request = 'node:async_hooks';
        }
      )
    );
    return config;
  }
};

export default nextConfig;
