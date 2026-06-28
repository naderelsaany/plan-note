import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  try {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const files = fs.readdirSync(blogDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        slug: file.replace('.md', ''),
      }));
  } catch (e) {
    return [];
  }
}

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
    },
    'mindmap-productivity-impact': {
      title: 'تأثير الخرائط الذهنية على الإنتاجية | Plan+Note',
      description: 'استكشف السر العلمي وراء الخرائط الذهنية وكيف تساعد دماغك على مضاعفة سرعته وإنتاجيته.',
    },
    'time-management-for-students-and-employees': {
      title: 'كيفية إدارة الوقت بفعالية للطلاب والموظفين | Plan+Note',
      description: 'استراتيجيات عملية لعام 2026 للتغلب على ضيق الوقت والموازنة بين العمل والحياة الشخصية.',
    },
    'visual-organization-power': {
      title: 'قوة التنظيم البصري للمعلومات | Plan+Note',
      description: 'كيف تفكر وتخطط بعينيك؟ فوائد استخدام المخططات واللوحات اللانهائية في تبسيط المعلومات.',
    },
    'productivity-tools-guide-2026': {
      title: 'دليل شامل لأدوات الإنتاجية في 2026 | Plan+Note',
      description: 'كيف تبني نظام تشغيل شخصي متكامل لزيادة الإنتاجية وتقليل التشتت بين التطبيقات؟',
    },
    'turning-ideas-into-action-plans': {
      title: 'كيفية تحويل الأفكار إلى خطط عمل قابلة للتنفيذ | Plan+Note',
      description: 'خطوات عملية لتحويل الأفكار العشوائية من مجرد أحلام إلى خطط عمل واضحة باستخدام أدوات ذكية.',
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
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://plan-note-psi.vercel.app/blog/${slug}`,
    }
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  
  const contentPath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
  let content = '';
  try {
    content = fs.readFileSync(contentPath, 'utf8');
  } catch (error) {
    content = '# عذراً، المقال غير متوفر حالياً\nهذا المقال قيد الكتابة وسيكون متاحاً قريباً.';
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <Link href="/blog" className="text-primary hover:underline mb-8 inline-block font-bold">
          &rarr; العودة للمدونة
        </Link>
        <article className="bg-card p-8 md:p-12 rounded-3xl shadow-sm border border-border prose prose-blue prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
