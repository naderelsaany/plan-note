'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center" dir="rtl">
      <AlertTriangle className="w-16 h-16 text-red-400" />
      <h1 className="text-2xl font-bold text-foreground">حدث خطأ ما</h1>
      <p className="text-muted-foreground max-w-md">
        نعتذر، حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>إعادة المحاولة</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}
