import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// الخط يُحمَّل هنا مرة واحدة فقط عبر next/font (الأفضل للأداء)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata = {
  title: 'Plan+Note',
  description: 'تطبيق عربي متكامل يجمع بين الملاحظات النصية ولوحة التخطيط اللانهائية.',
  keywords: ['مفكرة', 'تطبيق ملاحظات عربي', 'لوحة تخطيط لا نهائية', 'Plan Note'],
  openGraph: {
    title: 'Plan+Note — مفكرتك الذكية',
    description: 'نظّم أفكارك وخطّط مشاريعك باللغة العربية',
    type: 'website',
    locale: 'ar_EG',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        {/* Schema Markup — الطريقة المُفضلة في App Router */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Plan+Note',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web',
              description: 'تطبيق ويب عربي للملاحظات ولوحة التخطيط اللانهائية',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              inLanguage: 'ar',
            }),
          }}
        />
      </head>
      <body className="font-arabic antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
