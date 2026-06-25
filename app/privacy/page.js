import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export const metadata = {
  title: 'سياسة الخصوصية | Plan+Note',
  description: 'كيف نحمي بياناتك وملاحظاتك في تطبيق Plan+Note.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 prose prose-blue prose-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">سياسة الخصوصية</h1>
          
          <p className="text-gray-600 mb-8">تاريخ آخر تحديث: 25 يونيو 2026</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. حماية بياناتك هي أولويتنا</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            نحن في Plan+Note نأخذ خصوصيتك بجدية تامة. نحن لا نقرأ ملاحظاتك، لا نبيع بياناتك لأطراف ثالثة، ولا نستخدمها لأغراض إعلانية.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. البيانات التي نجمعها</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            عندما تقوم بتسجيل الدخول باستخدام حساب Google الخاص بك، نقوم فقط بحفظ:
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>عنوان البريد الإلكتروني.</li>
              <li>اسمك كما هو مسجل في حساب Google.</li>
              <li>الصورة الشخصية الخاصة بك (Profile Picture).</li>
            </ul>
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. أين تحفظ بياناتك؟</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            جميع الملاحظات واللوحات الخاصة بك تُحفظ في قواعد بيانات <strong>Firebase</strong> المشفرة والمدعومة من Google. قمنا بضبط قواعد أمان صارمة (Security Rules) تضمن عدم قدرة أي شخص (بما في ذلك المطورين) على قراءة أو تعديل ملفاتك إلا أنت وبواسطة حسابك فقط.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. حذف الحساب</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            يمكنك في أي وقت طلب حذف حسابك وكافة بياناتك نهائياً من خوادمنا ولن يتم الاحتفاظ بأي نسخة احتياطية من ملاحظاتك بعد الحذف.
          </p>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
