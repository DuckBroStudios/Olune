/**
 * ============================================================
 *  CLIENT INTAKE FORM — private website project request form
 * ============================================================
 *
 *  ONE-LINE SETUP:
 *  1. Sign up at https://formspree.io, create a form.
 *  2. Copy your endpoint (looks like https://formspree.io/f/abcd).
 *  3. Paste it into the FORMSPREE_ENDPOINT constant below.
 *  4. Submit the form once yourself — Formspree will email you a
 *     confirmation link the first time. Click it. Done.
 *
 *  ============================================================
 *  HOW SUBMISSIONS REACH YOU
 *  ============================================================
 *  Every submission becomes an email in the inbox you signed up
 *  with. The labelled `text` field is the email body. The other
 *  fields (firstName, phone, etc.) are also sent as structured
 *  data so Formspree can show them nicely in its dashboard.
 *
 *  ============================================================
 *  IF YOU WANT A DIFFERENT BACKEND LATER
 *  ============================================================
 *  The `payload` object built inside handleSubmit is generic —
 *  it works with any service that accepts a JSON POST. Two
 *  drop-in alternatives:
 *
 *  -- Web3Forms (free, just an access key) --------------------
 *     await fetch("https://api.web3forms.com/submit", {
 *       method:  "POST",
 *       headers: { "Content-Type": "application/json",
 *                  "Accept":       "application/json" },
 *       body:    JSON.stringify({ access_key: "YOUR_KEY",
 *                                 subject: "New project request",
 *                                 ...payload }),
 *     });
 *
 *  -- Resend (production-grade, needs a tiny server) ----------
 *     Create a serverless route at e.g. /api/intake on Vercel
 *     that calls Resend with your secret API key, then:
 *
 *     await fetch("/api/intake", {
 *       method:  "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body:    JSON.stringify(payload),
 *     });
 *
 *  Never put a Resend API key in client code — it would be
 *  visible to anyone who views the page source.
 *
 *  ============================================================
 *  TESTING
 *  ============================================================
 *  Inside the Claude artifact preview, the fetch will fail
 *  silently (the sandbox blocks outside requests). That's
 *  expected. Real testing happens on your local machine after
 *  you run `npm create vite@latest`, paste this file in, and
 *  run `npm run dev`. See the conversation for full steps.
 * ============================================================
 */

import React, { useState, useMemo } from 'react';

// 👇 Brand name — change here to update the headline everywhere.
const NAME = 'Olune';

// 👇 Paste your Formspree endpoint here. Leave as-is to test
//    the form UI without actually sending anything.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqejkvon';

export default function App() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    howKnow: '',
    websiteFor: '',
    domain: '',
    deadline: '',
    anythingElse: '',
    _honey: '', // honeypot — must stay empty
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // null | "ok" | "failed"

  // -------- validation --------
  const isValidUKMobile = (raw) => {
    const cleaned = raw.replace(/[\s\-()]/g, '');
    return /^(?:\+44|0)7\d{9}$/.test(cleaned);
  };

  const validate = (state) => {
    const e = {};
    if (!state.firstName.trim()) e.firstName = 'Please add your first name.';
    if (!state.lastName.trim()) e.lastName = 'Please add your last name.';
    if (!state.phone.trim()) {
      // phone is optional — no error if empty
    } else if (!isValidUKMobile(state.phone))
      e.phone = "That doesn't look like a UK mobile. Try 07XXX XXXXXX.";
    if (!state.howKnow.trim())
      e.howKnow = 'A few words is fine — just so I know who you are.';
    if (!state.websiteFor.trim())
      e.websiteFor = 'Tell me a little about the site.';
    if (!state.domain.trim())
      e.domain = "A domain (or one you'd like) helps me plan.";
    if (!state.deadline) e.deadline = "Pick a date you'd like it done by.";
    return e;
  };

  const requiredFilled = useMemo(() => {
    const r = [
      'firstName',
      'lastName',
      'howKnow',
      'websiteFor',
      'domain',
      'deadline',
    ];
    return r.every((k) => form[k] && String(form[k]).trim());
  }, [form]);

  const update = (key, val) => {
    const next = { ...form, [key]: val };
    setForm(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key) => {
    setTouched((p) => ({ ...p, [key]: true }));
    setErrors(validate(form));
  };

  const formatDeadline = (iso) => {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Honeypot triggered → silently "accept" but do not produce a real
    // submission text or send anything. A real bot just sees success.
    if (form._honey) {
      setSubmissionText(
        '[honeypot triggered — this submission would be silently dropped in production. No email would be sent.]'
      );
      setSendStatus('ok');
      setSubmitted(true);
      return;
    }

    const e = validate(form);
    setErrors(e);
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      howKnow: true,
      websiteFor: true,
      domain: true,
      deadline: true,
    });
    if (Object.keys(e).length > 0) return;

    const now = new Date();
    const ts = now.toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const text = `WEBSITE PROJECT REQUEST
 Submitted: ${ts}
 
 Name:               ${form.firstName} ${form.lastName}
 Phone:              ${form.phone.trim() || '(not provided)'}
 How they know me:   ${form.howKnow}
 Deadline:           ${formatDeadline(form.deadline)}
 Domain:             ${form.domain}
 
 What the site is for:
 ${form.websiteFor.trim()}
 
 Anything else:
 ${form.anythingElse.trim() || '(nothing added)'}`;

    const payload = {
      text,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone.trim() || '(not provided)',
      howKnow: form.howKnow,
      websiteFor: form.websiteFor,
      domain: form.domain,
      deadline: form.deadline,
      anythingElse: form.anythingElse,
      submittedAt: now.toISOString(),
    };

    setSubmissionText(text);
    setSubmitting(true);

    // If the endpoint is still the placeholder, skip the fetch — we're
    // either previewing in the artifact or developing locally without
    // a real Formspree form yet. The user still sees the confirmation
    // screen and the copyable preview, but we mark sendStatus as failed
    // so it's obvious nothing was actually sent.
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      setSendStatus('failed');
      setSubmitting(false);
      setSubmitted(true);
      return;
    }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      setSendStatus(res.ok ? 'ok' : 'failed');
    } catch (err) {
      console.error('Submission failed:', err);
      setSendStatus('failed');
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(submissionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.getElementById('submission-text');
      if (ta) {
        ta.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    }
  };

  return (
    <div className="intake-root min-h-screen w-full text-white relative overflow-hidden">
      <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Nunito:wght@400;500;600;700&display=swap');
 
         .intake-root {
           background-color: #000;
           background-image: radial-gradient(rgba(255,255,255,0.55) 1.2px, transparent 1.2px);
           background-size: 24px 24px;
           font-family: 'Nunito', ui-rounded, -apple-system, system-ui, sans-serif;
           font-weight: 500;
         }
         .intake-root::before {
           content: '';
           position: absolute;
           inset: 0;
           background: radial-gradient(ellipse at 50% 35%, transparent 0%, transparent 40%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.95) 100%);
           pointer-events: none;
           z-index: 0;
         }
         .display {
           font-family: 'Fraunces', Georgia, serif;
           font-optical-sizing: auto;
           letter-spacing: -0.015em;
         }
         .glow {
           text-shadow: 0 0 22px rgba(255,255,255,0.35), 0 0 60px rgba(255,255,255,0.18);
         }
         .glow-soft {
           text-shadow: 0 0 16px rgba(255,255,255,0.22);
         }
         .field-input {
           width: 100%;
           background-color: #0d0d0d;
           border: 1px solid rgba(255,255,255,0.28);
           border-radius: 1rem;
           padding: 1rem 1.25rem;
           color: #fff;
           font-family: inherit;
           font-size: 1rem;
           font-weight: 500;
           transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
           outline: none;
         }
         .field-input::placeholder { color: rgba(255,255,255,0.32); }
         .field-input:hover {
           background-color: #131313;
           border-color: rgba(255,255,255,0.42);
         }
         .field-input:focus {
           border-color: rgba(255,255,255,0.65);
           box-shadow: 0 0 0 4px rgba(255,255,255,0.10);
           background-color: #131313;
         }
         .field-input[aria-invalid="true"] {
           border-color: rgba(255, 150, 150, 0.55);
         }
         .field-input[aria-invalid="true"]:focus {
           box-shadow: 0 0 0 4px rgba(255, 150, 150, 0.12);
         }
         textarea.field-input { resize: vertical; min-height: 6.5rem; line-height: 1.55; }
         input[type=date].field-input { color-scheme: dark; }
         input[type=date]::-webkit-calendar-picker-indicator {
           filter: invert(1) opacity(0.55);
           cursor: pointer;
         }
         .btn-submit {
           width: 100%;
           border-radius: 1rem;
           padding: 1.15rem 1.5rem;
           font-family: inherit;
           font-size: 1.1rem;
           font-weight: 700;
           letter-spacing: 0.01em;
           transition: transform .25s ease, box-shadow .35s ease, background-color .25s ease, color .25s ease;
           cursor: pointer;
           border: none;
         }
         .btn-submit-active {
           background: #fff;
           color: #000;
           box-shadow: 0 0 36px rgba(255,255,255,0.32), 0 0 80px rgba(255,255,255,0.14);
         }
         .btn-submit-active:hover {
           transform: translateY(-1px);
           box-shadow: 0 0 50px rgba(255,255,255,0.5), 0 0 110px rgba(255,255,255,0.22);
         }
         .btn-submit-active:active { transform: translateY(0); }
         .btn-submit-disabled {
           background: rgba(255,255,255,0.06);
           color: rgba(255,255,255,0.4);
           cursor: not-allowed;
           border: 1px solid rgba(255,255,255,0.08);
         }
         .btn-copy {
           background: #fff;
           color: #000;
           border: none;
           border-radius: 0.75rem;
           padding: 0.55rem 1rem;
           font-family: inherit;
           font-weight: 700;
           font-size: 0.875rem;
           cursor: pointer;
           transition: transform .2s ease, box-shadow .2s ease;
         }
         .btn-copy:hover {
           transform: translateY(-1px);
           box-shadow: 0 0 20px rgba(255,255,255,0.3);
         }
         .field-error { color: #ffb4b4; }
         .preview-box {
           background: #0d0d0d;
           border: 1px solid rgba(255,255,255,0.28);
           border-radius: 0.85rem;
           padding: 1rem 1.15rem;
           font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
           font-size: 0.875rem;
           line-height: 1.65;
           color: rgba(255,255,255,0.88);
           min-height: 280px;
           width: 100%;
           resize: vertical;
         }
         .preview-box:focus {
           outline: none;
           box-shadow: 0 0 0 3px rgba(255,255,255,0.15);
         }
         .honeypot {
           position: absolute !important;
           left: -9999px !important;
           top: -9999px !important;
           width: 1px !important;
           height: 1px !important;
           overflow: hidden !important;
           opacity: 0 !important;
         }
       `}</style>

      <div className="relative z-10 mx-auto max-w-2xl px-6 sm:px-8 pt-20 sm:pt-28 pb-16">
        {/* ---------- HERO ---------- */}
        <header className="text-center mb-16 sm:mb-20">
          <h1 className="display glow text-5xl sm:text-7xl font-medium leading-[1.02]">
            {NAME}
          </h1>
          <p className="display text-white/75 text-2xl sm:text-3xl mt-4 sm:mt-5 font-normal italic glow-soft">
            Custom websites, built for you.
          </p>
          <p className="mt-9 sm:mt-10 text-white/75 text-lg sm:text-xl leading-relaxed glow-soft">
            Tell me what you want built. I'll text or call you with a price.
          </p>
        </header>

        {/* ---------- FORM or CONFIRMATION ---------- */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-7" noValidate>
            {/* Honeypot — hidden from humans */}
            <div className="honeypot" aria-hidden="true">
              <label>
                Don't fill this out if you're human:
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form._honey}
                  onChange={(e) => update('_honey', e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="First name"
                error={errors.firstName}
                touched={touched.firstName}
              >
                <input
                  className="field-input"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  onBlur={() => blur('firstName')}
                  autoComplete="given-name"
                  aria-invalid={!!(errors.firstName && touched.firstName)}
                />
              </Field>
              <Field
                label="Last name"
                error={errors.lastName}
                touched={touched.lastName}
              >
                <input
                  className="field-input"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  onBlur={() => blur('lastName')}
                  autoComplete="family-name"
                  aria-invalid={!!(errors.lastName && touched.lastName)}
                />
              </Field>
            </div>

            <Field
              label="Phone number"
              hint="UK mobile, e.g. 07712 345678"
              optional
              error={errors.phone}
              touched={touched.phone}
            >
              <input
                className="field-input"
                type="tel"
                inputMode="tel"
                placeholder="07XXX XXXXXX"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                onBlur={() => blur('phone')}
                autoComplete="tel"
                aria-invalid={!!(errors.phone && touched.phone)}
              />
            </Field>

            <Field
              label="How do you know me?"
              error={errors.howKnow}
              touched={touched.howKnow}
            >
              <input
                className="field-input"
                placeholder="e.g. neighbour, friend of mum"
                value={form.howKnow}
                onChange={(e) => update('howKnow', e.target.value)}
                onBlur={() => blur('howKnow')}
                aria-invalid={!!(errors.howKnow && touched.howKnow)}
              />
            </Field>

            <Field
              label="What's the website for?"
              error={errors.websiteFor}
              touched={touched.websiteFor}
            >
              <textarea
                rows={5}
                className="field-input"
                placeholder="What's the idea? Who is it for? What should it do?"
                value={form.websiteFor}
                onChange={(e) => update('websiteFor', e.target.value)}
                onBlur={() => blur('websiteFor')}
                aria-invalid={!!(errors.websiteFor && touched.websiteFor)}
              />
            </Field>

            <Field
              label="Domain you want"
              hint="If you don't have one yet, just write what you'd like it to be."
              error={errors.domain}
              touched={touched.domain}
            >
              <input
                className="field-input"
                placeholder="yourwebsite.com"
                value={form.domain}
                onChange={(e) => update('domain', e.target.value)}
                onBlur={() => blur('domain')}
                aria-invalid={!!(errors.domain && touched.domain)}
              />
            </Field>

            <Field
              label="Deadline"
              hint="When do you need it done by?"
              error={errors.deadline}
              touched={touched.deadline}
            >
              <input
                className="field-input"
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
                onBlur={() => blur('deadline')}
                aria-invalid={!!(errors.deadline && touched.deadline)}
              />
            </Field>

            <Field label="Anything else?" optional>
              <textarea
                rows={3}
                className="field-input"
                placeholder="Optional — anything else I should know."
                value={form.anythingElse}
                onChange={(e) => update('anythingElse', e.target.value)}
              />
            </Field>

            <div className="pt-3">
              <button
                type="submit"
                disabled={!requiredFilled || submitting}
                className={
                  'btn-submit ' +
                  (requiredFilled && !submitting
                    ? 'btn-submit-active'
                    : 'btn-submit-disabled')
                }
              >
                {submitting
                  ? 'Sending…'
                  : requiredFilled
                  ? 'Send my project →'
                  : 'Fill in the form to send'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-10">
            <div className="text-center py-6 sm:py-10">
              {sendStatus === 'ok' ? (
                <>
                  <div className="display glow text-5xl sm:text-6xl font-medium mb-4">
                    Got it!
                  </div>
                  <p className="text-white/75 text-lg sm:text-xl glow-soft leading-relaxed">
                    I'll be in touch within a few days.
                  </p>
                </>
              ) : (
                <>
                  <div className="display text-5xl sm:text-6xl font-medium mb-4 text-white/90">
                    Almost there
                  </div>
                  <p className="text-white/75 text-lg sm:text-xl leading-relaxed max-w-md mx-auto">
                    Something went wrong sending your message. Copy the text
                    below and email it to me directly — I'll come back to you
                    the same way.
                  </p>
                </>
              )}
            </div>

            <div
              style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
              }}
              className="sm:!p-8"
            >
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <span className="text-white/45 text-xs uppercase tracking-[0.22em] font-semibold">
                  {sendStatus === 'ok'
                    ? 'Submission preview'
                    : 'Your submission'}
                </span>
                <button onClick={copy} className="btn-copy">
                  {copied ? 'Copied ✓' : 'Copy to clipboard'}
                </button>
              </div>
              <textarea
                id="submission-text"
                readOnly
                value={submissionText}
                className="preview-box"
              />
              {sendStatus === 'ok' ? (
                <p className="text-white/40 text-xs sm:text-sm mt-3 leading-relaxed">
                  This preview shows the exact shape of what just got sent to my
                  inbox.
                </p>
              ) : (
                <p className="text-white/55 text-xs sm:text-sm mt-3 leading-relaxed">
                  Tap "Copy to clipboard," then paste it into an email to me.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------- FOOTER ---------- */}
        <footer className="mt-20 text-center">
          <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto">
            Your details are only used by me to contact you about your website.
            Not shared with anyone.
          </p>
        </footer>
      </div>
    </div>
  );
}

// -------- Reusable label + error wrapper --------
function Field({ label, hint, optional, error, touched, children }) {
  const showError = error && touched;
  return (
    <label className="block">
      <div className="mb-2">
        <span className="text-white/90 font-semibold text-base sm:text-[1.05rem] glow-soft">
          {label}{' '}
          {optional && (
            <span className="text-white/40 font-normal text-sm">
              (optional)
            </span>
          )}
        </span>
      </div>
      {hint && (
        <p className="text-white/45 text-sm mb-2 leading-relaxed">{hint}</p>
      )}
      {children}
      {showError && (
        <p className="mt-2 text-sm field-error leading-relaxed">{error}</p>
      )}
    </label>
  );
}
