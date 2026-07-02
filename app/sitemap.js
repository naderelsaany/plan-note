import fs from 'fs';
import path from 'path';

export default async function sitemap() {
  const baseUrl = 'https://plan-note-psi.vercel.app';

  const staticPages = [
    '/',
    '/features',
    '/about',
    '/privacy',
    '/terms',
    '/blog',
  ];

  const sitemapEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page === '/' ? '' : page}`,
    lastModified: new Date('2026-06-25'), // Fixed date for static pages to avoid daily changes
    changeFrequency: page === '/' || page === '/blog' ? 'weekly' : 'monthly',
    priority: page === '/' ? 1 : 0.8,
  }));

  try {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const files = fs.readdirSync(blogDir);

    files.forEach((file) => {
      if (file.endsWith('.md')) {
        const slug = file.replace('.md', '');
        const filePath = path.join(blogDir, file);
        const stats = fs.statSync(filePath);

        sitemapEntries.push({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: stats.mtime,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });
  } catch (error) {
    console.error('Error generating sitemap for blog posts:', error);
  }

  return sitemapEntries;
}
