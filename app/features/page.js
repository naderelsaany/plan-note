import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import { FileText, Layout, Download, Share2, Shield, Zap } from 'lucide-react';

export const metadata = {
  title: 'المميزات',
  description: 'اكتشف جميع مميزات تطبيق Plan+Note من ملاحظات نصية، لوحة تخطيط لانهائية، وتصدير عالي الجودة.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'المميزات | Plan+Note',
    description: 'اكتشف جميع مميزات تطبيق Plan+Note من ملاحظات نصية، لوحة تخطيط لانهائية، وتصدير عالي الجودة.',
    url: 'https://plan-note-psi.vercel.app/features',
  },
};

export default function FeaturesPage() {
  const allFeatures = [
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: 'ملاحظات نصية ذكية',
      desc: 'محرر نصوص حديث ومرتب يدعم العربية بشكل أصيل، مع إمكانية التنسيق، القوائم، والروابط.',
    },
    {
      icon: <Layout className="w-8 h-8 text-purple-500" />,
      title: 'لوحة تخطيط لانهائية',
      desc: 'مساحة عمل بلا حدود (Canvas) مبنية على Excalidraw، تتيح لك رسم الخرائط الذهنية وتوضيح الأفكار المعقدة.',
    },
    {
      icon: <Download className="w-8 h-8 text-green-500" />,
      title: 'تصدير بجودة عالية',
      desc: 'صدّر رسوماتك وملاحظاتك كملفات SVG أو PNG بدقة عالية لا تتأثر بالتكبير والتصغير.',
    },
    {
      icon: <Share2 className="w-8 h-8 text-pink-500" />,
      title: 'مزامنة سحابية',
      desc: 'ملاحظاتك ولوحاتك تُحفظ تلقائياً في السحابة بفضل خوادم Firebase السريعة، لتصل إليها من أي جهاز.',
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: 'أمان وخصوصية',
      desc: 'تسجيل دخول آمن عبر حساب Google مع قواعد أمان صارمة تضمن أن لا أحد غيرك يمكنه قراءة ملاحظاتك.',
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'تطبيق هاتف (PWA)',
      desc: 'قم بتثبيت التطبيق على هاتفك المحمول كأي تطبيق عادي ليعمل بسرعة خيالية وبدون تحميل من المتاجر.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">مميزات التطبيق</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            كل الأدوات التي تحتاجها لترتيب فوضى الأفكار، مجمعة في مكان واحد.
          </p>
        </div>

        <h2 className="sr-only">قائمة المميزات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allFeatures.map((f) => (
            <article key={f.title} className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-border text-center">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
