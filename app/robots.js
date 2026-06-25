export default function robots() {
  const baseUrl = 'https://plan-note-psi.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/note/', '/canvas/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
