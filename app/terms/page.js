import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export const metadata = {
  title: 'الشروط والأحكام | Plan+Note',
  description: 'الشروط والأحكام الخاصة باستخدام تطبيق Plan+Note.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 prose prose-blue prose-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">الشروط والأحكام</h1>
          
          <p className="text-gray-600 mb-8">تاريخ الإصدار: 25 يونيو 2026</p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            باستخدامك لتطبيق Plan+Note، فإنك توافق على الشروط والأحكام الموضحة أدناه. إذا كنت لا توافق على هذه الشروط، يُرجى عدم استخدام التطبيق.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. الاستخدام المقبول</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            يُمنع استخدام التطبيق لإنشاء أو تخزين أي محتوى غير قانوني، أو محتوى يحرض على الكراهية أو ينتهك حقوق الملكية الفكرية للآخرين.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. إخلاء المسؤولية</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            يُقدم التطبيق "كما هو" (As Is) دون أي ضمانات صريحة أو ضمنية. نحن نبذل قصارى جهدنا لضمان استقرار التطبيق وحفظ بياناتك، ولكننا لا نتحمل المسؤولية عن أي فقدان عرضي للبيانات.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. التغييرات في الخدمة</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            نحتفظ بالحق في تعديل أو إيقاف الخدمة (أو أي جزء منها) في أي وقت وبدون إشعار مسبق.
          </p>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
