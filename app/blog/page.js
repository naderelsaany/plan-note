import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import Link from 'next/link';

export const metadata = {
  title: 'المدونة | Plan+Note',
  description: 'مقالات وأفكار حول الإنتاجية، تدوين الملاحظات، وكيفية التخطيط الفعال للمشاريع.',
};

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: 'أفضل طرق تدوين الملاحظات في 2026',
      excerpt: 'تعرف على أحدث الاستراتيجيات لترتيب أفكارك وزيادة إنتاجيتك باستخدام الملاحظات الرقمية.',
      date: '25 يونيو 2026',
      slug: '#',
    },
    {
      id: 2,
      title: 'الفرق بين الملاحظات الخطية والخرائط الذهنية',
      excerpt: 'متى يجب أن تستخدم الملاحظات النصية ومتى تنتقل إلى لوحة التخطيط البصري؟',
      date: '20 يونيو 2026',
      slug: '#',
    },
    {
      id: 3,
      title: 'كيف تبني تطبيق PWA ناجح؟',
      excerpt: 'نظرة تقنية وراء الكواليس لكيفية بناء تطبيق Plan+Note كـ Progressive Web App.',
      date: '15 يونيو 2026',
      slug: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">مدونة التطبيق</h1>
          <p className="text-xl text-gray-600">
            أفكار، مقالات، وتحديثات حول الإنتاجية والعمل الفعّال.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-sm text-blue-600 font-bold mb-2 block">{post.date}</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link href={post.slug} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <Link href={post.slug} className="text-blue-600 font-bold hover:underline">
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
