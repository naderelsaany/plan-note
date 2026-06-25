export default function manifest() {
  return {
    name: 'Plan+Note',
    short_name: 'Plan+Note',
    description: 'تطبيق عربي متكامل يجمع بين الملاحظات النصية ولوحة التخطيط اللانهائية.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
