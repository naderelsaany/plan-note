import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://plan-note-psi.vercel.app'),
  applicationName: 'Plan+Note',
  title: {
    default: 'Plan+Note | مفكرة ذكية ولوحة تخطيط',
    template: '%s | Plan+Note',
  },
  description: 'تطبيق عربي متكامل يجمع بين الملاحظات النصية ولوحة التخطيط اللانهائية.',
  keywords: [
    'مفكرة', 'مفكرة ذكية', 'تطبيق ملاحظات عربي', 'لوحة تخطيط لا نهائية', 
    'Plan Note', 'بديل نوشن عربي', 'تنظيم الوقت', 'إدارة المهام', 
    'رسم خرائط ذهنية', 'Notion alternative Arabic', 'أدوات إنتاجية للطلاب',
    'تطبيق إنتاجية للأعمال', 'ملاحظات سحابية'
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Plan+Note — مفكرتك الذكية',
    description: 'نظّم أفكارك وخطّط مشاريعك باللغة العربية',
    url: 'https://plan-note-psi.vercel.app/',
    siteName: 'Plan+Note',
    type: 'website',
    locale: 'ar_EG',
    images: [
      {
        url: '/icon-512x512.png', // Temporary until OG image is fully designed
        width: 512,
        height: 512,
        alt: 'Plan+Note Cover Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan+Note — مفكرتك الذكية',
    description: 'نظّم أفكارك وخطّط مشاريعك باللغة العربية',
    images: ['/icon-512x512.png'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'cNHfGJiXXVT2uaJ8q7mofplDpWfTNvatP1Sqsz6syiU',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Plan+Note',
                alternateName: 'بلان نوت',
                url: 'https://plan-note-psi.vercel.app/',
                description: 'تطبيق عربي متكامل يجمع بين الملاحظات النصية ولوحة التخطيط اللانهائية.',
                inLanguage: 'ar'
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Plan+Note',
                url: 'https://plan-note-psi.vercel.app/',
                logo: 'https://plan-note-psi.vercel.app/icon-512x512.png',
                sameAs: []
              },
              {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Plan+Note',
                applicationCategory: 'ProductivityApplication',
                operatingSystem: 'Web',
                description: 'تطبيق ويب عربي للملاحظات ولوحة التخطيط اللانهائية',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                inLanguage: 'ar',
              }
            ]),
          }}
        />
      </head>
      <body className="font-arabic antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
