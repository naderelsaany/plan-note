import { LandingAuthButton } from '@/components/landing-auth-button';
import Link from 'next/link';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Plan+Note" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text tracking-tighter">
            Plan+Note
          </span>
        </Link>
        <LandingAuthButton />
      </nav>
    </header>
  );
}
