
cat > /mnt/user-data/outputs/PlanNote_Master_Guide.md << 'ENDOFFILE'
# Plan+Note — دليل المشروع الشامل (Master Guide)

> **هذا الملف هو المرجع الوحيد للمشروع.**
> يحتوي على: ما تم إنجازه، قرارات التصميم، هيكل الكود الكامل، قواعد العمل، وكل ما يحتاجه أي مطور للفهم أو التنفيذ.

---

## أولاً: نظرة عامة على المشروع

| البند | التفاصيل |
|-------|-----------|
| اسم المشروع | Plan+Note |
| الهدف | تطبيق ويب عربي يجمع الملاحظات النصية ولوحة التخطيط اللانهائية |
| لغة الواجهة | العربية (RTL كامل) |
| الجمهور المستهدف | المستخدم العربي الذي يريد بديلاً بسيطاً لـ Notion/Miro |
| حالة المشروع | قيد البناء — Firebase جاهز، الكود لم يُنفَّذ بعد |

---

## ثانياً: ما تم إنجازه فعلاً (قبل كتابة أي كود)

- [x] إنشاء مشروع Firebase (`plannote-e148a`)
- [x] تفعيل Google Authentication في Firebase Console
- [x] كتابة وتطبيق قواعد أمان Firestore (Security Rules) — مطبّقة في Firebase Console
- [x] تحديد هيكل قاعدة البيانات (Collections & Documents)
- [x] اتخاذ جميع القرارات الهندسية (Tech Stack)
- [x] تصميم رحلة المستخدم الكاملة (UI Flow)
- [ ] كتابة كود التطبيق (لم يبدأ بعد)

---

## ثالثاً: التقنيات المستخدمة (Tech Stack)

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Next.js | Latest (App Router) | إطار العمل الأساسي |
| Tailwind CSS | v3 | التصميم والتنسيق |
| Shadcn UI | Latest | مكونات الواجهة الجاهزة |
| lucide-react | Latest | الأيقونات |
| Firebase | v9+ (Modular) | Auth + Firestore |
| @excalidraw/excalidraw | Latest | لوحة الرسم اللانهائية |
| tailwindcss-animate | Latest | رسوم متحركة Tailwind |

### لماذا Excalidraw وليس tldraw؟
- مفتوح المصدر بالكامل (MIT License)
- يدعم العربية مع `langCode="ar"`
- يدعم اللمس والماوس نيتيف
- يحتوي على Sticky Notes، أشكال، أسهم، Undo/Redo جاهزة
- أخف وزناً من tldraw

### لماذا لا يوجد تسجيل بالبريد الإلكتروني؟
قرار هندسي مقصود: Google Auth فقط لتبسيط تجربة المستخدم وتقليل تعقيد إدارة كلمات المرور.

---

## رابعاً: هيكل قاعدة البيانات (Firestore)

### Collection: `users`
```
users/{userId}
  ├── uid: string          (معرف المستخدم من Firebase Auth)
  ├── name: string         (الاسم الكامل من Google)
  ├── email: string        (البريد الإلكتروني)
  └── createdAt: timestamp (تاريخ أول تسجيل دخول)
```

### Collection: `documents`
```
documents/{docId}
  ├── userId: string       (معرف المالك — مرتبط بـ users/{userId})
  ├── title: string        (اسم الملف)
  ├── type: string         ('note' أو 'canvas')
  ├── content: string      (نص للملاحظة / JSON لـ Excalidraw)
  ├── createdAt: timestamp (تاريخ الإنشاء)
  └── updatedAt: timestamp (تاريخ آخر تعديل)
```

### ملاحظة على حقل `content`:
- **نوع `note`:** نص عادي (plain text)
- **نوع `canvas`:** JSON string بتنسيق: `{ "elements": [...], "appState": {...} }`
- **حد Firestore:** 1MB للـ document — كافٍ للاستخدام العادي

> **⚠️ تحذير حجم Canvas Content:** حد Firestore للـ document الواحد هو **1MB**.
> لوحة Excalidraw كثيفة العناصر (أشكال كثيرة، صور، نصوص طويلة) قد تتجاوز هذا الحد.
> - **للمرحلة الحالية (MVP):** الحد كافٍ تماماً للاستخدام العادي.
> - **عند النمو:** إذا واجه المستخدمون خطأ `RESOURCE_EXHAUSTED`، الإستراتيجيات البديلة هي:
>   1. تقسيم المحتوى على عدة documents (كل قسم canvas مستقل).
>   2. نقل Canvas لـ **Firebase Realtime Database** (حد أعلى).
>   3. تخزين الصور في Firebase Storage بدلاً من تضمينها في JSON.

---

## خامساً: قواعد أمان Firestore (مطبّقة في Firebase Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // قواعد مجموعة documents
    match /documents/{docId} {
      // القراءة: يسمح للمالك، أو إذا كان المستند غير موجود (لتجنب خطأ permission denied)
      allow read: if request.auth != null
        && (resource == null || resource.data.userId == request.auth.uid);
      // التعديل والحذف: للمالك فقط
      // مع منع تعديل حقلي userId و type أثناء التحديث للحفاظ على سلامة البيانات
      allow update: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.resource.data.userId == resource.data.userId
        && request.resource.data.type == resource.data.type
        && request.resource.data.type in ['note', 'canvas']
        && request.resource.data.title is string
        && request.resource.data.title.size() < 200
        && request.resource.data.createdAt == resource.data.createdAt;
      allow delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      // الإنشاء: يُشترط أن يكون userId مساوياً لـ uid المستخدم
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId
        && request.resource.data.type in ['note', 'canvas']
        && request.resource.data.title is string
        && request.resource.data.title.size() < 200;
    }

    // قواعد مجموعة users
    match /users/{userId} {
      // كل مستخدم يقرأ ويكتب بياناته فقط
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

**هذه القواعد تضمن:**
- لا أحد يقرأ ملفات غيره
- لا أحد يحذف ملفات غيره
- لا أحد ينشئ ملفاً باسم مستخدم آخر

---

## سادساً: متغيرات البيئة

**⚠️ قاعدة ذهبية لا تُكسر:**
مفاتيح Firebase تُكتب في ملف `.env.local` فقط.
لا تُكتب في: README، تعليقات الكود، ملفات `.js`، أو أي مكان آخر.
ملف `.env.local` يجب أن يكون في `.gitignore` دائماً.

**الملف المطلوب إنشاؤه يدوياً: `.env.local`**
```
NEXT_PUBLIC_FIREBASE_API_KEY=<من Firebase Console>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<من Firebase Console>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<من Firebase Console>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<من Firebase Console>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<من Firebase Console>
NEXT_PUBLIC_FIREBASE_APP_ID=<من Firebase Console>
```
> القيم الحقيقية محفوظة عند صاحب المشروع فقط ولا تُنشر في أي توثيق.

---

## سابعاً: شاشات التطبيق ورحلة المستخدم

### الشاشة 1: صفحة الهبوط (`/`)
- **الهدف:** تعريف التطبيق وتحويل الزائر لمستخدم
- **المحتوى:**
  - Header ثابت (Logo + زر "ابدأ مجاناً")
  - Hero Section: عنوان رئيسي + وصف + زر Google Sign-in
  - Features Section: 3 ميزات رئيسية (ملاحظات / canvas / تصدير)
  - FAQ Section: 5 أسئلة شائعة (accordion قابل للفتح)
  - CTA Section: دعوة للتسجيل
  - Footer
- **السلوك:** إذا كان المستخدم مسجلاً بالفعل → يُحوَّل تلقائياً لـ `/dashboard`
- **SEO:** Meta tags + Schema Markup (SoftwareApplication) + Semantic HTML

### الشاشة 2: لوحة التحكم (`/dashboard`)
- **الحماية:** لا يمكن الوصول إلا بعد تسجيل الدخول
- **Header:**
  - يسار: زر "خروج" مع أيقونة
  - وسط: شعار التطبيق
  - يمين: زر "جديد +"
  > **ملاحظة RTL:** مع `flex` و `justify-between` في RTL، العنصر الأول يظهر يميناً (خروج) والثالث يساراً (جديد) — وهذا هو الترتيب الصحيح منطقياً.
- **قائمة الملفات:**
  - بطاقة لكل ملف: أيقونة النوع (📝/🎨) + الاسم + نوع الملف
  - زر "فتح" + زر "حذف" في كل بطاقة
  - حالة فارغة (Empty State) إذا لم توجد ملفات
- **Dialog الإنشاء:**
  - حقل نص لاسم الملف
  - اختيار النوع (ملاحظة / تخطيط) بأزرار مرئية
  - زر "إنشاء" + "إلغاء"
  - بعد الإنشاء: توجيه مباشر لصفحة الملف الجديد

### الشاشة 3: الملاحظة النصية (`/note/[id]`)
- **الحماية:** مالك الملف فقط (التحقق من userId)
- **Header:**
  - زر رجوع للـ Dashboard
  - عنوان الملف في المنتصف
  - مؤشر الحفظ (جاري الحفظ / محفوظ) + زر حفظ يدوي
- **المحرر:**
  - `textarea` بسيطة ونظيفة
  - خط Cairo، حجم مريح، اتجاه RTL
  - بدون شريط تنسيق (WYSIWYG) — نص عادي فقط
- **الحفظ التلقائي:** 1.5 ثانية بعد آخر ضغطة على لوحة المفاتيح

### الشاشة 4: لوحة التخطيط (`/canvas/[id]`)
- **الحماية:** مالك الملف فقط
- **Header:**
  - زر رجوع للـ Dashboard
  - عنوان الملف في المنتصف
  - مؤشر الحفظ + زر حفظ يدوي + زر "تصدير MD"
- **اللوحة:** Excalidraw بملء الشاشة مع:
  - أداة التحديد (Pointer/Select)
  - قلم حر (Draw/Pencil)
  - نص (Text)
  - أشكال هندسية (مربع، دائرة، معين)
  - أسهم وخطوط
  - ملاحظات لاصقة (Frame)
  - ممحاة (Eraser)
  - اختيار الألوان
  - Undo/Redo (كلها جاهزة في Excalidraw)
- **الحفظ التلقائي:** 2 ثانية بعد آخر تغيير
- **التصدير:**
  - يُنتج SVG متجهي من Excalidraw
  - يُغلَّف داخل ملف `.md`
  - يُحمَّل تلقائياً على جهاز المستخدم

---

## ثامناً: هيكل ملفات المشروع الكامل

```
plan-note/
│
├── app/                          # Next.js App Router
│   ├── layout.js                 # Layout عام: RTL + Font + SEO + AuthProvider
│   ├── page.js                   # صفحة الهبوط
│   ├── globals.css               # CSS عام + Tailwind
│   ├── error.js                  # 🆕 Error Boundary عام (يمنع الشاشة البيضاء)
│   ├── loading.js                # 🆕 شاشة تحميل عامة (Streaming UI)
│   │
│   ├── dashboard/
│   │   └── page.js               # لوحة التحكم
│   │
│   ├── note/
│   │   └── [id]/
│   │       └── page.js           # محرر الملاحظات النصية
│   │
│   └── canvas/
│       └── [id]/
│           └── page.js           # لوحة الرسم (Excalidraw)
│
├── components/
│   └── ui/                       # مكونات Shadcn (تُنشأ تلقائياً)
│       ├── button.jsx
│       ├── dialog.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── sonner.jsx
│       └── card.jsx
│
├── contexts/
│   └── AuthContext.js            # React Context لإدارة حالة المستخدم
│
├── lib/
│   ├── firebase.js               # تهيئة Firebase + Firestore
│   ├── auth.js                   # دوال تسجيل الدخول والخروج
│   └── firestore.js              # دوال CRUD لـ Firestore
│
├── .env.local                    # ⚠️ مفاتيح Firebase — لا تُشارك
├── .gitignore                    # يشمل .env.local
├── next.config.mjs               # إعدادات Next.js (ES Module — دعم Excalidraw)
├── tailwind.config.js            # إعدادات Tailwind
└── package.json
```

---

## تاسعاً: خطة التنفيذ الكاملة (بالكود الصحيح)

### ⚠️ قواعد التنفيذ الصارمة
1. قم بعمل **Commit** مستقل في Git بعد كل مرحلة كاملة. لا تؤجل الـ Commits للنهاية (Commit per phase).
2. لا تقم بعمل **Push** أو **Deploy** بدون استئذان صريح ومراجعة مني.
3. بعد إنشاء أو تعديل `.gitignore`، تأكد بنفسك أن `.env.local` مكتوب بداخله، واطبع محتوى `.gitignore` للتأكيد قبل أول Commit لتجنب تسريب مفاتيح Firebase.
4. إذا واجهت أي قرار غير مذكور بوضوح (خصوصاً ما يتعلق بإصدار Tailwind)، توقف فوراً واسألني، لا تفترض وتكمل أبداً.

---

### المرحلة 1: تهيئة المشروع

#### 1.1 — أوامر الإنشاء والتثبيت

```bash
# إنشاء مشروع Next.js (بالتعطيل الصريح لـ Tailwind و TS لتجنب تثبيت v4)
npx create-next-app@latest plan-note \
  --js \
  --no-tailwind \
  --eslint \
  --app \
  --import-alias="@/*" \
  --use-npm

cd plan-note

# ⚠️ خطوات فحص وتأكيد حرجة جداً ⚠️
# 1. تأكد من عدم إنشاء مجلد src بالخطأ:
# ls -la | grep -w src
# (إذا ظهر المجلد src توقف فوراً ولا تكمل التنفيذ)

# 2. تحقق من عدم وجود أي ملفات PostCSS أو Tailwind بصيغة v4 تم توليدها بالخطأ:
# ls postcss.config.* tailwind.config.* 2>/dev/null
# rm postcss.config.mjs tailwind.config.ts (إذا لزم الأمر)

# تثبيت Tailwind v3 يدوياً وإعداده أولاً قبل Shadcn
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# Firebase
npm install firebase

# Shadcn dependencies & animate (مطلوبة لـ Tailwind config)
npm install class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate

# Shadcn init (الآن فقط نُشغّلها بعد وجود tailwind.config.js)
npx shadcn@latest init --yes

# Shadcn components
npx shadcn@latest add button dialog input label sonner card

# Excalidraw (مع تجاهل تحذيرات تعارض الـ peer-deps بسبب React 19)
npm install @excalidraw/excalidraw --legacy-peer-deps
```

> **ملاحظة:** لا تثبّت `tailwindcss-rtl` (مهجورة) ولا `uuid` (غير مستخدمة).

---

#### 1.2 — ملف `.gitignore`

تأكد أن هذا السطر موجود:
```
.env.local
.env*.local
```

---

#### 1.3 — ملف `.env.local`

أنشئه يدوياً وضع فيه المفاتيح من Firebase Console.
**لا تُكتب المفاتيح الحقيقية في أي ملف آخر.**

---

#### 1.4 — ملف `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
    },
  },
  // tailwindcss-animate مثبّتة ومطلوبة لمكونات Shadcn
  plugins: [require("tailwindcss-animate")],
}
```

---

#### 1.5 — ملف `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* دعم RTL الأساسي — Tailwind v3 يدعمه نيتيف، هذا للتأكيد فقط */
[dir="rtl"] {
  text-align: right;
}

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  /* الخط يأتي من next/font في layout.js — لا نستورده هنا مرة ثانية */
  font-family: var(--font-cairo), sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

> **مهم:** لا يوجد `@import url(...)` للخط هنا — الخط يُحمَّل مرة واحدة فقط عبر `next/font/google` في `layout.js`.

---

#### 1.6 — ملف `lib/firebase.js`

```js
// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// منع تهيئة Firebase أكثر من مرة (ضروري في Next.js مع HMR)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// تهيئة Firestore بأمان — try/catch يحمي من تكرار التهيئة مع HMR
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (e) {
  if (e.code === 'already-exists') {
    db = getFirestore(app);
  } else {
    throw e;
  }
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { db };
export default app;
```

> **ملاحظة:** تم تفعيل Offline Persistence أوتوماتيكياً عبر `persistentLocalCache` أثناء تهيئة قاعدة البيانات لتشمل تعدد التبويبات بسلاسة.

---

#### 1.7 — ملف `lib/auth.js`

```js
// lib/auth.js
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // حفظ بيانات المستخدم عند أول تسجيل دخول فقط
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
      });
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}
```

---

#### 1.8 — ملف `lib/firestore.js`

```js
// lib/firestore.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export async function getUserDocuments(userId) {
  try {
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return { docs: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })), error: null };
  } catch (error) {
    return { docs: [], error: error.message };
  }
}

export async function getDocument(docId) {
  try {
    const docRef = doc(db, 'documents', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { doc: { id: docSnap.id, ...docSnap.data() }, error: null };
    return { doc: null, error: 'المستند غير موجود' };
  } catch (error) {
    return { doc: null, error: error.message };
  }
}

export async function createDocument(userId, title, type) {
  try {
    const defaultContent = type === 'note'
      ? ''
      : JSON.stringify({ elements: [], appState: { viewBackgroundColor: '#ffffff' } });

    const docRef = await addDoc(collection(db, 'documents'), {
      userId,
      title,
      type,
      content: defaultContent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function updateDocument(docId, content) {
  try {
    await updateDoc(doc(db, 'documents', docId), {
      content,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteDocument(docId) {
  try {
    await deleteDoc(doc(db, 'documents', docId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}
```

---

#### 1.9 — ملف `contexts/AuthContext.js`

```jsx
// contexts/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // مراقبة حالة المصادقة.
    // ملاحظة: onAuthStateChanged لا يُطلق null أثناء تجديد الـ token (هذا يحدث عبر
    // onIdTokenChanged)، فلا حاجة لمنطق إضافي لمنع الوميض هنا.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

#### 1.10 — ملف `app/layout.js`

```jsx
// app/layout.js
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
  title: 'Plan+Note — مفكرتك الذكية للتخطيط والملاحظات',
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
```

> **ملاحظة:** أُضيف `<Toaster />` من Sonner لعرض الإشعارات عند الحاجة.

---

### المرحلة 2: صفحة الهبوط

#### ملف `app/page.js`

```jsx
// components/landing-auth-button.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 me-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function LandingAuthButton({ variant = 'default', size = 'sm', className = '', showIcon = false, text = 'ابدأ مجاناً' }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const handleSignIn = async () => {
    const isWebView = /Instagram|FBAN|FBAV|Twitter/i.test(navigator.userAgent);
    if (isWebView) {
      toast.error('متصفح غير مدعوم', {
        description: 'يرجى فتح الرابط في متصفح خارجي (Chrome أو Safari) لتتمكن من تسجيل الدخول.',
      });
      return;
    }

    setSigningIn(true);
    const { user, error } = await signInWithGoogle();
    if (user) {
      router.push('/dashboard');
    } else {
      toast.error('خطأ في تسجيل الدخول', {
        description: error || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.',
      });
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button onClick={handleSignIn} variant={variant} size={size} disabled={signingIn} className={className}>
      {signingIn ? <Loader2 className="w-5 h-5 me-2 animate-spin" /> : showIcon ? <GoogleIcon /> : null}
      {text}
    </Button>
  );
}
```

#### ملف `components/faq-item.jsx`

```jsx
// components/faq-item.jsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-right bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-800">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ms-2" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ms-2" />}
      </button>
      {open && (
        <div className="p-4 bg-gray-50 text-gray-600 leading-relaxed border-t border-gray-200">
          {a}
        </div>
      )}
    </div>
  );
}
```

#### ملف `app/page.js`

```jsx
// app/page.js
// ⚠️ Server Component (بدون use client لتحسين الـ SEO)
import { LandingAuthButton } from '@/components/landing-auth-button';
import { FAQItem } from '@/components/faq-item';
import { FileText, Layout, Download } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    title: 'ملاحظات نصية ذكية',
    desc: 'اكتب وتنسّق أفكارك بواجهة نظيفة تدعم العربية بالكامل مع حفظ تلقائي.',
  },
  {
    icon: <Layout className="w-8 h-8 text-purple-500" />,
    title: 'لوحة تخطيط لانهائية',
    desc: 'ارسم وخطّط بأشكال وأسهم وملاحظات لاصقة على لوحة بلا حدود.',
  },
  {
    icon: <Download className="w-8 h-8 text-green-500" />,
    title: 'تصدير احترافي',
    desc: 'صدّر لوحتك كملف SVG داخل Markdown بجودة متجهية لا تتأثر بالتكبير.',
  },
];

const faqs = [
  { q: 'هل التطبيق مجاني؟', a: 'نعم، Plan+Note مجاني بالكامل. سجّل بحساب Google وابدأ فوراً.' },
  { q: 'هل بياناتي آمنة؟', a: 'نعم. بياناتك محفوظة في Firebase مع قواعد أمان تضمن أن لا أحد سواك يصل إلى ملفاتك.' },
  { q: 'هل يعمل بدون إنترنت؟', a: 'جزئياً — الملاحظات والبيانات المُحمّلة مسبقاً متاحة بدون إنترنت، وتُزامن تلقائياً عند عودة الاتصال.' },
  { q: 'ما الفرق بين الملاحظة ولوحة التخطيط؟', a: 'الملاحظة للكتابة النصية. اللوحة للتخطيط البصري الحر بأشكال وأسهم ورسوم.' },
  { q: 'هل يعمل على الهاتف؟', a: 'نعم، متوافق مع الهواتف والأجهزة اللوحية ويدعم اللمس في لوحة الرسم.' },
];

export const metadata = {
  title: 'Plan+Note | نظّم أفكارك وخطّط مستقبلك',
  description: 'مفكرة ذكية تجمع الكتابة الحرة ولوحة التخطيط البصري اللانهائية. بالعربية ومجانية بالكامل.',
};

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">Plan+Note</span>
          <LandingAuthButton />
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          نظّم أفكارك،{' '}
          <span className="text-blue-600">خطّط مستقبلك</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          مفكرة ذكية تجمع الكتابة الحرة ولوحة التخطيط البصري اللانهائية. بالعربية.
        </p>
        <LandingAuthButton 
          size="lg" 
          showIcon={true} 
          text="تسجيل الدخول بـ Google"
          className="text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all" 
        />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">كل ما تحتاجه في مكان واحد</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <article key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">أسئلة شائعة</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      <section className="bg-blue-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">جاهز تبدأ؟</h2>
        <p className="text-blue-100 mb-8 text-lg">مجاني تماماً، بدون بطاقة ائتمان.</p>
        <LandingAuthButton variant="secondary" size="lg" text="ابدأ الآن مجاناً" />
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-8">
        <p>© {currentYear} Plan+Note — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
```

---

### المرحلة 3: لوحة التحكم

#### ملف `app/dashboard/page.js`

```jsx
// app/dashboard/page.js
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2, Edit3, LogOut, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('note');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

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
      // ⚠️ احفظ النوع قبل reset — لأن setState غير متزامن
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

  const handleDelete = async (docId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    const { error } = await deleteDocument(docId);
    if (error) {
      toast.error('خطأ في الحذف', {
        description: 'لم نتمكن من حذف الملف. ' + error,
      });
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const handleOpen = (doc) => {
    router.push(`/${doc.type === 'note' ? 'note' : 'canvas'}/${doc.id}`);
  };

  // تنسيق التاريخ بصيغة عربية مختصرة
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* RTL: العنصر الأول في اليمين = خروج (البداية منطقياً) */}
          <Button variant="ghost" onClick={handleSignOut} className="text-gray-600">
            <LogOut className="w-4 h-4 me-2" />
            خروج
          </Button>
          <span className="text-lg font-bold text-blue-600">Plan+Note</span>
          {/* RTL: العنصر الأخير في اليسار = جديد (النهاية منطقياً) */}
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 me-2" />
            جديد
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            أهلاً، {user.displayName?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">ملفاتك المحفوظة</p>
        </div>

        {docsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">لا يوجد ملفات بعد</p>
            <p className="text-sm mt-2">اضغط "جديد" لإنشاء أول ملف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleOpen(doc)}>
                  <span className="text-2xl">{doc.type === 'canvas' ? '🎨' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-800 truncate">{doc.title}</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {doc.type === 'canvas' ? 'لوحة تخطيط' : 'ملاحظة نصية'}
                    </p>
                    {doc.updatedAt?.toDate && (
                      <p className="text-[11px] text-gray-300 mt-1">
                        آخر تعديل: {formatDate(doc.updatedAt.toDate())}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 border-t border-gray-100 pt-4">
                  <Button variant="ghost" size="sm" className="flex-1 text-blue-600" onClick={() => handleOpen(doc)}>
                    <Edit3 className="w-4 h-4 me-1" /> فتح
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-red-500" onClick={() => handleDelete(doc.id)}>
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
                  className={`p-4 rounded-xl border-2 text-center transition-all ${newType === 'note' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-2xl block mb-1">📝</span>
                  <span className="text-sm font-medium text-gray-700">ملاحظة</span>
                </button>
                <button
                  onClick={() => setNewType('canvas')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${newType === 'canvas' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-2xl block mb-1">🎨</span>
                  <span className="text-sm font-medium text-gray-700">تخطيط</span>
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
    </div>
  );
}
```

---

### المرحلة 4: محرر الملاحظات

#### ملف `app/note/[id]/page.js`

```jsx
// app/note/[id]/page.js
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

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

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
    setTimeout(() => setSaved(false), 2000);
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

  if (loading || fetchLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
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
```

---

### المرحلة 5: لوحة الرسم (Canvas)

#### ملف `app/canvas/[id]/page.js`

```jsx
// app/canvas/[id]/page.js
'use client';

import '@excalidraw/excalidraw/index.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDocument, updateDocument } from '@/lib/firestore';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, Download, Save, Loader2, CheckCircle } from 'lucide-react';

// ⚠️ ضروري: Excalidraw لا يعمل مع SSR (يستخدم window)
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
  }
);

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
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

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

  const getInitialData = () => {
    if (!docData?.content) return undefined;
    try {
      const parsed = JSON.parse(docData.content);
      return {
        elements: parsed.elements || [],
        appState: { viewBackgroundColor: parsed.appState?.viewBackgroundColor || '#ffffff' },
      };
    } catch {
      return undefined;
    }
  };

  const handleSave = useCallback(async () => {
    if (!excalidrawAPI) return;
    setSaving(true);
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const content = JSON.stringify({
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
    });
    await updateDocument(id, content);
    setSaving(false);
    setSaved(true);
    setHasUnsavedChanges(false);
    setTimeout(() => setSaved(false), 2000);
  }, [id, excalidrawAPI]);

  const handleChange = useCallback(() => {
    setSaved(false);
    setHasUnsavedChanges(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    // حفظ تلقائي بعد 2 ثانية من آخر تغيير
    autoSaveTimer.current = setTimeout(() => handleSave(), 2000);
  }, [handleSave]);

  const handleExportToMD = async () => {
    if (!excalidrawAPI) return;
    setExporting(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      // ⚠️ استيراد ديناميكي داخل الدالة — الطريقة الصحيحة الوحيدة مع SSR
      const { exportToSvg } = await import('@excalidraw/excalidraw');

      const svgElement = await exportToSvg({
        elements,
        appState: { ...appState, exportWithDarkMode: false },
        files,
      });

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const title = docData?.title || 'canvas';
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
    } catch (e) {
      console.error('Export error:', e);
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
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowRight className="w-4 h-4 me-2" /> رجوع
          </Button>
          <h1 className="font-semibold text-gray-800 truncate flex-1 text-center">{docData?.title}</h1>
          <div className="flex items-center gap-2">
            {saved && <span className="text-green-500 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" />محفوظ</span>}
            {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 me-1" /> حفظ
            </Button>
            <Button size="sm" onClick={handleExportToMD} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Download className="w-4 h-4 me-1" />}
              تصدير MD
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={getInitialData()}
          onChange={handleChange}
          langCode="ar"
          theme="light"
          UIOptions={{
            canvasActions: {
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              saveAsImage: true,
              toggleTheme: false,
            },
          }}
        />
      </div>
    </div>
  );
}
```

> **ملاحظة حول تصدير MD:** ملف Markdown الناتج يحتوي على SVG مضمّن (inline)،
> لذلك قد يكون حجمه كبيراً وغير قابل للقراءة بصرياً عند فتحه كمصدر.
> - **الميزة:** يُعرض الرسم بشكل صحيح في أي عارض Markdown يدعم SVG.
> - **البديل المستقبلي (اختياري):** يمكن إضافة زر ثانٍ لتنزيل SVG كملف `.svg` منفصل
>   عبر `a.download = '...svg'` و `blob = new Blob([svgString], {type: 'image/svg+xml'})`.

---

### المرحلة 6: الإعدادات النهائية

#### ملف `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ضروري لـ Excalidraw
  transpilePackages: ['@excalidraw/excalidraw'],
};

export default nextConfig;
```

> **ملاحظة:** `create-next-app@latest` يُنشئ `next.config.mjs` (ES Module) افتراضياً.
> تأكد من حذف `next.config.js` إذا وُجد بعد الإنشاء واستخدام `next.config.mjs` فقط.

---

#### ملف `app/error.js` (Error Boundary عام)

```jsx
// app/error.js
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }) {
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
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}
```

---

#### ملف `app/loading.js` (شاشة تحميل عامة)

```jsx
// app/loading.js
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}
```

---

## عاشراً: حل المشاكل الشائعة

| المشكلة | السبب | الحل |
|---------|-------|------|
| `window is not defined` | Excalidraw مع SSR | تأكد من `dynamic(..., { ssr: false })` |
| `auth/unauthorized-domain` | Domain غير مسجّل | Firebase Console → Auth → Authorized Domains → أضف localhost |
| `permission-denied` | Security Rules | تأكد أن `userId` في البيانات = `uid` المستخدم |
| `failed-precondition` | Persistence مع تعدد التبويبات | طبيعي — يظهر في console فقط |
| Firestore index error | `orderBy` بدون index مركب | **يجب إنشاء فهرس مركب:**<br>1. Firebase Console → Firestore → Indexes<br>2. أضف Composite Index<br>3. Collection: `documents`<br>4. Fields: `userId` (Ascending) ثم `createdAt` (Descending)<br>5. Scope: Collection |
| الخط لا يظهر | اتصال إنترنت | تأكد الاتصال، أو استخدم `display: swap` في next/font |

---

## الحادي عشر: Checklist قبل النشر

- [ ] ملف `.env.local` موجود في `.gitignore`
- [ ] لا توجد مفاتيح Firebase في أي ملف `.js` أو `.md`
- [ ] Firebase Console: أضف domain النشر في Authorized Domains
- [ ] Firestore Index مركب موجود: مجموعة `documents` حقول `userId` (ASC) و `createdAt` (DESC)
- [ ] تسجيل الدخول بـ Google يعمل
- [ ] إنشاء ملف (note وcanvas) يعمل
- [ ] الحفظ التلقائي يعمل
- [ ] تصدير MD من Canvas يعمل
- [ ] الحذف يعمل
- [ ] مستخدم آخر لا يستطيع رؤية ملفاتك

---

## الثاني عشر: قواعد العمل الهندسية (لأي مطور يكمل المشروع)

1. **لا تكسر RTL:** كل component جديد يجب أن يحمل `dir="rtl"` أو يرثه من parent
2. **لا تضف auth بالبريد الإلكتروني:** القرار مقصود — Google Auth فقط
3. **لا تحذف Firestore Security Rules:** مطبّقة في Firebase Console وهي خط الدفاع الأول
4. **الـ content لـ Canvas هو JSON string دائماً:** لا تخزّنه كـ object مباشرة
5. **Excalidraw دائماً بـ dynamic import وssr: false:** لا استثناء لهذه القاعدة
6. **exportToSvg دائماً داخل الدالة:** استيراد ديناميكي داخل handleExportToMD فقط
7. **الخط مرة واحدة فقط:** next/font في layout.js — لا @import في CSS
8. **tailwindcss-animate مثبّتة ومطلوبة:** لا تحذفها، Shadcn يحتاجها
9. **Auto-save لا يلغي الحفظ اليدوي:** كلاهما موجود دائماً
10. **لا Middleware للحماية:** الحماية عبر useAuth() في كل صفحة — كافية وأبسط
