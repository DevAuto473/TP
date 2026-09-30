# موقع ترجمان

موقع تعريفي بمشروع ترجمان، فيه الأفاتار الحيّ يؤدّي العبارات السبع في المتصفّح مباشرة.

## التشغيل

```
npm install
npm run dev
```
ثمّ افتح الرابط الذي يظهر (عادةً http://localhost:5173).

## أين أعدّل؟

| ما تريد | الملفّ |
|---|---|
| أيّ نصّ في الموقع، والأرقام، وبيانات التواصل | `src/content.js` |
| الألوان والخطوط والمسافات | `src/styles.css` (أوّل الملفّ: `--cream` و `--navy`) |
| ترتيب الأقسام | `src/App.jsx` |

قسم «تواصل» مخفيّ حتى تملأ `contact` في `src/content.js`.

## تحديث الأفاتار والإشارات من المشروع

بعد `npm run export3d` في مشروع ترجمان، انسخ:

- `tarjuman/public/trained_signs.json` → `public/trained_signs.json`
- `tarjuman/public/last11.pi.glb` → `public/avatar.glb` (إن تغيّر النموذج)

وإن أضفت عبارة جديدة، أضفها إلى `phrases` في `src/content.js` بنفس معرّفها.

`src/avatar/useSignPlayer.js` منسوخ كما هو من التطبيق؛ إن عدّلته هناك فانسخه هنا أيضاً.

## النشر

```
npm run build
```
يُنتج مجلّد `dist/`. ارفع محتواه إلى أيّ استضافة ثابتة:
- **Netlify**: اسحب مجلّد `dist` إلى app.netlify.com/drop
- **GitHub Pages**: ارفع محتوى `dist` إلى فرع `gh-pages`

الموقع يعمل من أيّ مسار (`base: './'`)، فلا يحتاج إعداداً إضافياً.
