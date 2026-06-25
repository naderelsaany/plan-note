# Handoff Report - explorer_m1

## 1. Observation
Direct observations in the codebase of `plan-note`:
* **Client-side guarding & transitions**:
  In `app/dashboard/page.js` lines 49-51:
  ```javascript
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);
  ```
* **Unsaved Changes Navigation Loss**:
  In `app/note/[id]/page.js` line 94:
  ```javascript
  <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
  ```
  While the component listens to `beforeunload` for browser closures (lines 41-50), it does not intercept client-side router push.
* **Excalidraw Initial Data Re-evaluation**:
  In `app/canvas/[id]/page.js` line 255:
  ```javascript
  initialData={getInitialData()}
  ```
  Where `getInitialData` (lines 122-134) parses `docData.content` via `JSON.parse` on every single render.
* **Excalidraw Auto-save Zoom/Pan**:
  In `app/canvas/[id]/page.js` lines 159-165:
  ```javascript
  const handleChange = useCallback(() => {
    setSaved(false);
    setHasUnsavedChanges(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleSave(), 2000);
  }, [handleSave]);
  ```
  This is triggered on every single canvas event (including panning and zooming).
* **Font Styling Discrepancy**:
  In `tailwind.config.js` lines 51-53:
  ```javascript
  fontFamily: {
    arabic: ['Cairo', 'sans-serif'],
  },
  ```
  While `app/layout.js` lines 7-12 registers the Google Font Cairo with `--font-cairo`.
* **Missing Static Params**:
  In `app/blog/[slug]/page.js` (lines 67-94), `BlogPostPage` reads markdown dynamically on request without implementing `generateStaticParams()`.
* **Missing Firestore Rules File**:
  No `firestore.rules` file is found in the workspace root.

---

## 2. Logic Chain
1. **Unsaved Changes Loss**: Next.js client-side route transitions (`router.push`) bypass the native window `beforeunload` event. Since the "رجوع" buttons route instantly to `/dashboard` without verifying `hasUnsavedChanges` or forcing a save, any changes made within the last 1.5 - 2 seconds (before the auto-save debouncer completes) will be silently discarded.
2. **Excalidraw Rendering Lag**: Excalidraw's `onChange` callback triggers on any cursor movement, zoom, or pan. This fires `handleChange`, which updates state (`setSaved(false)` and `setHasUnsavedChanges(true)`), causing `CanvasPage` to re-render. Since `initialData` parses a large JSON string (`docData.content`) on every render pass, this results in continuous CPU overhead and lag on larger canvas drawings.
3. **Font Fallback**: Tailwind class `font-arabic` maps to the literal font-family name `'Cairo'`. Since Next.js loads Cairo dynamically via the CSS variable `--font-cairo`, any element using `font-arabic` will fall back to system defaults unless the user's OS happens to have Cairo installed locally.
4. **Blog Performance**: Fetching and parsing markdown files from disk dynamically at runtime on a dynamic route increases Time to First Byte (TTFB). Since the list of slugs is statically known, omitting `generateStaticParams` is a missed optimization for SEO and speed.
5. **Database Security Risk**: Checking `data.userId === user.uid` exclusively client-side after downloading the document does not prevent unauthorized users from retrieving data if Firestore rules (configured in the Firebase console) are insecure or set to public read. Keeping rules outside the repository increases the risk of regressions.

---

## 3. Caveats
* **Firebase Online Console Config**: We did not verify the actual Firestore rules deployed online in the Firebase Console (restricted by CODE_ONLY network mode). We assumed they might need alignment.
* **Testing environment**: We did not run the local web server to test runtime profile CPU graphs or measure LCP/CLS metrics directly.

---

## 4. Conclusion
The codebase is structured correctly using modern Next.js 16 App Router and Firebase. However, it requires key updates before implementation is completed:
1. **Auto-save & Navigation**: Auto-saving must be filtered so zoom/pan events do not trigger writes, and client-side navigation must block or force-save if changes are pending.
2. **Performance Fixes**: Memoize the initial data object to stop parsing JSON on every canvas mouse movement, and add `generateStaticParams()` to the blog pages for static caching.
3. **Tailwind Config & Typography**: Set Tailwind's `font-arabic` to `var(--font-cairo)`.
4. **Security rules**: Export security rules as `firestore.rules` into the codebase.

---

## 5. Verification Method
* **To Verify Issues**:
  1. Open `app/canvas/[id]/page.js` and trace `handleChange` to see that state updates on zoom/pan.
  2. Open `tailwind.config.js` and compare the `fontFamily.arabic` array with `cairo.variable` in `app/layout.js`.
  3. Inspect `app/blog/[slug]/page.js` to confirm the absence of `generateStaticParams`.
* **Testing Fixes (by the Implementer)**:
  1. Run `npm run dev` to start the app.
  2. Open the browser's developer console, go to the Canvas page, add an element, zoom in/out, and monitor CPU usage and Firestore writes.
  3. Edit a note, click the "رجوع" button immediately, and verify if the latest edits are saved.
