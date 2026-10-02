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
            {/* أيقونة الدعم */}
            <svg className="humbleicons hi-gift" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M12 9V6a3 3 0 1 0-3 3h3zm0 0V7a2 2 0 1 1 2 2h-2zm-7 4v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7m-7-3v11m8-8v-3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3h16z"/>
            </svg>
          </button>

          {/* زر المعرض / العودة للرئيسية بجانب زر القائمة */}
          <div className="header-center">
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
              {currentPage === 'gallery' ? 'الرئيسية' : 'المعرض'}
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
          </div>

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


