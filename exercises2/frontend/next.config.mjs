/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  // 静的サイト生成時のベースパス設定（必要に応じて調整）
  // basePath: '/your-app-name',
};

export default nextConfig;
