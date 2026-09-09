import type { NextConfig } from 'next';

const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: onGitHubPages ? '/Nyx2Brands' : undefined,
  assetPrefix: onGitHubPages ? '/Nyx2Brands/' : undefined,
};

export default nextConfig;
