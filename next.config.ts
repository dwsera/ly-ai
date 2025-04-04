// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'standalone'，Cloudflare Pages 不需要
  // 可选：如果需要其他实验性功能，可以保留 experimental
  experimental: {
    // runtime: 'edge' 不需要全局设置，移到具体页面
  },
};

// 在开发环境下启用 Cloudflare 绑定支持
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform(); // 移除 await，直接调用
}

module.exports = nextConfig;
