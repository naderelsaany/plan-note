import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export const metadata = {
  title: 'الصفحة غير موجودة',
  description: 'عذراً، الصفحة التي تبحث عنها غير موجودة.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <MarketingHeader />
      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-4 text-center">
        <p className="text-8xl font-black text-muted-foreground/20">404</p>
        <h1 className="text-3xl font-bold text-foreground">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground max-w-md">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          العودة للرئيسية
        </Link>
      </main>
      <MarketingFooter />
    </div>
  );
}
