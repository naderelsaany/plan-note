import Link from 'next/link';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Plan+Note" className="w-8 h-8 rounded-lg grayscale opacity-70" />
            <span className="text-xl font-bold text-white">Plan+Note</span>
          </div>
          <p className="text-sm leading-relaxed">
            التطبيق العربي الأفضل لتنظيم الأفكار والمشاريع بفضل دمجه بين الملاحظات النصية ولوحة التخطيط اللانهائية.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/features" className="hover:text-white transition-colors">المميزات</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">المدونة</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">قانوني</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm">
        <p>© {currentYear} Plan+Note — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}
