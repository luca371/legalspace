import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi';

// Endpoint Formspree — înlocuiește cu cel real, generat din dashboard-ul tău
// (formspree.io -> New Form -> trimite la lserban2603@gmail.com). Primul
// submit declanșează un email de confirmare către acea adresă; formularul
// nu livrează nimic până când linkul din acel email e confirmat.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwvdvpza';

const content = {
  en: {
    back: 'Back to home',
    eyebrow: 'Book a discovery call',
    title: "Let's talk about your contracts",
    sub: 'Tell us a bit about your team and what you need - we\'ll get back to you to schedule a 30-minute call.',
    fullName: 'Full name',
    company: 'Company name',
    email: 'Email address',
    description: 'What would you like to discuss?',
    descriptionPlaceholder: 'A few words about your current contract process, team size, or what prompted you to reach out...',
    submit: 'Send',
    submitting: 'Sending...',
    successTitle: 'Message sent',
    successBody: "Thanks — we'll get back to you shortly to schedule your call.",
    errorBody: 'Something went wrong. Please try again, or email us directly.',
  },
};

export default function BookACall() {
  const t = content.en;
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [formData, setFormData] = useState({
    fullName: '', company: '', email: '', description: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(e.target),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="book-call-page">
        <div className="book-call-card book-call-card--success">
          <HiOutlineCheckCircle size={48} color="#3e66ea" />
          <h1>{t.successTitle}</h1>
          <p>{t.successBody}</p>
          <Link to="/" className="btn-primary">
            <HiOutlineArrowLeft style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-call-page">
      <div className="book-call-card">
        <Link to="/" className="book-call-back">
          <HiOutlineArrowLeft size={16} /> {t.back}
        </Link>
        <span className="section-eyebrow">{t.eyebrow}</span>
        <h1 className="book-call-title">{t.title}</h1>
        <p className="book-call-sub">{t.sub}</p>

        <form className="book-call-form" onSubmit={handleSubmit}>
          <div className="book-call-field">
            <label htmlFor="fullName">{t.fullName}</label>
            <input
              id="fullName" name="fullName" type="text" required
              value={formData.fullName} onChange={handleChange}
            />
          </div>
          <div className="book-call-field">
            <label htmlFor="company">{t.company}</label>
            <input
              id="company" name="company" type="text" required
              value={formData.company} onChange={handleChange}
            />
          </div>
          <div className="book-call-field">
            <label htmlFor="email">{t.email}</label>
            <input
              id="email" name="email" type="email" required
              value={formData.email} onChange={handleChange}
            />
          </div>
          <div className="book-call-field">
            <label htmlFor="description">{t.description}</label>
            <textarea
              id="description" name="description" rows={4}
              placeholder={t.descriptionPlaceholder}
              value={formData.description} onChange={handleChange}
            />
          </div>

          {status === 'error' && (
            <p className="book-call-error">{t.errorBody}</p>
          )}

          <button type="submit" className="btn-primary book-call-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}