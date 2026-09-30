import React, { useState, useEffect } from 'react';
import { gallery } from '../content';

export default function GalleryModal({ isOpen, onClose }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  // إغلاق عند ضغط زر Escape، أو العودة للمعرض إن كان هناك مقال مفتوح
  useEffect(() => {
    if (!isOpen) {
      setSelectedArticle(null);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedArticle, onClose]);

  // منع التمرير في الخلفية عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`tool-modal-overlay gallery-modal-overlay ${isOpen ? 'is-open' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
    >
      <div 
        className="tool-modal-content gallery-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="tool-modal-close gallery-modal-close" 
          onClick={onClose} 
          aria-label="إغلاق"
        >
          ✕
        </button>

        {selectedArticle ? (
          /* ── عرض المقال المختار ── */
          <div className="gallery-article-view">
            <div className="gallery-article-topbar">
              <button 
                type="button" 
                className="gallery-back-btn" 
                onClick={() => setSelectedArticle(null)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span>العودة للمعرض</span>
              </button>

              <div className="gallery-article-meta">
                <span className="gallery-badge">{selectedArticle.tag}</span>
                <span className="gallery-read-time">{selectedArticle.readTime}</span>
              </div>
            </div>

            <div className="gallery-article-header">
              <h2 id="gallery-modal-title" className="gallery-article-title">
                {selectedArticle.title}
              </h2>
              {selectedArticle.summary && (
                <p className="gallery-article-lead">{selectedArticle.summary}</p>
              )}
            </div>

            <div className="gallery-article-cover">
              <img src={selectedArticle.image} alt={selectedArticle.title} />
            </div>

            <div className="gallery-article-body">
              {selectedArticle.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {selectedArticle.highlights && (
              <div className="gallery-article-highlights">
                {selectedArticle.highlights.map((h, i) => (
                  <div key={i} className="gallery-highlight-card">
                    <span className="gallery-highlight-val">{h.value}</span>
                    <span className="gallery-highlight-lbl">{h.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="gallery-article-footer">
              <button 
                type="button" 
                className="gallery-footer-back-btn"
                onClick={() => setSelectedArticle(null)}
              >
                <span>الرجوع إلى بطاقات المعرض</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── شبكة المعرض (تنسيق البطاقات المربوط بالمقالات) ── */
          <div className="gallery-grid-view">
            <div className="gallery-header-section">
              <div className="gallery-title-row">
                <span className="gallery-pill-tag">المعرض</span>
                <h2 id="gallery-modal-title" className="gallery-title">
                  {gallery.modalTitle}
                </h2>
              </div>
              <p className="gallery-lead">
                {gallery.modalLead}
              </p>
            </div>

            <div className="gallery-cards-grid">
              {gallery.cards.map((item) => (
                <div 
                  key={item.id} 
                  className="gallery-card"
                  onClick={() => setSelectedArticle(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedArticle(item); }}
                >
                  <div className="gallery-card__img-wrap">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    <span className="gallery-card__tag">{item.tag}</span>
                  </div>
                  
                  {/* شريط النص السفلي: العنوان فقط */}
                  <div className="gallery-card__banner">
                    <span className="gallery-card__text">{item.title}</span>
                  </div>
                </div>

              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
