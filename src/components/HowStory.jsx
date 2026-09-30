import { useEffect, useMemo, useRef, useState } from 'react';
import { story } from '../content';

/**
 * «كيف يعمل» — جملٌ قصيرة تظهر واحدةً بعد الأخرى داخل البطاقة الأولى.
 *
 * كلّ جملة شريحة: العنوان، ثمّ جمل الجزء الأوّل، ثمّ عنوان الجزء الثاني
 * وجمله، ثمّ خاتمة. تتقدّم وحدها، ويمكن إيقافها والتنقّل بالأزرار أو بأسهم
 * لوحة المفاتيح.
 *
 * - تقدّمٌ تلقائي قابلٌ للإيقاف (المحتوى المتحرّك يجب أن يُوقَف).
 * - aria-live يقرأ كلّ جملةٍ جديدة لقارئ الشاشة.
 * - مع «تقليل الحركة» تتبدّل الجمل بلا تمويهٍ ولا تكبير.
 */
const STEP_MS = 4500;     // مدّة الجملة الواحدة
const TITLE_MS = 5000;    // العناوين تبقى أطول قليلاً

function buildSlides() {
  const slides = [{ kind: 'title', text: story.title }];
  story.chapters.forEach((ch) => {
    if (ch.title) slides.push({ kind: 'title', text: ch.title, label: ch.label });
    ch.lines.forEach((text) => slides.push({ kind: 'line', text, label: ch.label }));
  });
  slides.push({ kind: 'closing', text: story.closing });
  return slides;
}

export default function HowStory({ active, onClose }) {
  const slides = useMemo(buildSlides, []);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const root = useRef(null);
  const last = slides.length - 1;

  // كلّ فتحٍ يبدأ من أوّل جملة، ويتلقّى التركيز ليقرأه قارئ الشاشة.
  useEffect(() => {
    if (!active) return;
    setI(0);
    setPlaying(true);
    // على الجوال البطاقة أطول من الشاشة، والرابط في أسفلها: انقل الصفحة إلى
    // أعلاها حتى يرى الزائر أوّل جملة لا منتصف البطاقة.
    root.current?.scrollIntoView({ block: 'start' });
    root.current?.focus({ preventScroll: true });
  }, [active]);

  // التقدّم التلقائي. يتوقّف عند الخاتمة.
  useEffect(() => {
    if (!active || !playing || i >= last) return;
    const t = setTimeout(() => setI((n) => Math.min(n + 1, last)),
      slides[i].kind === 'title' ? TITLE_MS : STEP_MS);
    return () => clearTimeout(t);
  }, [active, playing, i, last, slides]);

  const go = (n) => { setPlaying(false); setI(Math.max(0, Math.min(n, last))); };

  const onKey = (e) => {
    // RTL: السهم الأيسر هو «التالي».
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
  };

  const slide = slides[i];

  return (
    <div
      ref={root}
      className="magic-content"
      role="region"
      aria-label="كيف يعمل ترجمان"
      tabIndex={-1}
      inert={!active}
      onKeyDown={onKey}
    >
      <div className="story">
        <p className="story__label">{slide.label || ' '}</p>

        {/* key يعيد تركيب العنصر مع كلّ جملة، فتُعاد حركة الظهور */}
        <p
          key={i}
          className={`story__text story__text--${slide.kind}`}
          aria-live="polite"
        >
          {slide.text}
        </p>

        <div className="story__progress" aria-hidden="true">
          {slides.map((s, n) => (
            <span
              key={n}
              className={`story__dot${n === i ? ' is-current' : ''}${n < i ? ' is-done' : ''}${s.kind === 'title' ? ' is-title' : ''}`}
            />
          ))}
        </div>

        <div className="story__controls">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0}>السابق</button>
          <button type="button" onClick={() => setPlaying((p) => !p)} disabled={i === last}>
            {playing && i < last ? 'إيقاف' : 'تشغيل'}
          </button>
          <button type="button" onClick={() => go(i + 1)} disabled={i === last}>التالي</button>
          <button type="button" className="story__back" onClick={onClose}>العودة إلى الأفاتار</button>
        </div>
      </div>
    </div>
  );
}
