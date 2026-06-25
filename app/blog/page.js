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
      slug: '/blog/best-note-taking-methods-2026',
    },
    {
      id: 2,
      title: 'الفرق بين الملاحظات الخطية والخرائط الذهنية',
      excerpt: 'متى يجب أن تستخدم الملاحظات النصية ومتى تنتقل إلى لوحة التخطيط البصري؟',
      date: '20 يونيو 2026',
      slug: '/blog/linear-notes-vs-mindmaps',
    },
    {
      id: 3,
      title: 'كيف تبني تطبيق PWA ناجح؟',
      excerpt: 'نظرة تقنية وراء الكواليس لكيفية بناء تطبيق Plan+Note كـ Progressive Web App.',
      date: '15 يونيو 2026',
      slug: '/blog/how-to-build-pwa',
    },
    {
      id: 4,
      title: 'أفضل تطبيقات الملاحظات العربية في 2026',
      excerpt: 'مقارنة بين أفضل تطبيقات الملاحظات العربية المتاحة في 2026 مع مميزات وعيوب كل تطبيق.',
      date: '10 يونيو 2026',
      slug: '/blog/best-arabic-note-apps',
    },
    {
      id: 5,
      title: 'أفضل أدوات التخطيط المجانية للمشاريع الصغيرة',
      excerpt: 'دليل بأفضل أدوات التخطيط المجانية للمشاريع الصغيرة والأفراد مع نصائح للاستخدام الأمثل.',
      date: '5 يونيو 2026',
      slug: '/blog/free-planning-tools',
    },
    {
      id: 6,
      title: 'تأثير الخرائط الذهنية على الإنتاجية',
      excerpt: 'استكشف السر العلمي وراء الخرائط الذهنية وكيف تساعد دماغك على مضاعفة سرعته وإنتاجيته.',
      date: '1 يونيو 2026',
      slug: '/blog/mindmap-productivity-impact',
    },
    {
      id: 7,
      title: 'كيفية إدارة الوقت بفعالية للطلاب والموظفين',
      excerpt: 'استراتيجيات عملية لعام 2026 للتغلب على ضيق الوقت والموازنة بين العمل والحياة الشخصية.',
      date: '28 مايو 2026',
      slug: '/blog/time-management-for-students-and-employees',
    },
    {
      id: 8,
      title: 'قوة التنظيم البصري للمعلومات',
      excerpt: 'كيف تفكر وتخطط بعينيك؟ فوائد استخدام المخططات واللوحات اللانهائية في تبسيط المعلومات.',
      date: '20 مايو 2026',
      slug: '/blog/visual-organization-power',
    },
    {
      id: 9,
      title: 'دليل شامل لأدوات الإنتاجية في 2026',
      excerpt: 'كيف تبني "نظام تشغيل شخصي" متكامل لزيادة الإنتاجية وتقليل التشتت بين التطبيقات؟',
      date: '15 مايو 2026',
      slug: '/blog/productivity-tools-guide-2026',
    },
    {
      id: 10,
      title: 'كيفية تحويل الأفكار إلى خطط عمل قابلة للتنفيذ',
      excerpt: 'خطوات عملية لتحويل الأفكار العشوائية من مجرد أحلام إلى خطط عمل واضحة باستخدام أدوات ذكية.',
      date: '10 مايو 2026',
      slug: '/blog/turning-ideas-into-action-plans',
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
