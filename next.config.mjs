import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.js',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development', // تعطيل الـ PWA في التطوير لتجنب مشاكل الكاش
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ضروري لـ Excalidraw
  transpilePackages: ['@excalidraw/excalidraw'],
};

export default withSerwist(nextConfig);
