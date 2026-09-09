import type { NextConfig } from 'next';

const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  assetPrefix: onGitHubPages ? '/Nyx2Brands/' : undefined,
};

export default nextConfig;
