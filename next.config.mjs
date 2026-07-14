/** @type {import('next').NextConfig} */

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' blob: data: https://*.basemaps.cartocdn.com https://unpkg.com;
  connect-src 'self' https://nominatim.openstreetmap.org;
  frame-ancestors 'none';
  frame-src 'self' https://challenges.cloudflare.com;
  require-trusted-types-for 'script';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  }
];

const nextConfig = {
  swcMinify: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
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
