import { useState } from "react";
import { motion } from "framer-motion";

const faqs = [
  { q: "How do I submit a land parcel?", a: "Log in, click 'Submit Land' in the navbar, draw the boundary on the map, fill in the ownership and land details, upload at least 3 photos, and submit." },
  { q: "How are tree species recommended?", a: "Our ML model fetches real-time temperature, rainfall, and soil moisture data from Open-Meteo APIs for your land's coordinates and recommends the best-fit native species." },
  { q: "Can I volunteer to plant on someone else's land?", a: "Yes — open any land's detail page and click 'I want to plant here'. Fill in your team size and planned date and the coordinator will be notified." },
  { q: "How long does land approval take?", a: "Most submissions are reviewed within 3–5 working days. You'll see the status change from PENDING to APPROVED on your profile page." },
  { q: "Is TerraSpotter free to use?", a: "Completely free for individuals, volunteers, and NGOs. We're a community project with no paid tiers." },
];

const contacts = [
  { icon: "📧", label: "Email",    value: "hello@terraspotter.in",   href: "mailto:hello@terraspotter.in" },
  { icon: "📞", label: "Phone",    value: "+91 99215 26128",          href: "tel:+919921526128" },
  { icon: "📍", label: "Location", value: "Latur, Maharashtra, India", href: null },
];

export default function Contact() {
  const [form, setForm]       = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    // TODO: POST /api/contact
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setSending(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0d3320; --canopy:#1a5c38; --leaf:#2d8a55; --sprout:#4db87a;
          --mist:#e8f5ee; --sand:#f7f3ee; --ink:#1a1a1a; --smoke:#6b7280;
          --line:#e2e8f0; --white:#ffffff;
          --sh:0 2px 16px rgba(13,51,32,0.08);
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }

        .ct-page { max-width:1100px;margin:0 auto;padding:64px 36px 100px; }

        /* hero */
        .ct-hero { text-align:center;margin-bottom:64px; }
        .ct-hero-tag { display:inline-flex;align-items:center;gap:6px;background:var(--mist);color:var(--canopy);border-radius:20px;padding:5px 14px;font-size:12.5px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;margin-bottom:18px; }
        .ct-hero h1 { font-family:'Fraunces',serif;font-size:48px;font-weight:600;color:var(--forest);letter-spacing:-.5px;line-height:1.1;margin-bottom:14px; }
        .ct-hero p { font-size:16px;color:var(--smoke);line-height:1.7;max-width:520px;margin:0 auto; }

        /* grid */
        .ct-grid { display:grid;grid-template-columns:1fr 400px;gap:32px;align-items:start;margin-bottom:64px; }

        /* form */
        .ct-form-card { background:var(--white);border-radius:18px;border:1px solid var(--line);padding:36px;box-shadow:var(--sh); }
        .ct-form-title { font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:var(--forest);margin-bottom:4px; }
        .ct-form-sub { font-size:13.5px;color:var(--smoke);margin-bottom:24px; }
        .ct-form-row { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        .ct-field { display:flex;flex-direction:column;gap:6px;margin-bottom:14px; }
        .ct-label { font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#4a5e52; }
        .ct-req { color:#c0392b; }
        .ct-input, .ct-select, .ct-textarea {
          padding:11px 14px;border:1.5px solid var(--line);border-radius:9px;
          font-family:'DM Sans',sans-serif;font-size:14px;
          background:#fff;color:var(--ink);outline:none;
          transition:border-color .2s,box-shadow .2s;width:100%;
        }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color:var(--leaf);box-shadow:0 0 0 3px rgba(45,138,85,.1);
        }
        .ct-select { appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a72' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px; }
        .ct-textarea { resize:none;min-height:110px;line-height:1.55; }
        .ct-submit {
          width:100%;padding:13px;background:var(--forest);color:white;border:none;
          border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14.5px;
          font-weight:600;cursor:pointer;transition:background .15s;margin-top:4px;
        }
        .ct-submit:hover:not(:disabled) { background:var(--canopy); }
        .ct-submit:disabled { opacity:.5;cursor:not-allowed; }
        .ct-success { text-align:center;padding:32px 16px; }
        .ct-success-icon { font-size:44px;margin-bottom:12px; }
        .ct-success h3 { font-family:'Fraunces',serif;font-size:20px;color:var(--forest);margin-bottom:6px; }
        .ct-success p { font-size:13.5px;color:var(--smoke); }

        /* sidebar */
        .ct-sidebar { display:flex;flex-direction:column;gap:16px; }

        .ct-info-card { background:var(--white);border-radius:14px;border:1px solid var(--line);padding:24px;box-shadow:var(--sh); }
        .ct-info-title { font-size:14px;font-weight:600;color:var(--forest);margin-bottom:16px; }
        .ct-contact-item { display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #f3f3f1; }
        .ct-contact-item:last-child { border-bottom:none; }
        .ct-contact-icon { width:36px;height:36px;border-radius:8px;background:var(--mist);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0; }
        .ct-contact-label { font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--smoke); }
        .ct-contact-val { font-size:13.5px;color:var(--ink);font-weight:500;margin-top:2px; }
        .ct-contact-val a { color:var(--leaf);text-decoration:none; }
        .ct-contact-val a:hover { text-decoration:underline; }

        .ct-hours-card { background:linear-gradient(135deg,#0d3320,#1a5c38);border-radius:14px;padding:24px; }
        .ct-hours-title { font-size:14px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:14px; }
        .ct-hours-row { display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.1); }
        .ct-hours-row:last-child { border-bottom:none; }
        .ct-hours-day { color:rgba(255,255,255,.65); }
        .ct-hours-time { color:rgba(255,255,255,.9);font-weight:500; }

        /* FAQ */
        .ct-faq-section { margin-bottom:64px; }
        .ct-faq-title { font-family:'Fraunces',serif;font-size:32px;font-weight:600;color:var(--forest);letter-spacing:-.3px;margin-bottom:8px; }
        .ct-faq-sub { font-size:14px;color:var(--smoke);margin-bottom:28px; }
        .ct-faq-list { display:flex;flex-direction:column;gap:10px; }
        .ct-faq-item { background:var(--white);border-radius:12px;border:1px solid var(--line);overflow:hidden;box-shadow:var(--sh); }
        .ct-faq-q {
          width:100%;display:flex;align-items:center;justify-content:space-between;
          padding:18px 20px;background:none;border:none;font-family:'DM Sans',sans-serif;
          font-size:14.5px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left;
          gap:12px;transition:background .15s;
        }
        .ct-faq-q:hover { background:#fafafa; }
        .ct-faq-icon { font-size:18px;color:var(--leaf);flex-shrink:0;transition:transform .2s; }
        .ct-faq-icon.open { transform:rotate(45deg); }
        .ct-faq-a { padding:0 20px 18px;font-size:13.5px;color:var(--smoke);line-height:1.7; }

        @media(max-width:768px){
          .ct-page { padding:36px 16px 60px; }
          .ct-hero h1 { font-size:32px; }
          .ct-grid { grid-template-columns:1fr; }
          .ct-form-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="ct-page">

        {/* hero */}
        <motion.div className="ct-hero"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}>
          <div className="ct-hero-tag">📬 Get in Touch</div>
          <h1>We'd love to<br />hear from you</h1>
          <p>Have a land to report, a question about planting, or just want to collaborate? Reach out — we respond within 24 hours.</p>
        </motion.div>

        {/* form + sidebar */}
        <motion.div className="ct-grid"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.1 }}>

          {/* form */}
          <div className="ct-form-card">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-icon">🌿</div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="ct-form-title">Send us a message</div>
                <div className="ct-form-sub">Fill in the form and we'll respond as soon as possible.</div>

                <div className="ct-form-row">
                  <div className="ct-field">
                    <label className="ct-label">Name <span className="ct-req">*</span></label>
                    <input className="ct-input" placeholder="Your full name"
                      value={form.name} onChange={e => set("name", e.target.value)} />
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Email <span className="ct-req">*</span></label>
                    <input className="ct-input" type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => set("email", e.target.value)} />
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Subject</label>
                  <select className="ct-select" value={form.subject} onChange={e => set("subject", e.target.value)}>
                    <option value="">— Select a topic —</option>
                    <option value="land">Report / Submit a Land</option>
                    <option value="volunteer">Volunteer Inquiry</option>
                    <option value="ngo">NGO / Organisation Partnership</option>
                    <option value="tech">Technical Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Message <span className="ct-req">*</span></label>
                  <textarea className="ct-textarea"
                    placeholder="Tell us what's on your mind…"
                    value={form.message} onChange={e => set("message", e.target.value)} />
                </div>

                <button className="ct-submit"
                  onClick={handleSubmit}
                  disabled={sending || !form.name || !form.email || !form.message}>
                  {sending ? "Sending…" : "Send Message →"}
                </button>
              </>
            )}
          </div>

          {/* sidebar */}
          <div className="ct-sidebar">
            <div className="ct-info-card">
              <div className="ct-info-title">Contact Details</div>
              {contacts.map((c, i) => (
                <div key={i} className="ct-contact-item">
                  <div className="ct-contact-icon">{c.icon}</div>
                  <div>
                    <div className="ct-contact-label">{c.label}</div>
                    <div className="ct-contact-val">
                      {c.href ? <a href={c.href}>{c.value}</a> : c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-hours-card">
              <div className="ct-hours-title">⏰ Response Hours</div>
              {[
                { day:"Monday – Friday", time:"9 AM – 6 PM" },
                { day:"Saturday",        time:"10 AM – 3 PM" },
                { day:"Sunday",          time:"Closed" },
              ].map((h, i) => (
                <div key={i} className="ct-hours-row">
                  <span className="ct-hours-day">{h.day}</span>
                  <span className="ct-hours-time">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div className="ct-faq-section"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.18 }}>
          <div className="ct-faq-title">Frequently Asked Questions</div>
          <div className="ct-faq-sub">Quick answers to the most common questions.</div>
          <div className="ct-faq-list">
            {faqs.map((f, i) => (
              <div key={i} className="ct-faq-item">
                <button className="ct-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`ct-faq-icon${openFaq === i ? " open" : ""}`}>+</span>
                </button>
                {openFaq === i && <div className="ct-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </>
  );
}