/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Contact page — dark-first Tailwind, fully responsive.
*/
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const faqs = [
  { q: "How do I submit a land parcel?", a: "Log in, click 'Submit Land' in the navbar, draw the boundary on the map, fill in the ownership and land details, upload at least 3 photos, and submit." },
  { q: "How are tree species recommended?", a: "Our ML model fetches real-time temperature, rainfall, and soil moisture data from Open-Meteo APIs for your land's coordinates and recommends the best-fit native species." },
  { q: "Can I volunteer to plant on someone else's land?", a: "Yes — open any land's detail page and click 'I want to plant here'. Fill in your team size and planned date." },
  { q: "How long does land approval take?", a: "Most submissions are reviewed by fellow community members within 3–5 working days. You'll see the status change from PENDING to APPROVED on your profile." },
  { q: "Is TerraSpotter free to use?", a: "Completely free for individuals, volunteers, and NGOs. We're a community project with no paid tiers, ever." },
  { q: "Can I help organise plantation events?", a: "Absolutely — any registered user can propose and organise plantation events on approved land. Just reach out via this form and we'll walk you through it." },
];

const contacts = [
  { icon: "✉", label: "Email us",  value: "terraspotter@gmail.com",    href: "mailto:terraspotter@gmail.com" },
  { icon: "☎", label: "Call us",   value: "+91 87672 92374",           href: "tel:+918767292374" },
  { icon: "⌖", label: "Based in",  value: "Pune, Maharashtra, India", href: null },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function CountUp({ target, suffix = "" }) {
  const [display, setDisplay] = useState("—");
  useEffect(() => {
    if (target === null || target === undefined) return;
    const num = parseInt(target);
    if (isNaN(num)) { setDisplay(String(target) + suffix); return; }
    let start = 0;
    const step = 16;
    const duration = 900;
    const increment = num / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { setDisplay(num.toLocaleString() + suffix); clearInterval(timer); }
      else { setDisplay(Math.floor(start).toLocaleString() + suffix); }
    }, step);
    return () => clearInterval(timer);
  }, [target, suffix]);
  return <span>{display}</span>;
}

const inputCls = "w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`).then(r => setDbStats(r.data)).catch(() => setStatsError(true));
  }, []);

  const statTiles = dbStats ? [
    dbStats.users    != null ? { label: "Registered Users",   value: dbStats.users,    suffix: "+" } : null,
    dbStats.hectares != null ? { label: "Hectares Mapped",    value: dbStats.hectares, suffix: "+" } : null,
    dbStats.trees    != null ? { label: "Trees Planted",      value: dbStats.trees,    suffix: "+" } : null,
    dbStats.verified != null ? { label: "Verified Sites",     value: dbStats.verified, suffix: "+" } : null,
  ].filter(Boolean) : [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setSending(false);
  };

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_96", "TerraSpotter — Contact")}</title>
        <meta name="description" content="Contact TerraSpotter — reach out, FAQs, and support." />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-9 pb-28">

          {/* HERO */}
          <motion.div className="pt-16 pb-18 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-b border-border mb-18"
            variants={containerVariants} initial="hidden" animate="visible">
            <div>
              <motion.div variants={itemVariants}
                className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase mb-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {t("auto.auto_97", "Community Platform")}
              </motion.div>
              <motion.h1 variants={itemVariants}
                className="text-[clamp(36px,5vw,56px)] font-bold text-foreground leading-tight tracking-tight mb-4">
                {t("auto.auto_98", "Together, we")}<br />
                {t("auto.auto_99", "grow")} <em className="not-italic text-primary">{t("auto.auto_100", "forests")}</em>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-[15px] text-muted-foreground leading-relaxed max-w-[420px]">
                {t("auto.auto_101", "TerraSpotter is powered entirely by its users — landowners, planters, and nature lovers like you. Anyone can sign up, submit land, and join a plantation drive. No gatekeeping, just green action.")}
              </motion.p>
            </div>

            {/* Stats panel */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col gap-5">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                {t("auto.auto_102", "Our community — live from Everywhere")}
              </div>

              {!dbStats && !statsError && (
                <div className="grid grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
                </div>
              )}
              {statsError && <p className="text-[13px] text-muted-foreground text-center py-5">{t("auto.auto_103", "Could not load live stats right now.")}</p>}
              {dbStats && statTiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5">
                  {statTiles.map((s, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl px-4 py-4 flex flex-col gap-1.5 hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                      <div className="text-[30px] font-bold text-foreground leading-none">
                        <CountUp target={s.value} suffix={s.suffix} />
                      </div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gradient-to-br from-secondary to-card rounded-xl p-5 border border-border text-[13.5px] text-muted-foreground leading-relaxed">
                <strong className="text-primary font-semibold">{t("auto.auto_104", "One account, full access.")}</strong>{" "}
                {t("auto.auto_105", "Every user can submit land, volunteer at planting events, and propose drives — all under a single login. No roles, no barriers.")}
              </div>
            </motion.div>
          </motion.div>

          {/* FORM + SIDEBAR */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 mb-20"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>

            {/* FORM */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              {sent ? (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-18 h-18 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-4xl">🌿</div>
                  <h3 className="text-[22px] font-bold text-foreground">{t("auto.auto_106", "Message received!")}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[300px]">
                    {t("auto.auto_107", "Thanks for reaching out. A community member will get back to you within 24 hours.")}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-[26px] font-bold text-foreground mb-1">{t("auto.auto_108", "Send us a message")}</h2>
                  <p className="text-[13.5px] text-muted-foreground mb-7">{t("auto.auto_109", "Have a question or want to get involved? We read every message.")}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] font-bold tracking-[0.13em] uppercase text-foreground/60">
                        {t("auto.auto_110", "Your Name")} <span className="text-primary">*</span>
                      </label>
                      <input className={inputCls} placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] font-bold tracking-[0.13em] uppercase text-foreground/60">
                        {t("auto.auto_111", "Email")} <span className="text-primary">*</span>
                      </label>
                      <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[10.5px] font-bold tracking-[0.13em] uppercase text-foreground/60">{t("auto.auto_112", "What's this about?")}</label>
                    <select value={form.subject} onChange={e => set("subject", e.target.value)}
                      className={inputCls + " appearance-none cursor-pointer"}>
                      <option value="">{t("auto.auto_113", "— Choose a topic —")}</option>
                      <option value="land">{t("auto.auto_114", "I have land to submit")}</option>
                      <option value="volunteer">{t("auto.auto_115", "I want to join a plantation")}</option>
                      <option value="event">{t("auto.auto_116", "I want to organise an event")}</option>
                      <option value="ngo">{t("auto.auto_117", "NGO / Organisation partnership")}</option>
                      <option value="tech">{t("auto.auto_118", "Something isn't working")}</option>
                      <option value="other">{t("auto.auto_119", "Something else")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-5">
                    <label className="text-[10.5px] font-bold tracking-[0.13em] uppercase text-foreground/60">
                      {t("auto.auto_120", "Message")} <span className="text-primary">*</span>
                    </label>
                    <textarea className={inputCls + " resize-none min-h-[120px] leading-relaxed"}
                      placeholder="Tell us what's on your mind — the more detail, the better we can help…"
                      value={form.message} onChange={e => set("message", e.target.value)} />
                  </div>

                  <button onClick={handleSubmit} disabled={sending || !form.name || !form.email || !form.message}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed">
                    {sending ? "Sending…" : "Send Message →"}
                  </button>
                </>
              )}
            </motion.div>

            {/* SIDEBAR */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              {/* Contact info */}
              <div className="bg-card border border-border rounded-2xl p-7">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-5">{t("auto.auto_121", "Reach us directly")}</div>
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0 last:pb-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-[15px] text-primary shrink-0">{c.icon}</div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">{c.label}</div>
                      <div className="text-[13px] text-foreground font-medium">
                        {c.href ? <a href={c.href} className="text-primary hover:underline">{c.value}</a> : c.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <div className="bg-gradient-to-br from-[#0c1e11] to-[#163d25] border border-primary/10 rounded-2xl p-7">
                <div className="text-[13px] font-semibold text-white/90 mb-4">{t("auto.auto_122", "⏱ When we respond")}</div>
                {[
                  { day: "Monday – Friday", time: "9 AM – 6 PM" },
                  { day: "Saturday",        time: "10 AM – 3 PM" },
                  { day: "Sunday",          time: "Closed", closed: true },
                ].map((h, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/9 last:border-b-0 text-[13px]">
                    <span className="text-white/55">{h.day}</span>
                    <span className={`font-semibold ${h.closed ? "text-white/30 italic" : "text-white/90"}`}>{h.time}</span>
                  </div>
                ))}
              </div>

              {/* Open card */}
              <div className="bg-primary/8 border border-primary/20 rounded-2xl p-7">
                <h4 className="text-[17px] font-bold text-foreground mb-2.5">{t("auto.auto_123", "🌳 Open to Everyone")}</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{t("auto.auto_124", "Sign up as a user and you can submit land, volunteer at events, and propose plantation drives — all from one account. The community runs itself.")}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* FAQ */}
          <motion.div className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={containerVariants}>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between mb-9 gap-3">
              <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-foreground leading-tight">
                {t("auto.auto_125", "Common questions")}<br />{t("auto.auto_126", "from the community")}
              </h2>
              <p className="text-[14px] text-muted-foreground max-w-[320px] sm:text-right leading-relaxed">
                {t("auto.auto_127", "Can't find what you need? Send us a message above.")}
              </p>
            </motion.div>
            <div className="flex flex-col gap-2.5">
              {faqs.map((f, i) => (
                <motion.div key={i} variants={itemVariants}
                  className={`bg-card border rounded-2xl overflow-hidden transition-colors ${openFaq === i ? "border-primary/40" : "border-border"}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-[15px] font-semibold text-foreground cursor-pointer text-left gap-4 hover:bg-secondary/50 transition-colors">
                    <span>{f.q}</span>
                    <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-[16px] font-bold shrink-0 transition-all duration-200 ${openFaq === i ? "bg-primary text-primary-foreground border-primary rotate-45" : "bg-secondary border-border text-primary"}`}>
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="px-6 pb-5 text-[14px] text-muted-foreground leading-relaxed overflow-hidden">
                        {f.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* BOTTOM CTA */}
          <motion.div
            className="bg-gradient-to-br from-[#0c1e11] to-[#163d25] border border-primary/10 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="absolute right-[-80px] top-[-80px] w-[280px] h-[280px] rounded-full bg-radial-primary/15 pointer-events-none" />
            <div>
              <h3 className="text-[30px] font-bold text-white mb-2.5">{t("auto.auto_128", "Ready to make your mark?")}</h3>
              <p className="text-[15px] text-white/60 leading-relaxed max-w-[420px]">
                {t("auto.auto_129", "Submit a barren plot, join a planting event, or propose a drive in your area. One account is all you need.")}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap shrink-0">
              <a href="/main" className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-bold text-[14px] rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/30">
                {t("auto.auto_130", "Submit Land →")}
              </a>
              <a href="/browse" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white/85 text-[14px] font-medium rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/35 transition-all">
                {t("auto.auto_131", "Browse Sites")}
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}