import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { hero, phrases } from '../content';
import HowStory from './HowStory';

// three.js والنموذج يُحمَّلان بعد ظهور النصّ، لا قبله.
const AvatarStage = lazy(() => import('../avatar/AvatarStage'));

const GAP_MS = 400;   // مهلة بعد نهاية الإشارة قبل إخفاء اسمها

export default function TryPanel() {
  const playerRef = useRef(null);
  const timer = useRef(0);
  const [signs, setSigns] = useState(null);     // null = جارٍ التحميل
  const [active, setActive] = useState(null);   // العبارة الجارية
  const [isMagic, setIsMagic] = useState(false);
  const howLink = useRef(null);

  // الخروج من العرض يعيد التركيز إلى الرابط الذي فتحه.
  const closeStory = () => {
    setIsMagic(false);
    requestAnimationFrame(() => howLink.current?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}trained_signs.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setSigns(d.signs || {}))
      .catch(() => setSigns({}));
    return () => clearTimeout(timer.current);
  }, []);

  const play = (phrase) => {
    const player = playerRef.current;
    const sign = signs?.[phrase.id];
    if (!player || !sign) return;
    // عبارةٌ جديدة تقطع السابقة بدل أن تنتظر خلفها في الطابور (انظر AvatarStage).
    player.play([{ word: phrase.label, sign }]);
    setActive(phrase.id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), sign.duration * 1000 + GAP_MS);
  };

  const ready = signs !== null;
  const current = phrases.find((p) => p.id === active);

  return (
    <div className={`try ${isMagic ? 'is-magic' : ''}`}>
      <div className="try-text" inert={isMagic}>
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title">{hero.title}</h1>
        <p className="lead">{hero.lead}</p>
      </div>

      <div className="stage" inert={isMagic}>
        <div className="stage-bg" aria-hidden="true">
          <img
            src={`${import.meta.env.BASE_URL}custom_bg.png`}
            alt=""
            className="stage-bg__img"
            loading="eager"
            decoding="async"
          />
          <div className="stage-bg__overlay" />
        </div>
        <Suspense fallback={<p className="stage-note">جارٍ تحميل الأفاتار…</p>}>
          <AvatarStage playerRef={playerRef} />
        </Suspense>
        <p className="stage-caption" aria-live="polite">
          {current ? current.label : ''}
        </p>
      </div>

      <div className="try-controls" inert={isMagic}>
        <h2 className="try-title">{hero.tryTitle}</h2>
        <p className="muted">{hero.tryHint}</p>
        <div className="phrases">
          {phrases.map((p) => (
            <button
              key={p.id}
              type="button"
              className="phrase"
              aria-pressed={active === p.id}
              disabled={!ready || !signs[p.id]}
              onClick={() => play(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <a
          ref={howLink}
          className="text-link"
          href="#how"
          aria-expanded={isMagic}
          onClick={(e) => { e.preventDefault(); setIsMagic(true); }}
        >
          {hero.primary} ←
        </a>
      </div>

      <HowStory active={isMagic} onClose={closeStory} />
    </div>
  );
}
