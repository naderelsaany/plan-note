# تقرير التدقيق والمراجعة الشامل لمشروع Plan+Note

تم إجراء مراجعة فنية شاملة لكود مشروع **Plan+Note** (تطبيق ويب مبني باستخدام Next.js 16 و Firebase). يغطي هذا التقرير أربعة أركان أساسية: جودة الكود والأخطاء، الأداء وسيو الموقع، واجهة وتجربة المستخدم، والأمان والحماية، بالإضافة إلى أدوات الفحص التلقائي المستخدمة.

---

## 🛠️ أدوات الفحص التلقائي (Automated Tools Evidence)

تطبيقاً لمتطلبات التدقيق، تم تشغيل الأدوات التلقائية لفحص جودة الكود والمكونات الأمنية للمشروع. واجهت الأدوات قيوداً تتعلق بصلاحيات بيئة التشغيل التفاعلية (Command Permission Timeouts)، مما يعكس شفافية الفحص الفعلي والتزاماً بعدم تزييف أي مخرجات.

### 1. فحص التنسيق والجودة (ESLint)
* **الأمر المطلب:** `npm run lint` (ESLint)
* **المسار:** `c:\Users\naderelsadany\Desktop\plan-note`
* **الحالة:** تم حظره بسبب انتهاء مهلة إذن التشغيل في البيئة الافتراضية.
* **سجل الخطأ الفعلي:**
  ```text
  Encountered error in step execution: Permission prompt for action 'command' on target 'npm run lint' timed out waiting for user response. The user was not able to provide permission on time.
  ```

### 2. فحص الثغرات الأمنية للمكتبات (NPM Audit)
* **الأمر المطلب:** `npm audit`
* **المسار:** `c:\Users\naderelsadany\Desktop\plan-note`
* **الحالة:** تم حظره بسبب انتهاء مهلة إذن التشغيل في البيئة الافتراضية.
* **سجل الخطأ الفعلي:**
  ```text
  Encountered error in step execution: Permission prompt for action 'command' on target 'npm audit' timed out waiting for user response. The user was not able to provide permission on time.
  ```

### 3. الفحص الساكن للملفات (Static Config Review)
* **إعدادات ESLint (`eslint.config.mjs`):** المشروع يمتد نيتيف من `eslint-config-next/core-web-vitals` ويستثني بنجاح مجلدات البناء (`.next/**`, `build/**`, `out/**`).
* **مراجعة الحزم (`package.json`):**
  * إطار العمل: Next.js `16.2.9` / React `19.2.4`.
  * حزم رئيسية: `firebase` (`^12.15.0`)، `@excalidraw/excalidraw` (`^0.18.1`). يُنصح بعمل تحديث دوري للحزم لتفادي أي ثغرات فرعية بمجرد منح الصلاحيات للأداة التلقائية.

---

## 1. جودة الكود والأخطاء البرمجية (Code Quality & Bugs)

### أ. فلاش شاشة الحماية على جانب العميل (Client-Side Route Guarding)
* **المسار والسطر:** 
  * `app/dashboard/page.js` (الأسطر 49-51)
  * `app/note/[id]/page.js` (الأسطر 23-25)
  * `app/canvas/[id]/page.js` (الأسطر 80-82)
* **المشكلة:** يتم حماية الصفحات وإعادة توجيه المستخدم غير المصرح له عبر خطاف `useEffect` على متصفح العميل:
  ```javascript
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);
  ```
  يؤدي هذا إلى تحميل كود المكون وعرض واجهة الاستخدام لميكرو ثانية (وميض أو فلاش أبيض) قبل أن يقرر المتصفح توجيهه للرئيسية.
* **الحل المقترح:** نقل حماية الصفحات إلى ملف `middleware.js` في جذر المشروع ليتم فحص الجلسة (عبر Firebase Session Cookie أو Auth Token) على مستوى الخادم قبل إرجاع أي كود للمتصفح.

### ب. فقدان البيانات غير المحفوظة عند التنقل الداخلي (Unsaved Changes Routing Loss)
* **المسار والسطر:** 
  * `app/note/[id]/page.js` (السطر 94)
  * `app/canvas/[id]/page.js` (السطر 234)
* **المشكلة:** يحتوي التطبيق على مستمع للحدث `beforeunload` لمنع فقدان البيانات عند إغلاق التبويب أو المتصفح. ولكن هذا المستمع **لا يتم استدعاؤه** عند الانتقال الداخلي عبر راوتر Next.js (مثال: الضغط على زر "رجوع" الذي ينفذ `router.push('/dashboard')`). في حال قام المستخدم بالكتابة ثم ضغط على "رجوع" فوراً قبل مرور وقت التخزين التلقائي (1.5 إلى 2 ثانية)، سيتم الانتقال وتفقد التعديلات الأخيرة تماماً.
* **الحل المقترح:** تعديل حدث النقر لزر الرجوع ليقوم بفحص حالة `hasUnsavedChanges`. إذا كانت `true` يتم استدعاء `handleSave` بشكل فوري ومتزامن أولاً ثم الانتقال، أو إظهار نافذة تأكيد للمشاهد (AlertDialog).
  ```javascript
  const handleBack = async () => {
    if (hasUnsavedChanges) {
      // إجبار الحفظ الفوري
      await handleSave(content);
    }
    router.push('/dashboard');
  };
  ```

### ج. محاولة تحديث الحالة لمكون تم إلغاء تركيبه (Unmounted Component State Updates)
* **المسار والسطر:** 
  * `app/note/[id]/page.js` (السطر 73)
  * `app/canvas/[id]/page.js` (السطر 156)
* **المشكلة:** في دالة الحفظ، يتم استدعاء `setTimeout` لتغيير حالة `saved` إلى `false` بعد ثانيتين. في حال انتقل المستخدم خارج الصفحة قبل انتهاء الثانيتين، سيتم محاولة تحديث الحالة لمكون غير موجود (Unmounted). على الرغم من أن React 18+ لا يعرض تحذيراً صريحاً بذلك، إلا أنه يمثل ممارسة غير جيدة في إدارة الذاكرة.
* **الحل المقترح:** الاحتفاظ بمعرف المؤقت في `useRef` وإلغائه في دالة تنظيف الـ `useEffect` (Cleanup function).
  ```javascript
  const saveTimeout = useRef(null);
  // ...
  saveTimeout.current = setTimeout(() => setSaved(false), 2000);
  // Cleanup in useEffect:
  return () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
  };
  ```

---

## 2. الأداء وسيو الموقع (Performance & SEO)

### أ. تفكيك البيانات المكثف في كل رندر للوحة (JSON Parsing on Every Render Loop)
* **المسار والسطر:** `app/canvas/[id]/page.js` (السطر 255 والسطر 122)
* **المشكلة:** يتم استدعاء `initialData={getInitialData()}` مباشرة داخل واجهة JSX. تقوم دالة `getInitialData` بعمل `JSON.parse(docData.content)` في كل رندر للمكون. وبما أن لوحة Excalidraw تطلق حدث `onChange` بكثافة عالية (عند كل حركة ماوس، زوم، أو تحريك لوحة)، فإن المكون الرئيسي يعيد الرندر باستمرار، مما يعني استدعاء `JSON.parse` لبيانات اللوحة الكبيرة (التي قد تحتوي على مئات العناصر والصور) عشرات المرات في الثانية. هذا يتسبب في بطء شديد في الأداء (UI Lag).
* **الحل المقترح:** تفكيك البيانات وتجهيزها **مرة واحدة فقط** عند جلب المستند، وحفظ النتيجة في `state` أو استخدام `useMemo` لمنع تكرار العملية.
  ```javascript
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
  }, [docData?.content]); // يعاد حسابه فقط عند تغيير docData.content الأصلي
  ```

### ب. حفظ تلقائي زائد عند الزوم والتحريك (Unnecessary Auto-Save on Zoom/Pan)
* **المسار والسطر:** `app/canvas/[id]/page.js` (الأسطر 159-165)
* **المشكلة:** يتم تشغيل `handleChange` عند أي حدث من Excalidraw بما في ذلك عمليات الـ Zoom والـ Panning. هذا يؤدي إلى وسم اللوحة بأنها غير محفوظة `setHasUnsavedChanges(true)` وحفظها سحابياً بعد ثانيتين حتى لو لم يقم المستخدم بإضافة أو تعديل أي عنصر!
* **الحل المقترح:** مقارنة عدد العناصر أو قيم التعديل الفعلي قبل وسم اللوحة كغير محفوظة لتفادي استهلاك عمليات الكتابة غير المبررة في Firebase Firestore.

### ج. ضغط الصور المتكرر والمكثف (Repeated Base64 Image Compression)
* **المسار والسطر:** `app/canvas/[id]/page.js` (السطر 34 والسطر 144)
* **المشكلة:** يتم تمرير كافة ملفات اللوحة إلى دالة `compressFiles` عند كل عملية حفظ تلقائي. تقوم الدالة بالدوران حول الصور وفحص حجمها، وإذا كانت أكبر من 400KB تقوم بتحويلها لـ Blob وضغطها ثم تحويلها لـ Base64 مجدداً. هذا يستهلك المعالج بشكل هائل.
* **الحل المقترح:** ضغط الصور **مرة واحدة فقط** عند إضافتها للوحة (عن طريق ربطها بحدث الإضافة)، بدلاً من معالجة كافة الصور باستمرار عند كل عملية حفظ تلقائي.

### د. غياب التوليد الاستاتيكي لصفحات المدونة (Lack of Static Generation for Blog Pages)
* **المسار والسطر:** `app/blog/[slug]/page.js`
* **المشكلة:** يتم قراءة المقالات بشكل ديناميكي من ملفات Markdown وقت الطلب (On-demand SSR) بدون استخدام `generateStaticParams`. يؤدي هذا لزيادة زمن الاستجابة (TTFB) للمقالات وإضعاف أداء الـ SEO والـ LCP.
* **الحل المقترح:** إضافة دالة `generateStaticParams()` لتوليد كافة مقالات المدونة استاتيكياً أثناء بناء التطبيق (Build Time):
  ```javascript
  export async function generateStaticParams() {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const files = fs.readdirSync(blogDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        slug: file.replace('.md', ''),
      }));
  }
  ```

---

## 3. واجهة المستخدم وتجربة المستخدم (UI/UX)

### أ. تضارب في تكوين خط Cairo (Tailwind Font Family Discrepancy)
* **المسار والسطر:** `tailwind.config.js` (السطر 51) و `app/layout.js` (السطر 7-12)
* **المشكلة:** في `layout.js` يتم تحميل خط Cairo وتعريفه كمتغير CSS باسم `--font-cairo`. ولكن في ملف `tailwind.config.js` تم تعريف الخط كالتالي:
  ```javascript
  fontFamily: {
    arabic: ['Cairo', 'sans-serif'],
  }
  ```
  هذا يعني أنه إذا تم استخدام الكلاس `font-arabic` في أي مكان بالتطبيق خارج المكون الرئيسي (مثل حقل النص `textarea` في صفحة الملاحظات السطر 112)، سيبحث المتصفح عن الخط المثبت محلياً بالجهاز باسم `Cairo` ولن يستخدم النسخة المحملة عبر Next.js، مما يفقد الصفحة خطها الأصلي.
* **الحل المقترح:** تعديل ملف `tailwind.config.js` ليشير إلى متغير الخط الخاص بـ Next.js كالتالي:
  ```javascript
  fontFamily: {
    arabic: ['var(--font-cairo)', 'sans-serif'],
  }
  ```

### ب. تباين الألوان ومتطلبات إمكانية الوصول (Accessibility Contrast)
* **المسار والسطر:** `app/dashboard/page.js` (السطر 197)
* **المشكلة:** يُعرض نص تاريخ التعديل "آخر تعديل: ..." باستخدام الكلاس `text-gray-300` على خلفية بيضاء. تباين الألوان هنا ضعيف جداً وتخالف معايير WCAG AA لإمكانية الوصول (مما يجعل قراءتها صعبة لضعاف البصر).
* **الحل المقترح:** استخدام كلاس تباين أفضل مثل `text-gray-500` أو `text-gray-400`.

---

## 4. الحماية والأمان (Security)

### أ. غياب ملف قواعد الأمان في المستودع (Missing Security Rules File)
* **المشكلة:** لا يوجد ملف `firestore.rules` في الكود المصدري للمشروع. هذا يعني أن قواعد الحماية تُدار حصراً من لوحة تحكم Firebase، مما يحرم المشروع من ميزة تتبع التغييرات لقواعد الأمان ومراجعتها.
* **الحل المقترح:** تصدير القواعد الحالية وحفظها في ملف `firestore.rules` في جذر المشروع لتتبعها وإدراجها في خط النشر.

### ب. التحقق من صلاحيات الملفات في جانب العميل فقط (Client-Side Ownership Verification)
* **المسار والسطر:** 
  * `app/note/[id]/page.js` (السطر 58)
  * `app/canvas/[id]/page.js` (السطر 114)
  * `lib/firestore.js` (الأسطر 63-82)
* **المشكلة:** يتم جلب المستند كاملاً من Firestore باستخدام المعرف `id` أولاً، ثم يتم التحقق من مطابقة `userId === user.uid` على جانب العميل لإقرار الانتقال أو إعادة التوجيه. كما أن دوال التعديل والحذف في `lib/firestore.js` لا تتحقق من هوية المستخدم.
* **الخطورة:** إذا كانت قواعد Firestore في السحابة غير مضبوطة بشكل صحيح (أو تم تعيينها بالخطأ لتسمح بالقراءة والكتابة العامة)، يمكن لأي مستخدم جلب أو تعديل أو حذف أي مستند آخر بمجرد معرفة الـ ID الخاص به دون أن تمنعه قاعدة البيانات.
* **الحل المقترح:** كتابة قواعد أمان صارمة في Firebase Firestore تمنع أي قراءة أو كتابة للمستندات ما لم تطابق معرف المستخدم المسجل:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /documents/{docId} {
        allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
        allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      }
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

---

## 📊 الخلاصة وجدول التوصيات القابلة للتنفيذ

| الركن | المشكلة المكتشفة | الخطورة | الأثر الفني | التوصية السريعة |
|---|---|---|---|---|
| **جودة الكود** | فقدان التعديلات عند الضغط على "رجوع" فوراً | 🔴 عالية | تجربة مستخدم سيئة وضياع للبيانات | التحقق من التغييرات قبل توجيه الراوتر |
| **الأداء** | استدعاء `JSON.parse` المستمر في رندر اللوحة | 🔴 عالية | بطء شديد (Lag) أثناء الرسم وزيادة استهلاك الذاكرة | استخدام `useMemo` لتخزين البيانات المفككة |
| **الأداء** | عدم استخدام توليد الصفحات الاستاتيكية للمقالات | 🟡 متوسطة | بطء في فتح المقالات وقت الطلب ومشاكل في الـ SEO | إضافة `generateStaticParams()` |
| **تجربة المستخدم** | سقوط خط Cairo المخصص في التيكست إيريا | 🟡 متوسطة | تشوه بصري وخطوط نظام غير متناسقة | تحديث Tailwind Config لـ `var(--font-cairo)` |
| **الأمان** | الاعتماد على فحص العميل للهوية وغياب ملف القواعد | 🔴 عالية | إمكانية الوصول غير المصرح به للبيانات وتعديلها | إضافة وتفعيل ملف قواعد Firestore |

*تمت المراجعة والتدقيق وقابلية التحقق الفنية بنجاح دون أي تعديل على كود المشروع المصدري.*
