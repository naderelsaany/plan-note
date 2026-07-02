import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'المدونة',
  description: 'مقالات وأفكار حول الإنتاجية، تدوين الملاحظات، وكيفية التخطيط الفعال للمشاريع.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'المدونة | Plan+Note',
    description: 'مقالات وأفكار حول الإنتاجية، تدوين الملاحظات، وكيفية التخطيط الفعال للمشاريع.',
    url: '/blog',
  },
};

// Metadata map for date/excerpt since markdown files don't have frontmatter
const postsMetadata = {
  'best-note-taking-methods-2026': {
    date: '2026-06-25',
    dateAr: '25 يونيو 2026',
    excerpt: 'تعرف على أحدث الاستراتيجيات لترتيب أفكارك وزيادة إنتاجيتك باستخدام الملاحظات الرقمية.',
  },
  'linear-notes-vs-mindmaps': {
    date: '2026-06-20',
    dateAr: '20 يونيو 2026',
    excerpt: 'متى يجب أن تستخدم الملاحظات النصية ومتى تنتقل إلى لوحة التخطيط البصري؟',
  },
  'how-to-build-pwa': {
    date: '2026-06-15',
    dateAr: '15 يونيو 2026',
    excerpt: 'نظرة تقنية وراء الكواليس لكيفية بناء تطبيق Plan+Note كـ Progressive Web App.',
  },
  'best-arabic-note-apps': {
    date: '2026-06-10',
    dateAr: '10 يونيو 2026',
    excerpt: 'مقارنة بين أفضل تطبيقات الملاحظات العربية المتاحة في 2026 مع مميزات وعيوب كل تطبيق.',
  },
  'free-planning-tools': {
    date: '2026-06-05',
    dateAr: '5 يونيو 2026',
    excerpt: 'دليل بأفضل أدوات التخطيط المجانية للمشاريع الصغيرة والأفراد مع نصائح للاستخدام الأمثل.',
  },
  'mindmap-productivity-impact': {
    date: '2026-06-01',
    dateAr: '1 يونيو 2026',
    excerpt: 'استكشف السر العلمي وراء الخرائط الذهنية وكيف تساعد دماغك على مضاعفة سرعته وإنتاجيته.',
  },
  'time-management-for-students-and-employees': {
    date: '2026-05-28',
    dateAr: '28 مايو 2026',
    excerpt: 'استراتيجيات عملية لعام 2026 للتغلب على ضيق الوقت والموازنة بين العمل والحياة الشخصية.',
  },
  'visual-organization-power': {
    date: '2026-05-20',
    dateAr: '20 مايو 2026',
    excerpt: 'كيف تفكر وتخطط بعينيك؟ فوائد استخدام المخططات واللوحات اللانهائية في تبسيط المعلومات.',
  },
  'productivity-tools-guide-2026': {
    date: '2026-05-15',
    dateAr: '15 مايو 2026',
    excerpt: 'كيف تبني \"نظام تشغيل شخصي\" متكامل لزيادة الإنتاجية وتقليل التشتت بين التطبيقات؟',
  },
  'turning-ideas-into-action-plans': {
    date: '2026-05-10',
    dateAr: '10 مايو 2026',
    excerpt: 'خطوات عملية لتحويل الأفكار العشوائية من مجرد أحلام إلى خطط عمل واضحة باستخدام أدوات ذكية.',
  },
};

function getBlogPosts() {
  try {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const files = fs.readdirSync(blogDir);

    return files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const slug = file.replace('.md', '');
        const content = fs.readFileSync(path.join(blogDir, file), 'utf8');

        // Extract title from first # heading
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : slug;

        const meta = postsMetadata[slug] || {};

        return {
          slug,
          title,
          date: meta.date || '',
          dateAr: meta.dateAr || '',
          excerpt: meta.excerpt || '',
        };
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch {
    return [];
  }
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">مدونة التطبيق</h1>
          <p className="text-xl text-muted-foreground">
            أفكار، مقالات، وتحديثات حول الإنتاجية والعمل الفعّال.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.slug} className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <time dateTime={post.date} className="text-sm text-blue-600 font-bold mb-2 block">{post.dateAr}</time>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <Link href={`/blog/${post.slug}`} className="text-blue-600 font-bold hover:underline">
                اقرأ المزيد ←
              </Link>
            </article>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
