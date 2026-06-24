// ⚠️ Server Component (بدون use client لتحسين الـ SEO)
import { LandingAuthButton } from '@/components/landing-auth-button';
import { FAQItem } from '@/components/faq-item';
import { FileText, Layout, Download } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    title: 'ملاحظات نصية ذكية',
    desc: 'اكتب وتنسّق أفكارك بواجهة نظيفة تدعم العربية بالكامل مع حفظ تلقائي.',
  },
  {
    icon: <Layout className="w-8 h-8 text-purple-500" />,
    title: 'لوحة تخطيط لانهائية',
    desc: 'ارسم وخطّط بأشكال وأسهم وملاحظات لاصقة على لوحة بلا حدود.',
  },
  {
    icon: <Download className="w-8 h-8 text-green-500" />,
    title: 'تصدير احترافي',
    desc: 'صدّر لوحتك كملف SVG داخل Markdown بجودة متجهية لا تتأثر بالتكبير.',
  },
];

const faqs = [
  { q: 'هل التطبيق مجاني؟', a: 'نعم، Plan+Note مجاني بالكامل. سجّل بحساب Google وابدأ فوراً.' },
  { q: 'هل بياناتي آمنة؟', a: 'نعم. بياناتك محفوظة في Firebase مع قواعد أمان تضمن أن لا أحد سواك يصل إلى ملفاتك.' },
  { q: 'هل يعمل بدون إنترنت؟', a: 'جزئياً — الملاحظات والبيانات المُحمّلة مسبقاً متاحة بدون إنترنت، وتُزامن تلقائياً عند عودة الاتصال.' },
  { q: 'ما الفرق بين الملاحظة ولوحة التخطيط؟', a: 'الملاحظة للكتابة النصية. اللوحة للتخطيط البصري الحر بأشكال وأسهم ورسوم.' },
  { q: 'هل يعمل على الهاتف؟', a: 'نعم، متوافق مع الهواتف والأجهزة اللوحية ويدعم اللمس في لوحة الرسم.' },
];

export const metadata = {
  title: 'Plan+Note | نظّم أفكارك وخطّط مستقبلك',
  description: 'مفكرة ذكية تجمع الكتابة الحرة ولوحة التخطيط البصري اللانهائية. بالعربية ومجانية بالكامل.',
};

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">Plan+Note</span>
          <LandingAuthButton />
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          نظّم أفكارك،{' '}
          <span className="text-blue-600">خطّط مستقبلك</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          مفكرة ذكية تجمع الكتابة الحرة ولوحة التخطيط البصري اللانهائية. بالعربية.
        </p>
        <LandingAuthButton 
          size="lg" 
          showIcon={true} 
          text="تسجيل الدخول بـ Google"
          className="text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all" 
        />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">كل ما تحتاجه في مكان واحد</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <article key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">أسئلة شائعة</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      <section className="bg-blue-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">جاهز تبدأ؟</h2>
        <p className="text-blue-100 mb-8 text-lg">مجاني تماماً، بدون بطاقة ائتمان.</p>
        <LandingAuthButton variant="secondary" size="lg" text="ابدأ الآن مجاناً" />
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-8">
        <p>© {currentYear} Plan+Note — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
