'use client';

import '@excalidraw/excalidraw/index.css';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDocument, updateDocument } from '@/lib/firestore';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, Download, Save, Loader2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import imageCompression from 'browser-image-compression';

// ⚠️ ضروري: Excalidraw لا يعمل مع SSR (يستخدم window)
const Excalidraw = dynamic(
  () => import('@/components/ExcalidrawWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
  }
);

const compressFiles = async (files) => {
  if (!files) return {};
  const compressed = { ...files };
  for (const [fileId, fileData] of Object.entries(compressed)) {
    if (fileData.mimeType && fileData.mimeType.startsWith('image/') && fileData.dataURL && !fileData.isCompressed) {
      // 0.75 ratio for base64
      const approxSize = fileData.dataURL.length * 0.75;
      if (approxSize > 400 * 1024) { // إذا تجاوزت الصورة 400 كيلوبايت يتم ضغطها
        try {
          const res = await fetch(fileData.dataURL);
          const blob = await res.blob();
          const options = {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          };
          const compressedBlob = await imageCompression(blob, options);
          const reader = new FileReader();
          const base64data = await new Promise((resolve) => {
            reader.readAsDataURL(compressedBlob);
            reader.onloadend = () => resolve(reader.result);
          });
          compressed[fileId] = { ...fileData, dataURL: base64data, isCompressed: true };
        } catch (err) {
          console.error("Compression error:", err);
        }
      } else {
        // نضع علامة أنها لا تحتاج لضغط لتجاوزها في المرات القادمة
        compressed[fileId] = { ...fileData, isCompressed: true };
      }
    }
  }
  return compressed;
};

export default function CanvasPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [docData, setDocData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const autoSaveTimer = useRef(null);
  const saveTimeout = useRef(null);
  const prevElementsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (user && id) {
      setDocData(null);
      fetchDoc();
    }

    // Cleanup function لمنع الـ Memory leak ولتجنب تشغيل حفظ تلقائي بالخطأ
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [user, id]);

  // حماية من فقدان البيانات عند إغلاق النافذة
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
    } else if (data && data.userId === user.uid && data.type === 'canvas') {
      setDocData(data);
    } else {
      router.push('/dashboard');
    }
    setFetchLoading(false);
  };

  const initialData = useMemo(() => {
    if (!docData?.content) return undefined;
    try {
      const parsed = JSON.parse(docData.content);
      return {
        elements: parsed.elements || [],
        appState: { viewBackgroundColor: parsed.appState?.viewBackgroundColor || '#ffffff' },
        files: parsed.files || {},
      };
    } catch {
      return undefined;
    }
  }, [docData?.content]);

  const handleSave = useCallback(async () => {
    if (!excalidrawAPI) return;
    setSaving(true);
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const rawFiles = excalidrawAPI.getFiles();
    
    // ضغط الصور الذكي قبل الحفظ
    const files = await compressFiles(rawFiles);

    const content = JSON.stringify({
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
      files,
    });
    
    await updateDocument(id, content);
    setSaving(false);
    setSaved(true);
    setHasUnsavedChanges(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSaved(false), 2000);
  }, [id, excalidrawAPI]);

  const handleChange = useCallback((elements, appState) => {
    // تخطي التحديث إذا كان مجرد تحريك/زوم
    if (elements === prevElementsRef.current) return;
    prevElementsRef.current = elements;

    setSaved(false);
    setHasUnsavedChanges(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleSave(), 2000);
  }, [handleSave]);

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      await handleSave();
    }
    router.push('/dashboard');
  };

  const handleExport = async (type) => {
    if (!excalidrawAPI) return;
    setExporting(true);
    setExportModalOpen(false);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      const { exportToSvg, exportToBlob } = await import('@excalidraw/excalidraw');
      const title = docData?.title || 'canvas';

      if (type === 'md' || type === 'both') {
        const svgElement = await exportToSvg({
          elements,
          appState: { ...appState, exportWithDarkMode: false },
          files,
        });

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const date = new Date().toLocaleDateString('ar-EG');
        const mdContent = `# ${title}\n\n> تاريخ التصدير: ${date}\n\n## اللوحة\n\n${svgString}\n`;

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '-')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      if (type === 'png' || type === 'both') {
        const pngBlob = await exportToBlob({
          elements,
          appState: { ...appState, exportWithDarkMode: false },
          files,
          mimeType: 'image/png',
        });
        const pngUrl = URL.createObjectURL(pngBlob);
        const aPng = document.createElement('a');
        aPng.href = pngUrl;
        aPng.download = `${title.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(aPng);
        aPng.click();
        document.body.removeChild(aPng);
        URL.revokeObjectURL(pngUrl);
      }

      toast.success('تم التصدير بنجاح', { description: 'تم تنزيل اللوحة.' });
    } catch (e) {
      console.error('Export error:', e);
      toast.error('خطأ', { description: 'حدث خطأ أثناء التصدير.' });
    }
    setExporting(false);
  };

  if (loading || fetchLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-white" dir="rtl">
      <header className="border-b border-gray-200 bg-white z-10 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowRight className="w-4 h-4 me-2" /> رجوع
          </Button>
          <h1 className="font-semibold text-gray-800 truncate flex-1 text-center">{docData?.title}</h1>
          <div className="flex items-center gap-2">
            {saved && <span className="text-green-500 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" />محفوظ</span>}
            {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 me-1" /> حفظ
            </Button>
            <Button size="sm" onClick={() => setExportModalOpen(true)} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Download className="w-4 h-4 me-1" />}
              تصدير
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData}
          onChange={handleChange}
          langCode="ar-SA"
          theme="light"
          UIOptions={{
            canvasActions: {
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              saveAsImage: false,
              toggleTheme: false,
            },
          }}
        />
      </div>

      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>خيارات التصدير</DialogTitle>
            <DialogDescription>
              اختر الصيغة التي تريد تصدير اللوحة بها.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button variant="outline" onClick={() => handleExport('png')} className="flex items-center justify-center gap-2 h-12 text-base font-medium">
              <Download className="w-5 h-5 text-blue-500" />
              تصدير كصورة (PNG)
            </Button>
            <Button variant="outline" onClick={() => handleExport('md')} className="flex items-center justify-center gap-2 h-12 text-base font-medium">
              <Download className="w-5 h-5 text-green-500" />
              تصدير كنص (Markdown)
            </Button>
            <Button variant="outline" onClick={() => handleExport('both')} className="flex items-center justify-center gap-2 h-12 text-base font-medium">
              <Download className="w-5 h-5 text-purple-500" />
              تصدير كلاهما معاً
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
