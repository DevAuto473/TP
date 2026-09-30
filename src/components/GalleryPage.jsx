import React, { useEffect } from 'react';
import { gallery } from '../content';

export default function GalleryPage({ articleId, onNavigateHome, onSelectArticle, onBackToGallery }) {
  // تمرير إلى أعلى الصفحة عند تغيير المقال أو الصفحة
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleId]);

  const activeArticle = articleId 
    ? gallery.cards.find((c) => c.id === articleId) 
    : null;

  // المقال التالي في القائمة
  const currentIdx = gallery.cards.findIndex((c) => c.id === articleId);
  const nextArticle = currentIdx !== -1 && currentIdx < gallery.cards.length - 1
    ? gallery.cards[currentIdx + 1]
    : currentIdx === gallery.cards.length - 1
      ? gallery.cards[0]
      : null;

  return (
    <div className="gallery-page">
      {activeArticle ? (
        /* ═══════════════════════════════════════════════════════════════
           صفحة المقال المستقلة الكاملة
           ═══════════════════════════════════════════════════════════════ */
        <article className="article-page container">
          {/* مسار التنقل (Breadcrumbs) */}
          <nav className="gallery-breadcrumbs" aria-label="مسار التنقل">
            <button type="button" onClick={onNavigateHome} className="breadcrumb-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>الرئيسية</span>
            </button>
            <span className="breadcrumb-sep">/</span>
            <button type="button" onClick={onBackToGallery} className="breadcrumb-btn">
              <span>المعرض</span>
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{activeArticle.title}</span>
          </nav>

          <header className="article-header">
            <div className="article-meta-tags">
              <span className="gallery-badge">{activeArticle.tag}</span>
              <span className="gallery-read-time">{activeArticle.readTime}</span>
              <span className="article-date">{activeArticle.date}</span>
            </div>

            <h1 className="article-title">{activeArticle.title}</h1>
            {activeArticle.summary && (
              <p className="article-lead">{activeArticle.summary}</p>
            )}
          </header>

          <div className="article-cover-wrap">
            <img src={activeArticle.image} alt={activeArticle.title} className="article-cover-img" />
          </div>

          <div className="article-body">
            {activeArticle.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {activeArticle.hardware && activeArticle.hardware.length > 0 && (
            <div className="article-hardware-section">
              <h2 className="article-hardware-title">مواصفات وتشريح العتاد المدمج</h2>
              <div className="hardware-grid">
                {activeArticle.hardware.map((hw) => (
                  <div key={hw.id || hw.name} className="hardware-card">
                    <div className="hardware-card__icon-wrap">
                      {renderHardwareIcon(hw.icon)}
                    </div>
                    <div className="hardware-card__content">
                      <div className="hardware-card__header">
                        <h3 className="hardware-card__name">{hw.name}</h3>
                        {hw.badge && <span className="hardware-card__badge">{hw.badge}</span>}
                      </div>
                      {hw.role && <span className="hardware-card__role">{hw.role}</span>}
                      <p className="hardware-card__desc">{hw.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeArticle.closingNote && (
            <div className="article-closing-callout">
              <p>{activeArticle.closingNote}</p>
            </div>
          )}

          {activeArticle.highlights && (
            <div className="article-highlights-grid">
              {activeArticle.highlights.map((h, i) => (
                <div key={i} className="article-highlight-box">
                  <span className="article-highlight-number">{h.value}</span>
                  <span className="article-highlight-title">{h.label}</span>
                </div>
              ))}
            </div>
          )}

          <footer className="article-footer">
            <button type="button" onClick={onBackToGallery} className="article-back-gallery-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span>العودة لبطاقات المعرض</span>
            </button>

            {nextArticle && (
              <button 
                type="button" 
                onClick={() => onSelectArticle(nextArticle.id)} 
                className="article-next-btn"
              >
                <span>المقال التالي: {nextArticle.title}</span>
                <span className="arrow-left" aria-hidden="true">←</span>
              </button>
            )}
          </footer>
        </article>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           صفحة المعرض المستقلة (شبكة 2x2 للبطاقات)
           ═══════════════════════════════════════════════════════════════ */
        <div className="gallery-page-main">
          {/* هيدر صفحة المعرض */}
          <section className="gallery-page-hero">
            <div className="container">
              <nav className="gallery-breadcrumbs" aria-label="مسار التنقل">
                <button type="button" onClick={onNavigateHome} className="breadcrumb-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>الرئيسية</span>
                </button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">المعرض</span>
              </nav>

              <div className="gallery-hero-text">
                <span className="eyebrow">المعرض وكواليس التطوير</span>
                <h1 className="gallery-page-title">{gallery.modalTitle}</h1>
                <p className="gallery-page-lead">{gallery.modalLead}</p>
              </div>
            </div>
          </section>

          {/* شبكة بطاقات المعرض 2x2 المستوحاة من النموذج المرفق */}
          <section className="gallery-page-grid-section">
            <div className="container">
              <div className="gallery-cards-grid gallery-page-grid">
                {gallery.cards.map((item) => (
                  <article
                    key={item.id}
                    className="gallery-card gallery-page-card"
                    onClick={() => onSelectArticle(item.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`قراءة مقال ${item.title}`}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectArticle(item.id); 
                      }
                    }}
                  >
                    {/* الصورة العلوية بزوايا دائرية */}
                    <div className="gallery-card__img-wrap">
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <span className="gallery-card__tag">{item.tag}</span>
                    </div>

                    {/* الشريط السفلي: العنوان فقط */}
                    <div className="gallery-card__banner">
                      <span className="gallery-card__text">{item.title}</span>
                    </div>
                  </article>

                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function renderHardwareIcon(icon) {
  switch (icon) {
    case 'cpu':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'camera':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'screen':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'speaker':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
    case 'mic':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      );
    case 'led':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case 'fan':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.8 16.4a6.1 6.1 0 0 1-8.6-7l5.4 1.4a4 4 0 0 0 3.2 5.6z" />
          <path d="M13.2 7.6a6.1 6.1 0 0 1 8.6 7l-5.4-1.4a4 4 0 0 0-3.2-5.6z" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}
