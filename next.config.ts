import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com'], // 添加允许的图片域名
  },
};

export default nextConfig;
