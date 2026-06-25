import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const metadataMap = {
    'best-note-taking-methods-2026': {
      title: 'أفضل طرق تدوين الملاحظات في 2026 | Plan+Note',
      description: 'اكتشف أفضل طرق تدوين الملاحظات في 2026: من الطرق التقليدية إلى الرقمية، وكيف تختار الطريقة المناسبة لك.',
    },
    'linear-notes-vs-mindmaps': {
      title: 'الفرق بين الملاحظات الخطية والخرائط الذهنية | Plan+Note',
      description: 'مقارنة شاملة بين الملاحظات الخطية والخرائط الذهنية: أيهما أفضل للتنظيم والإبداع؟',
    },
    'how-to-build-pwa': {
      title: 'كيف تبني تطبيق PWA ناجح؟ دليل شامل 2026 | Plan+Note',
      description: 'دليل خطوة بخطوة لبناء تطبيق PWA ناجح: من المفهوم إلى النشر مع أفضل الممارسات.',
    },
    'best-arabic-note-apps': {
      title: 'أفضل تطبيقات الملاحظات العربية في 2026 | Plan+Note',
      description: 'مقارنة بين أفضل تطبيقات الملاحظات العربية المتاحة في 2026 مع مميزات وعيوب كل تطبيق.',
    },
    'free-planning-tools': {
      title: 'أفضل أدوات التخطيط المجانية للمشاريع الصغيرة | Plan+Note',
      description: 'دليل بأفضل أدوات التخطيط المجانية للمشاريع الصغيرة والأفراد مع نصائح للاستخدام الأمثل.',
    }
  };

  const meta = metadataMap[slug] || {
    title: `المقال | Plan+Note`,
    description: 'مقال تفصيلي من مدونة تطبيق Plan+Note.',
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://plan-note-psi.vercel.app/blog/${slug}`
    }
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <Link href="/blog" className="text-blue-600 hover:underline mb-8 inline-block font-bold">
          &rarr; العودة للمدونة
        </Link>
        <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 prose prose-blue prose-lg max-w-none">
          <span className="text-gray-500 font-bold mb-4 block">25 يونيو 2026</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            محتوى المقال (تجريبي): {slug.split('-').join(' ')}
          </h1>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            هذا محتوى تجريبي للمقال لكي تظهر الصفحة في نتائج بحث جوجل كصفحة مستقلة (Dynamic Route). 
            في المستقبل، سيتم ربط هذه الصفحة بقاعدة بيانات مثل Firebase أو CMS حقيقي لجلب محتوى كل مقالة ديناميكياً بناءً على الرابط الخاص بها.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            الهدف الحالي من هذه الصفحة هو تطبيق توصيات الـ SEO بجعل كل مقالة تملك عنوان URL مستقل (مثل `/blog/slug`) حتى يزحف إليها Googlebot بنجاح، بدلاً من تكدس كل شيء في صفحة المدونة الرئيسية.
          </p>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
