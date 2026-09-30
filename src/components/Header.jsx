import { useEffect, useRef, useState } from 'react';
import { site, nav, header, support } from '../content';
import SupportDialog from './SupportDialog';


/**
 * الترويسة: الشعار، وأقسام الصفحة، وزرّ التجربة.
 *
 * - الرابط الذي تقرأ قسمه الآن يتلوّن (IntersectionObserver، لا مستمعَ تمرير:
 *   المتصفّح يخبرنا حين يدخل قسمٌ منتصف الشاشة، ولا نحسب شيئاً مع كلّ بكسل).
 * - تكتسب ظلّاً حين تبدأ الصفحة بالنزول، فتنفصل عمّا تحتها.
 * - على الجوال تُطوى الروابط خلف زرّ «القائمة».
 */
export default function Header({ currentPage = 'home', onNavigateHome, onNavigateGallery }) {
  const { contact } = site;
  const items = nav;
  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sentinel = useRef(null);
  const supportDialog = useRef(null);

  // هل نزلت الصفحة؟ عنصرٌ خفيّ في أعلاها: خرج من الشاشة ⇐ نزلنا.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    if (sentinel.current) io.observe(sentinel.current);
    return () => io.disconnect();
  }, []);

  // أيّ قسمٍ في منتصف الشاشة الآن؟ (فقط عندما نكون في الصفحة الرئيسية)
  useEffect(() => {
    if (currentPage !== 'home') return;
    const sections = items.map((n) => document.getElementById(n.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },   // شريطٌ رفيع في وسط الشاشة
    );
    sections.forEach((s) => io.observe(s));
    // في أعلى الصفحة لا قسمَ نشطاً.
    const top = document.getElementById('top');
    const ioTop = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(null); },
      { rootMargin: '-45% 0px -50% 0px' });
    if (top) ioTop.observe(top);
    return () => { io.disconnect(); ioTop.disconnect(); };
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape يغلق القائمة، وأيّ رابطٍ فيها يغلقها بعد النقر.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleBrandClick = (e) => {
    setOpen(false);
    if (currentPage !== 'home') {
      e.preventDefault();
      onNavigateHome?.();
    }
  };

  const handleNavClick = (id, e) => {
    setOpen(false);
    if (currentPage !== 'home') {
      e.preventDefault();
      onNavigateHome?.();
      // انتظر قليلاً ثم مرّر للقسم
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  };

  return (
    <>
      <div ref={sentinel} className="scroll-sentinel" aria-hidden="true" />
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <div className="container header-inner">
          <a href="#top" className="brand" onClick={handleBrandClick}>
            <span className="brand-mark" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="شعار ترجمان" className="brand-img" />
            </span>
            <span className="brand-text">
              <span className="brand-name">{site.name}</span>
              <span className="brand-tag">{header.tagline}</span>
            </span>
          </a>

          <button
            type="button"
            className="support-icon"
            aria-label={support.label}
            aria-haspopup="dialog"
            title={support.label}
            onClick={() => { setOpen(false); supportDialog.current?.open(); }}
          >
            {/* أيقونة التبرع - hand-holding-heart من Font Awesome 6 */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M163.9 136.9c-29.4-29.8-29.4-78.2 0-108s77.2-29.8 106.6 0l17.5 17.8 17.5-17.8c29.4-29.8 77.2-29.8 106.6 0s29.4 78.2 0 108L310.5 240.1c-6.2 6.3-14.3 9.4-22.5 9.4s-16.3-3.1-22.5-9.4L163.9 136.9zM568.2 336.3c13.1 17.8 9.3 42.8-8.5 55.9L433.1 485.5c-23.4 17.2-51.6 26.5-80.7 26.5H192 32c-17.7 0-32-14.3-32-32V416c0-17.7 14.3-32 32-32H68.8l44.9-36c22.7-18.2 50.9-28 80.2-28H272h16 64c17.7 0 32 14.3 32 32s-14.3 32-32 32H288 272c-8.8 0-16 7.2-16 16s7.2 16 16 16H392.6l119.7-88.2c17.8-13.1 42.8-9.3 55.9 8.5z"/>
            </svg>
          </button>

          {/* زر المعرض / العودة للرئيسية بجانب زر القائمة */}
          <button
            type="button"
            className={`gallery-btn${currentPage === 'gallery' ? ' is-active' : ''}`}
            aria-label={currentPage === 'gallery' ? 'الصفحة الرئيسية' : 'صفحة المعرض'}
            title={currentPage === 'gallery' ? 'العودة للصفحة الرئيسية' : 'الانتقال لصفحة المعرض'}
            onClick={() => {
              setOpen(false);
              if (currentPage === 'gallery') {
                onNavigateHome?.();
              } else {
                onNavigateGallery?.();
              }
            }}
          >
            {currentPage === 'gallery' ? (
              <>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>الرئيسية</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
                <span>المعرض</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'إغلاق' : 'القائمة'}
          </button>

          <nav id="site-nav" className="site-nav" aria-label="أقسام الصفحة">
            <ul className="nav">
              {items.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={active === n.id ? 'true' : undefined}
                    onClick={(e) => handleNavClick(n.id, e)}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <a 
              href="#top" 
              className="header-cta" 
              onClick={(e) => {
                setOpen(false);
                if (currentPage !== 'home') {
                  e.preventDefault();
                  onNavigateHome?.();
                }
              }}
            >
              {header.cta}
            </a>
          </nav>
        </div>
      </header>
      <SupportDialog ref={supportDialog} />
    </>
  );
}


