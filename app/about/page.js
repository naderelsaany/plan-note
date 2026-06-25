import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export const metadata = {
  title: 'من نحن | Plan+Note',
  description: 'تعرف على قصة تأسيس Plan+Note ولماذا بنينا هذا التطبيق للمستخدم العربي.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">قصتنا</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              بدأت فكرة <strong>Plan+Note</strong> من حاجة بسيطة: لم نجد تطبيقاً يجمع بين بساطة كتابة الملاحظات النصية، وبين حرية الرسم والتخطيط البصري في نفس المكان، وخاصة بدعم كامل وحقيقي للغة العربية.
            </p>
            <p>
              معظم التطبيقات الأجنبية تتعامل مع اللغة العربية (RTL) كفكرة ثانوية، مما يؤدي لمشاكل في محاذاة النصوص والتخطيط. لذلك قررنا بناء هذا التطبيق من الصفر ليكون الحل العربي الأمثل.
            </p>
            <p>
              هدفنا هو توفير أداة قوية، سريعة، وبسيطة لمساعدة الطلاب، المبرمجين، صُناع المحتوى، وأصحاب المشاريع على تنظيم أفكارهم دون تشتيت.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">التكنولوجيا</h2>
            <p>
              التطبيق مبني بأحدث التقنيات: <code>Next.js</code> للأداء السريع، <code>Firebase</code> للمزامنة والأمان، ومكتبة <code>Excalidraw</code> المفتوحة المصدر لتقديم أفضل تجربة رسم وتخطيط بصري ممكنة.
            </p>
          </div>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
