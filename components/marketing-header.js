import { LandingAuthButton } from '@/components/landing-auth-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';
import Image from 'next/image';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image src="/logo.png" alt="شعار Plan+Note" width={32} height={32} className="rounded-lg shadow-sm" />
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text tracking-tighter">
            Plan+Note
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LandingAuthButton />
        </div>
      </nav>
    </header>
  );
}
