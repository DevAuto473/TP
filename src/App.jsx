import React, { useState, useEffect } from 'react';
import { site, problem, how, numbers, privacy, next, about } from './content';
import TryPanel from './components/TryPanel';
import Header from './components/Header';
import ContactDialog from './components/ContactDialog';
import GalleryPage from './components/GalleryPage';

function parseHash() {
  const hash = window.location.hash || '';
  if (hash.startsWith('#gallery')) {
    const clean = hash.replace(/^#\/?/, '');
    const parts = clean.split('/');
    return {
      page: 'gallery',
      articleId: parts[1] || null,
    };
  }
  return {
    page: 'home',
    articleId: null,
  };
}

function Section({ id, title, lead, children, tone }) {
  return (
    <section id={id} className={`section${tone ? ` section--${tone}` : ''}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <h2 id={`${id}-title`} className="section-title">{title}</h2>
        {lead && <p className="section-lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [activeTool, setActiveTool] = useState(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const contactDialogRef = React.useRef(null);
  const { contact } = site;
  const hasContact = contact.email || contact.github || contact.linkedin;

  useEffect(() => {
    const handleHash = () => {
      setRoute(parseHash());
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToHome = () => {
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToGallery = () => {
    window.location.hash = '#gallery';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectArticle = (id) => {
    window.location.hash = `#gallery/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToGallery = () => {
    window.location.hash = '#gallery';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <>
      <a className="skip-link" href="#content">تخطَّ إلى المحتوى</a>

      <Header 
        currentPage={route.page} 
        onNavigateHome={navigateToHome} 
        onNavigateGallery={navigateToGallery} 
      />

      {route.page === 'gallery' ? (
        <main id="content" tabIndex={-1}>
          <GalleryPage 
            articleId={route.articleId}
            onNavigateHome={navigateToHome}
            onSelectArticle={selectArticle}
            onBackToGallery={backToGallery}
          />
        </main>
      ) : (
        <>
          <main id="content" tabIndex={-1}>
        {/* ── البداية: هالةٌ كحلية، والأفاتار يطفو فوقها ────────────────── */}
        <section id="top" className="hero-wrap" aria-labelledby="hero-title">
          <div className="container">
            <div className="aurora grain">
              <div className="aurora__inner">
                <TryPanel />
              </div>
            </div>
          </div>
        </section>

        {/* ── الفكرة ──────────────────────────────────────────────── */}
        <Section id="problem" title={problem.title}>
          <div className="prose">
            {problem.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Section>

        {/* ── كيف يعمل ────────────────────────────────────────────── */}
        <Section id="how" title={how.title} lead={how.lead} tone="soft">
          <div className="directions">
            {how.directions.map((d) => (
              <div key={d.title} className="direction card">
                <h3>{d.title}</h3>
                <ol className="steps">
                  {d.steps.map((s) => (
                    <li key={s.title}>
                      <strong>{s.title}</strong>
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <h3 className="sub-title">{how.stackTitle}</h3>
          <ul className="tags" aria-label={how.stackTitle}>
            {how.stack.map((t) => (
              <li key={t.name}>
                <button type="button" className="tag-btn" onClick={() => { setActiveTool(t); setIsToolModalOpen(true); }} lang="en" dir="ltr">
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── بالأرقام: بطاقة متدرّجة من عائلة الكحلي ─────────────────── */}
        <section id="numbers" className="section" aria-labelledby="numbers-title">
          <div className="container">
            <div className="mesh-card grain">
              <h2 id="numbers-title" className="section-title">{numbers.title}</h2>
              <p className="section-lead">{numbers.lead}</p>
              {numbers.groups.map((g) => (
                <div key={g.title} className="stat-group">
                  <h3 className="stat-group__title">{g.title}</h3>
                  <dl className="stats">
                    {g.stats.map((s) => (
                      <div key={s.label} className="stat">
                        <dt>{s.label}</dt>
                        {/* dir=auto: «430 مليون» عربية الاتجاه، و«< 1 ms» لاتينية */}
                        <dd dir="auto">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {g.source && (
                    <p className="stat-source">
                      <a href={g.source.url} target="_blank" rel="noopener noreferrer">{g.source.label}</a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── الخصوصية والعتاد ────────────────────────────────────── */}
        <Section id="privacy" title={privacy.title}>
          <div className="cols">
            {privacy.blocks.map((b) => (
              <div key={b.title} className="card">
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── الخطوات القادمة ─────────────────────────────────────── */}
        <Section id="next" title={next.title}>
          <ol className="roadmap">
            {next.items.map((it) => (
              <li key={it.title}>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </li>
            ))}
          </ol>
        </Section>


      </main>

      {/* من أنا */}
      <section id="about" className="container" style={{ marginBlockEnd: '4rem' }}>
        <div className="about-card mesh-card">
          <div className="about-card__content">
            <h2 className="section-title">{about.title}</h2>
            <div className="about-card__text">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="about-card__image">
            {about.image ? (
              <img src={about.image} alt={about.title} />
            ) : (
              <div className="img-placeholder" style={{ borderRadius: 'var(--radius-lg)' }}>صورة شخصية</div>
            )}
          </div>
        </div>
      </section>
        </>
      )}

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>{site.name} — مشروع من إعداد {site.author} · {site.year}</p>
          <div className="footer-social">
            {contact.github && (
              <a href={contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} aria-label="Phone">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </a>
            )}
            {contact.email && (
              <button 
                type="button" 
                className="email-contact-btn" 
                aria-label="Email" 
                onClick={() => contactDialogRef.current?.open()}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* نافذة الأدوات المنبثقة (Popup) */}
      <div className={`tool-modal-overlay ${isToolModalOpen ? 'is-open' : ''}`} onClick={() => setIsToolModalOpen(false)}>
        <div className="tool-modal-content" onClick={e => e.stopPropagation()}>
          {activeTool && (
            <>
              <button className="tool-modal-close" onClick={() => setIsToolModalOpen(false)} aria-label="إغلاق">✕</button>
              <div className="tool-modal-image">
                {activeTool.image ? (
                  <img src={activeTool.image} alt={activeTool.name} />
                ) : (
                  <div className="img-placeholder">
                    <span>صورة توضيحية لـ {activeTool.name}</span>
                  </div>
                )}
              </div>
              <div className="tool-modal-text">
                <h3 lang="en" dir="ltr">{activeTool.name}</h3>
                <p>{activeTool.desc}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <ContactDialog ref={contactDialogRef} />
    </>
  );
}
