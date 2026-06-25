'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDocument, updateDocument } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, Save, Loader2, CheckCircle } from 'lucide-react';

export default function NotePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [docData, setDocData] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const autoSaveTimer = useRef(null);
  const saveTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (user && id) {
      setDocData(null);
      setContent('');
      fetchDoc();
    }
    
    // Cleanup function لمنع الـ Memory leak ولتجنب تشغيل حفظ تلقائي بالخطأ بين الملفات
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [user, id]);

  // حماية من فقدان البيانات عند محاولة إغلاق النافذة بدون حفظ
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchDoc = async () => {
    setFetchLoading(true);
    const { doc: data, error } = await getDocument(id);
    if (error) {
      toast.error('خطأ', { description: error });
      router.push('/dashboard');
    } else if (data && data.userId === user.uid && data.type === 'note') {
      setDocData(data);
      setContent(data.content || '');
    } else {
      router.push('/dashboard');
    }
    setFetchLoading(false);
  };

  const handleSave = useCallback(async (text) => {
    setSaving(true);
    await updateDocument(id, text);
    setSaving(false);
    setSaved(true);
    setHasUnsavedChanges(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSaved(false), 2000);
  }, [id]);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setSaved(false);
    setHasUnsavedChanges(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    // حفظ تلقائي بعد 1.5 ثانية من آخر ضغطة
    autoSaveTimer.current = setTimeout(() => handleSave(val), 1500);
  };

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      await handleSave(content);
    }
    router.push('/dashboard');
  };

  if (loading || fetchLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowRight className="w-4 h-4 me-2" /> رجوع
          </Button>
          <h1 className="font-semibold text-gray-800 truncate flex-1 text-center">{docData?.title}</h1>
          <div className="flex items-center gap-2 min-w-fit">
            {saved && <span className="text-green-500 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" />محفوظ</span>}
            {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            <Button size="sm" onClick={() => handleSave(content)} disabled={saving}>
              <Save className="w-4 h-4 me-1" /> حفظ
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="ابدأ الكتابة هنا..."
          className="w-full h-full min-h-[calc(100vh-120px)] text-gray-800 text-lg leading-relaxed resize-none outline-none font-arabic placeholder:text-gray-300 bg-transparent"
          dir="rtl"
          spellCheck="false"
        />
      </main>
    </div>
  );
}
