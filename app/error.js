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
      <h2 className="text-2xl font-bold text-gray-800">حدث خطأ ما</h2>
      <p className="text-gray-500 max-w-md">
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
