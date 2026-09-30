import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { support } from '../content';

/**
 * نافذة الدعم: نموذج Buy Me a Coffee داخل الموقع نفسه.
 *
 * الصفحة المضمَّنة هي نفسها التي تفتحها أداة Buy Me a Coffee الرسمية
 * (widget/page/<الاسم>) — مصمَّمةٌ لتُعرض داخل مواقع أخرى، والدفع يجري فيها
 * عندهم مباشرة، فلا يمرّ بموقعنا شيء.
 *
 * - <dialog> مع showModal(): يحبس التركيز داخله، ويُغلق بـ Escape.
 * - closedby="any": النقر خارج النافذة يغلقها. Safari لا يدعمه بعد، فله
 *   بديلٌ أدناه يفحص موضع النقرة.
 * - الإطار لا يُحمَّل إلّا عند أوّل فتح، فلا يدفع الزائر ثمنه إن لم يفتحه.
 */
const SupportDialog = forwardRef(function SupportDialog(_, ref) {
  const dialog = useRef(null);
  const [loaded, setLoaded] = useState(false);   // هل طُلب الإطار مرّة؟
  const [ready, setReady] = useState(false);     // هل اكتمل تحميله؟

  useImperativeHandle(ref, () => ({
    open() {
      setLoaded(true);
      dialog.current?.showModal();
    },
  }), []);

  // بديل النقر على الخلفية للمتصفّحات التي لا تعرف closedby (Safari).
  useEffect(() => {
    const d = dialog.current;
    if (!d || 'closedBy' in HTMLDialogElement.prototype) return;
    const onClick = (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      const inside = r.top <= e.clientY && e.clientY <= r.bottom
        && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) d.close();
    };
    d.addEventListener('click', onClick);
    return () => d.removeEventListener('click', onClick);
  }, []);

  const src = `https://www.buymeacoffee.com/widget/page/${support.id}`
    + `?description=${encodeURIComponent(support.description)}`
    + `&color=${encodeURIComponent('#185079')}`;

  return (
    <dialog ref={dialog} className="support-dialog" closedby="any" aria-labelledby="support-dialog-title">
      <div className="support-dialog__head">
        <div>
          <h2 id="support-dialog-title">{support.label}</h2>
          <p>{support.text}</p>
        </div>
        <button type="button" className="support-dialog__close" onClick={() => dialog.current?.close()}>
          إغلاق
        </button>
      </div>

      <div className="support-dialog__frame">
        {!ready && <p className="support-dialog__loading">جارٍ تحميل نموذج الدعم…</p>}
        {loaded && (
          <iframe
            src={src}
            title={support.label}
            allow="payment *; publickey-credentials-get *"
            onLoad={() => setReady(true)}
          />
        )}
      </div>

      <p className="support-dialog__alt">
        لا يظهر النموذج؟{' '}
        <a href={support.url} target="_blank" rel="noopener noreferrer">افتحه في صفحةٍ مستقلّة</a>
      </p>
    </dialog>
  );
});

export default SupportDialog;
