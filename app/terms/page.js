import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export const metadata = {
  title: 'الشروط والأحكام',
  description: 'الشروط والأحكام الخاصة باستخدام تطبيق Plan+Note.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'الشروط والأحكام | Plan+Note',
    description: 'الشروط والأحكام الخاصة باستخدام تطبيق Plan+Note.',
    url: 'https://plan-note-psi.vercel.app/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <article className="bg-card p-8 md:p-12 rounded-3xl shadow-sm border border-border prose prose-blue prose-lg dark:prose-invert">
          <h1 className="text-4xl font-bold text-foreground mb-8">الشروط والأحكام</h1>
          
          <p className="text-muted-foreground mb-8">تاريخ الإصدار: 25 يونيو 2026</p>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            باستخدامك لتطبيق Plan+Note، فإنك توافق على الشروط والأحكام الموضحة أدناه. إذا كنت لا توافق على هذه الشروط، يُرجى عدم استخدام التطبيق.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. الاستخدام المقبول</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            يُمنع استخدام التطبيق لإنشاء أو تخزين أي محتوى غير قانوني، أو محتوى يحرض على الكراهية أو ينتهك حقوق الملكية الفكرية للآخرين.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. إخلاء المسؤولية</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            يُقدم التطبيق &quot;كما هو&quot; (As Is) دون أي ضمانات صريحة أو ضمنية. نحن نبذل قصارى جهدنا لضمان استقرار التطبيق وحفظ بياناتك، ولكننا لا نتحمل المسؤولية عن أي فقدان عرضي للبيانات.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. التغييرات في الخدمة</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            نحتفظ بالحق في تعديل أو إيقاف الخدمة (أو أي جزء منها) في أي وقت وبدون إشعار مسبق.
          </p>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
