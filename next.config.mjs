const isProd = process.env.NODE_ENV === 'production'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isProd ? 'export' : undefined,
  assetPrefix: isProd ? './' : undefined
};

export default nextConfig;
