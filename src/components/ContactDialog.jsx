import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { site } from '../content';

const ContactDialog = forwardRef(function ContactDialog(_, ref) {
  const dialog = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const contactEmail = site.contact.email;

  useImperativeHandle(ref, () => ({
    open() {
      dialog.current?.showModal();
      setStatus(null);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setStatus(null);
    
    const formData = new FormData();
    formData.append("access_key", "dda370c4-dc0b-4258-8c43-eb1870b09978");
    formData.append("name", name);
    formData.append("email", email);
    if (phone) formData.append("phone", phone);
    formData.append("message", message);
    formData.append("subject", `رسالة من الموقع (الشكاوي والاقتراحات) - ${name}`);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          setStatus(null);
          dialog.current?.close();
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialog} className="contact-dialog" closedby="any" aria-labelledby="contact-dialog-title">
      <div className="contact-dialog__head">
        <div>
          <h2 id="contact-dialog-title">تواصل معنا</h2>
          <p>للشكاوي والاقتراحات، يُسعدنا تواصلكم.</p>
        </div>
        <button type="button" className="contact-dialog__close" onClick={() => dialog.current?.close()}>
          ✕
        </button>
      </div>

      <div className="contact-dialog__body">
        <div className="contact-dialog__email-copy">
          <span>البريد الإلكتروني:</span>
          <button type="button" onClick={handleCopy} className="copy-btn" aria-label="نسخ البريد الإلكتروني">
            <span dir="ltr">{contactEmail}</span>
            <span className="copy-icon" aria-hidden="true">
              {copied ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </span>
          </button>
        </div>

        <hr className="contact-dialog__divider" />

        <form onSubmit={handleSubmit} className="contact-form">

          <div className="form-group">
            <label htmlFor="c-name">الاسم <span className="req">*</span></label>
            <input 
              id="c-name" 
              name="name"
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="اسمك الكريم" 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="c-email">بريدك الإلكتروني <span className="req">*</span></label>
            <input 
              id="c-email" 
              name="email"
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="example@mail.com" 
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label htmlFor="c-phone">رقم الجوال <span className="optional">(لو حابب)</span></label>
            <input 
              id="c-phone" 
              name="phone"
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="05xxxxxxx" 
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label htmlFor="c-message">الرسالة أو الاقتراح <span className="req">*</span></label>
            <textarea 
              id="c-message" 
              name="message"
              required 
              rows="4" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="اكتب رسالتك هنا..."
            />
          </div>

          <button type="submit" className="contact-submit-btn" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
          
          {status === 'success' && (
            <p className="contact-status success">
              تم الإرسال بنجاح!
            </p>
          )}
          {status === 'error' && (
            <p className="contact-status error">
              حدث خطأ أثناء الإرسال. الرجاء المحاولة لاحقاً.
            </p>
          )}
        </form>
      </div>
    </dialog>
  );
});

export default ContactDialog;
