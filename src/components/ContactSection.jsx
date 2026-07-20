import { useEffect, useRef, useState } from 'react';
import '../style/Contact.css';
import api from '../api'

const DEFAULT_SOCIALS = [
  {
    name: "Instagram",
    icon: "instagram",
    color: "E4405F",
    url: "https://instagram.com/prabinn.__",
  },
{
    name: "GitHub",
    icon: "github",
    color: "F5F1EA",
    url: "https://github.com/prabin-fullstack",
  },
  {
    name: "WhatsApp",
    icon: "whatsapp",
    color: "25D366",
    url: "https://wa.me/917994809308",
  },
];

function useReveal() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function SocialIcon({ icon, color, name }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="contact__social-fallback">{name[0]}</span>;
  return (
    <img
      className="contact__social-img"
      src={`https://cdn.simpleicons.org/${icon}/${color}`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <a
      className="contact__email"
      href={`mailto:${email}`}
      onClick={handleCopy}
      aria-label={`Copy email address ${email}`}
    >
      {email}
      <span className={`contact__email-copied ${copied ? 'is-shown' : ''}`} aria-hidden="true">
        Copied
      </span>
    </a>
  );
}

const FIELDS = [
  { id: 'name', label: 'Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'subject', label: 'Subject', type: 'text', required: false },
];

export default function ContactSection({
  eyebrow = 'Say hello — 2026',
  heading = 'Contact',
  intro =
    'Have a project in mind, or just want to talk shop? My inbox is ' +
    'always open \u2014 I read and reply to everything myself.',
  email = 'prabin.official007@gmail.com',
  location = 'Based in Kerala, IN \u00b7 Working worldwide',
  socials = DEFAULT_SOCIALS,
  onSubmit,
}) {
  const [sectionRef, visible] = useReveal();
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Tell me your name';
    if (!values.email.trim()) {
      next.email = 'Need an email to reply to';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "That doesn't look like a valid email";
    }
    if (!values.message.trim()) next.message = "Don't forget the message";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("sending");

    try {
      await api.post("/messages/", values);

      setStatus("sent");
      setValues({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.log(error.response?.data);
      setStatus("error");
    }
  };

  return (
    <section className={`contact ${visible ? 'is-in' : ''}`} ref={sectionRef} id="contact">
      <div className="contact__inner">
        {/* Left: identity rail */}
        <div className="contact__rail">
          <p className="contact__eyebrow contact__reveal" style={{ '--d': '0ms' }}>
            <span className="contact__dot" aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 className="contact__heading contact__reveal" style={{ '--d': '90ms' }}>
            {heading}
          </h2>

          <p className="contact__intro contact__reveal" style={{ '--d': '160ms' }}>
            {intro}
          </p>

          <div className="contact__reveal" style={{ '--d': '220ms' }}>
            <CopyEmail email={email} />
          </div>

          <p className="contact__location contact__reveal" style={{ '--d': '260ms' }}>
            {location}
          </p>

          <ul className="contact__socials contact__reveal" style={{ '--d': '320ms' }}>
            {socials.map((s) => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                  <SocialIcon icon={s.icon} color={s.color} name={s.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <form className="contact__form" onSubmit={handleSubmit} noValidate>
          {FIELDS.map((field, i) => (
            <div
              className="contact__field contact__reveal"
              style={{ '--d': `${260 + i * 70}ms` }}
              key={field.id}
            >
              <label htmlFor={`contact-${field.id}`}>
                {field.label}
                {field.required && <span className="contact__required">*</span>}
              </label>
              <input
                id={`contact-${field.id}`}
                type={field.type}
                value={values[field.id]}
                onChange={handleChange(field.id)}
                aria-invalid={Boolean(errors[field.id])}
                aria-describedby={errors[field.id] ? `contact-${field.id}-error` : undefined}
              />
              {errors[field.id] && (
                <span className="contact__error" id={`contact-${field.id}-error`}>
                  {errors[field.id]}
                </span>
              )}
            </div>
          ))}

          <div className="contact__field contact__reveal" style={{ '--d': '470ms' }}>
            <label htmlFor="contact-message">
              Message<span className="contact__required">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={5}
              value={values.message}
              onChange={handleChange('message')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
            {errors.message && (
              <span className="contact__error" id="contact-message-error">
                {errors.message}
              </span>
            )}
          </div>

          <div className="contact__submit-row contact__reveal" style={{ '--d': '540ms' }}>
            <button type="submit" className="contact__submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
              <span aria-hidden="true">&#8594;</span>
            </button>

            <span className={`contact__status contact__status--${status}`} role="status">
              {status === 'sent' && "Sent — I'll get back to you soon."}
              {status === 'error' && 'Something went wrong, please try again.'}
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}