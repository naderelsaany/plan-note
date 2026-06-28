'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/auth';
import { getUserDocuments, createDocument, deleteDocument } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2, Edit3, LogOut, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('note');
  const [creating, setCreating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (user) fetchDocs();
  }, [user]);

  const fetchDocs = async () => {
    setDocsLoading(true);
    const { docs, error } = await getUserDocuments(user.uid);
    if (error) {
      toast.error('خطأ في تحميل الملفات', {
        description: error,
      });
      setDocuments([]);
    } else {
      setDocuments(docs);
    }
    setDocsLoading(false);
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    const { id, error } = await createDocument(user.uid, newTitle.trim(), newType);
    setCreating(false);
    if (id) {
      const type = newType;
      setDialogOpen(false);
      setNewTitle('');
      setNewType('note');
      router.push(`/${type}/${id}`);
    } else {
      toast.error('فشل الإنشاء', {
        description: error || 'حدث خطأ أثناء إنشاء الملف.',
      });
    }
  };

  const triggerDelete = (docId) => {
    setDocToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    const { error } = await deleteDocument(docToDelete);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    
    if (error) {
      toast.error('خطأ في الحذف', {
        description: 'لم نتمكن من حذف الملف. ' + error,
      });
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete));
      toast.success('تم الحذف', {
        description: 'تم حذف الملف نهائياً بنجاح.',
      });
    }
    setDocToDelete(null);
  };

  const handleOpen = (doc) => {
    router.push(`/${doc.type === 'note' ? 'note' : 'canvas'}/${doc.id}`);
  };

  const formatDate = (date) => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 me-2" />
            خروج
          </Button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Plan+Note" className="w-6 h-6 rounded-md shadow-sm" />
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text tracking-tighter">Plan+Note</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 me-2" />
              جديد
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            أهلاً، {user.displayName?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">ملفاتك المحفوظة</p>
        </div>

        {docsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">لا يوجد ملفات بعد</p>
            <p className="text-sm mt-2">اضغط "جديد" لإنشاء أول ملف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 transition-colors flex flex-col">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleOpen(doc)}>
                  <span className="text-2xl">{doc.type === 'canvas' ? '🎨' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-card-foreground truncate">{doc.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.type === 'canvas' ? 'لوحة تخطيط' : 'ملاحظة نصية'}
                    </p>
                    {doc.updatedAt?.toDate && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        آخر تعديل: {formatDate(doc.updatedAt.toDate())}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 border-t border-border/50 pt-4">
                  <Button variant="ghost" size="sm" className="flex-1 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleOpen(doc)}>
                    <Edit3 className="w-4 h-4 me-1" /> فتح
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => triggerDelete(doc.id)}>
                    <Trash2 className="w-4 h-4 me-1" /> حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-right">إنشاء ملف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="doc-title" className="text-right block mb-2">اسم الملف</Label>
              <Input
                id="doc-title"
                placeholder="أدخل اسم الملف..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="text-right"
                dir="rtl"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-right block mb-2">نوع الملف</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewType('note')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${newType === 'note' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <span className="text-2xl block mb-1">📝</span>
                  <span className="text-sm font-medium text-foreground">ملاحظة</span>
                </button>
                <button
                  onClick={() => setNewType('canvas')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${newType === 'canvas' ? 'border-purple-500 bg-purple-500/10' : 'border-border hover:border-purple-500/50'}`}
                >
                  <span className="text-2xl block mb-1">🎨</span>
                  <span className="text-sm font-medium text-foreground">تخطيط</span>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 flex-row-reverse">
            <Button onClick={handleCreate} disabled={!newTitle.trim() || creating}>
              {creating && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              إنشاء
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف الملف</AlertDialogTitle>
            <AlertDialogDescription className="text-right mt-2">
              هل أنت متأكد من قرارك؟ سيتم حذف هذا الملف نهائياً ولا يمكن التراجع عن هذا الإجراء بأي شكل.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 flex-row-reverse sm:justify-start mt-4">
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Trash2 className="w-4 h-4 me-2" />}
              نعم، احذف نهائياً
            </Button>
            <AlertDialogCancel disabled={isDeleting}>إلغاء الأمر</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
