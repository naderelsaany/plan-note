export default function sitemap() {
  const baseUrl = 'https://plan-note-psi.vercel.app';

  const pages = [
    '',
    '/dashboard',
    '/features',
    '/about',
    '/privacy',
    '/terms',
    '/blog',
    '/blog/best-note-taking-methods-2026',
    '/blog/linear-notes-vs-mindmaps',
    '/blog/how-to-build-pwa',
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' || page === '/blog' ? 'weekly' : 'monthly',
    priority: page === '' ? 1 : page.startsWith('/blog/') ? 0.7 : 0.8,
  }));
}
