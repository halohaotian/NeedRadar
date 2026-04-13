"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ────────── Shared Styles ────────── */
const css = (cls: string) => cls; // just for readability

/* ────────── Data ────────── */
const FAQ_DATA = [
  {
    q: "What exactly does NeedRadar do?",
    a: "NeedRadar collects user reviews from 8+ app stores, uses AI (LLM) to deeply analyze each review, extracts pain points and feature requests, clusters them, and ranks them by business impact. The output is a prioritized list of 'what to build next' — with data to back every recommendation.",
  },
  {
    q: "How is this different from AppFollow, Appbot, or AppTweak?",
    a: "Those tools focus on sentiment analysis ('52% positive, 25% negative') and review management (replying to reviews). NeedRadar goes deeper — it extracts specific feature requests, measures demand intensity, checks competitor coverage, and tells you what to build. It also analyzes entire categories, not just single apps.",
  },
  {
    q: "What app stores do you support?",
    a: "Apple App Store, Google Play, Huawei AppGallery, Xiaomi GetApps, vivo App Store, OPPO App Market, Coolapk, and TapTap (for games). We're the only tool that covers Chinese Android markets with native Chinese NLP optimization.",
  },
  {
    q: "When will NeedRadar launch?",
    a: "We're targeting Q3 2026. Waitlist members will get early access 2 weeks before public launch, plus the locked early-bird pricing forever.",
  },
  {
    q: "Is my email safe? Will you spam me?",
    a: "We'll only email you with product updates (1-2 times per month). No spam, no selling your data. You can unsubscribe anytime with one click.",
  },
  {
    q: "What if I'm not satisfied after launch?",
    a: "We'll offer a 14-day free trial of the Pro plan after launch. No credit card required. If it doesn't save you hours of review reading, don't pay.",
  },
];

const STORES = [
  "App Store",
  "Google Play",
  "Huawei",
  "Xiaomi",
  "vivo",
  "OPPO",
  "Coolapk",
  "TapTap",
];

/* ────────── Components ────────── */

function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(0,0,0,.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <a
        href="#"
        style={{
          fontSize: 16,
          fontWeight: 700,
          textDecoration: "none",
          color: "#f5f5f7",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #2997ff, #7b61ff, #2997ff)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 5,
              borderRadius: "50%",
              background: "#000",
            }}
          />
        </div>
        NeedRadar
      </a>
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          fontSize: 13,
        }}
      >
        <a href="#what" style={navLinkStyle}>
          What It Does
        </a>
        <a href="#how" style={navLinkStyle}>
          How
        </a>
        <a href="#pricing" style={navLinkStyle}>
          Pricing
        </a>
        <a href="#faq" style={navLinkStyle}>
          FAQ
        </a>
        <a href="#waitlist" style={{ ...navLinkStyle, color: "#2997ff", fontWeight: 600 }}>
          Join Waitlist →
        </a>
      </div>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#a1a1a6",
  textDecoration: "none",
};

function EmailForm({
  variant = "hero",
  onSuccess,
}: {
  variant?: "hero" | "final";
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      setStatus("loading");
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: variant }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMsg(data.message || "You're in!");
          setEmail("");
          onSuccess?.();
          setTimeout(() => {
            setStatus("idle");
            setMsg("");
          }, 4000);
        } else {
          setStatus("error");
          setMsg(data.error || "Something went wrong");
          setTimeout(() => setStatus("idle"), 3000);
        }
      } catch {
        setStatus("error");
        setMsg("Network error. Try again.");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [email, variant, onSuccess]
  );

  const isFinal = variant === "final";
  const btnBg =
    status === "success"
      ? "#30d158"
      : status === "error"
        ? "#ff453a"
        : "#2997ff";
  const btnText =
    status === "loading"
      ? "Joining..."
      : status === "success"
        ? "You're in! ✓"
        : status === "error"
          ? "Error"
          : "Join Waitlist";

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 10,
        maxWidth: 460,
        width: "100%",
        ...(isFinal ? { margin: "0 auto" } : {}),
      }}
    >
      <input
        type="email"
        placeholder="Enter your email — it's free"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "success"}
        style={{
          flex: 1,
          background: "#1c1c1e",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 14,
          padding: "16px 18px",
          fontFamily: "var(--font-sora), system-ui, sans-serif",
          fontSize: 16,
          color: "#f5f5f7",
          outline: "none",
          transition: "border-color .3s",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        style={{
          fontFamily: "var(--font-sora), system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 600,
          background: btnBg,
          color: "#fff",
          padding: "16px 28px",
          border: "none",
          borderRadius: 14,
          cursor: status === "idle" ? "pointer" : "default",
          transition: "all .2s",
          whiteSpace: "nowrap",
        }}
      >
        {btnText}
      </button>
    </form>
  );
}

function Counter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          let n = 0;
          const step = Math.ceil(target / 50);
          const iv = setInterval(() => {
            n += step;
            if (n >= target) {
              n = target;
              clearInterval(iv);
            }
            setCount(n);
          }, 25);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <b>{count.toLocaleString()}</b> {label}
    </div>
  );
}

function Reveal({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all .6s cubic-bezier(.25,.46,.45,.94)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "18px 0",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "color .2s",
        }}
      >
        {q}
        <span
          style={{
            transition: "transform .2s",
            transform: open ? "rotate(45deg)" : "none",
            fontSize: 14,
            color: "#6e6e73",
          }}
        >
          +
        </span>
      </div>
      {open && (
        <div
          style={{
            padding: "0 0 18px",
            fontSize: 15,
            color: "#a1a1a6",
            lineHeight: 1.7,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

/* ────────── Main Page ────────── */
export default function Home() {
  return (
    <>
      <style>{`
        ::selection { background: #2997ff; color: #fff; }
        @media(max-width:768px){
          nav div:last-child { display: none !important; }
          section.hero { padding: 90px 16px 60px !important; }
          form { flex-direction: column !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
          .benefit-grid { grid-template-columns: 1fr !important; }
          .use-grid { grid-template-columns: 1fr 1fr !important; }
          .how-grid { grid-template-columns: 1fr 1fr !important; }
          .price-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:480px){
          .use-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Nav />

      {/* HERO */}
      <section
        className="hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
        }}
      >
        <Reveal>
          <h1
            style={{
              fontSize: "clamp(36px, 6.5vw, 76px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 820,
              marginBottom: 20,
            }}
          >
            Don&apos;t guess what to build.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #2997ff, #7b61ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Mine it from user reviews.
            </span>
          </h1>
        </Reveal>

        <Reveal>
          <p
            style={{
              fontSize: "clamp(17px, 2vw, 22px)",
              color: "#a1a1a6",
              maxWidth: 600,
              lineHeight: 1.65,
              marginBottom: 36,
            }}
          >
            NeedRadar uses AI to analyze 100,000+ app reviews and tells you
            exactly what features your users want most — ranked by impact,
            backed by data.
          </p>
        </Reveal>

        <Reveal>
          <EmailForm variant="hero" />
        </Reveal>

        <Reveal>
          <p
            style={{
              fontSize: 13,
              color: "#6e6e73",
              marginBottom: 6,
              marginTop: 14,
            }}
          >
            No credit card. No spam. Early-bird pricing locked for waitlist
            members.
          </p>
        </Reveal>

        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 24,
              fontSize: 13,
              color: "#6e6e73",
            }}
          >
            <Counter target={1247} label="on waitlist" />
            <div
              style={{
                width: 1,
                height: 16,
                background: "rgba(255,255,255,.06)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <b style={{ color: "#f5f5f7" }}>48,200</b> reviews analyzed
            </div>
            <div
              style={{
                width: 1,
                height: 16,
                background: "rgba(255,255,255,.06)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <b style={{ color: "#f5f5f7" }}>8+</b> app stores covered
            </div>
          </div>
        </Reveal>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,.06)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          padding: "32px 24px",
          textAlign: "center",
          background: "#080808",
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: "#6e6e73",
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Coverage across global app stores
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 36,
            flexWrap: "wrap",
          }}
        >
          {STORES.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#6e6e73",
                opacity: 0.4,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* DEMO CARD */}
      <DemoCard />

      {/* WHAT YOU GET */}
      <section
        id="what"
        style={{
          padding: "100px 24px",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <Reveal>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#2997ff",
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            What You Get
          </div>
        </Reveal>
        <Reveal>
          <h2 className="title">
            Stop spending weeks reading reviews.
            <br />
            <span className="gradient-text">Get answers in minutes.</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="desc">
            NeedRadar doesn&apos;t just analyze — it tells you exactly what to
            do next.
          </p>
        </Reveal>

        <div className="benefit-grid" style={{ marginTop: 44 }}>
          <BenefitCard
            n="01"
            title="Know the #1 feature your users want"
            desc={"Not \"users are unhappy\" — but \"3,400 users want offline mode, and it's growing 47% month over month.\" Real numbers. Real urgency."}
          />
          <BenefitCard
            n="02"
            title="Discover blue-ocean opportunities"
            desc="Analyze an entire category (not just one app) and see which user needs are completely unmet across all competitors. Find gaps before others do."
          />
          <BenefitCard
            n="03"
            title="Validate your startup idea in 2 minutes"
            desc={"\"I want to build an AI writing app\" → We analyze every competitor's reviews and tell you if real demand exists or if it's a red ocean."}
          />
          <BenefitCard
            n="04"
            title="Get ROI-backed feature priorities"
            desc="Each feature request gets a score: frequency × severity × user value × competitor gap. Your whole team aligns on what to build first."
          />
        </div>
      </section>

      {/* BUILT FOR */}
      <section style={{ textAlign: "center", maxWidth: 960, margin: "0 auto", padding: "100px 24px" }}>
        <Reveal>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2997ff", letterSpacing: 0.5, marginBottom: 10 }}>
            Built For
          </div>
        </Reveal>
        <Reveal>
          <h2 className="title">
            Whether you build, invest,
            <br />
            <span className="gradient-text">or plan your next move</span>
          </h2>
        </Reveal>
        <div className="use-grid" style={{ marginTop: 44 }}>
          <UseCaseCard icon="📱" title="Product Managers" desc='"What feature should we build next?" — answered with data, not gut feeling.' />
          <UseCaseCard icon="🚀" title="Founders" desc="Validate demand before writing a single line of code. Know if your idea has a real market gap." />
          <UseCaseCard icon="💰" title="Investors" desc="Due diligence in minutes: see what users really think about a target app, beyond curated metrics." />
          <UseCaseCard icon="📈" title="ASO Marketers" desc="Find the exact words users use to describe their problems — optimize keywords and descriptions." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div
        id="how"
        style={{
          padding: "100px 24px",
          background: "#080808",
          borderTop: "1px solid rgba(255,255,255,.06)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2997ff", letterSpacing: 0.5, marginBottom: 10 }}>
              How It Works
            </div>
          </Reveal>
          <Reveal>
            <h2 className="title">
              Four steps from
              <br />
              <span className="gradient-text">reviews to roadmap</span>
            </h2>
          </Reveal>
          <div className="how-grid" style={{ marginTop: 44 }}>
            <HowCard n="01" title="Collect" desc="Auto-ingest reviews from App Store, Google Play, Huawei, Xiaomi, and 5+ more stores." />
            <HowCard n="02" title="Understand" desc="LLM reads every review with deep semantic understanding of pain, need, and intent." />
            <HowCard n="03" title="Cluster & Rank" desc="AI groups similar pains, measures frequency × severity × user value, ranks by ROI." />
            <HowCard n="04" title="Decide" desc='"Build offline editing — A+ ROI, 3.4M users, zero competitors." Decisions, not dashboards.' />
          </div>
        </div>
      </div>

      {/* PRICING */}
      <section id="pricing" style={{ textAlign: "center", maxWidth: 960, margin: "0 auto", padding: "100px 24px" }}>
        <Reveal>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2997ff", letterSpacing: 0.5, marginBottom: 10 }}>
            Pricing
          </div>
        </Reveal>
        <Reveal>
          <h2 className="title">
            Lock in <span className="gradient-text">early-bird rates</span>
            <br />
            before launch
          </h2>
        </Reveal>
        <Reveal>
          <p className="desc" style={{ margin: "0 auto" }}>
            Waitlist members get 50% off forever. Once we launch, these prices go up.
          </p>
        </Reveal>

        <div className="price-grid" style={{ marginTop: 44 }}>
          <PriceCard tier="Free" price="$0" per="/mo" note="Try it out" features={["3 app analyses / month", "Top 5 pain points report", "Sentiment breakdown", "App Store + Google Play"]} highlight={false} />
          <PriceCard tier="Pro — Early Bird" price="$29" per="/mo" note={<><s style={{ color: "#6e6e73" }}>$59/mo</s> after launch</>} features={["Unlimited analyses", "Category demand heatmap", "AI feature priority ranking", "Competitor gap analysis", "China market data", "Startup validator", "Continuous monitoring + alerts"]} highlight />
          <PriceCard tier="Enterprise — Early Bird" price="$99" per="/mo" note={<><s style={{ color: "#6e6e73" }}>$199/mo</s> after launch</>} features={["Everything in Pro", "API access (unlimited)", "Investment due diligence reports", "Team seats (5 included)", "Custom dimensions", "Dedicated support"]} highlight={false} />
        </div>

        <Reveal>
          <div
            style={{
              marginTop: 20,
              padding: "14px 20px",
              background: "rgba(255,159,10,.08)",
              border: "1px solid rgba(255,159,10,.15)",
              borderRadius: 10,
              fontSize: 14,
              color: "#ff9f0a",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            ⏳ Early-bird pricing is limited to the first 500 waitlist members.{" "}
            <strong>374 spots remaining.</strong>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ textAlign: "center", maxWidth: 960, margin: "0 auto", padding: "100px 24px" }}>
        <Reveal>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2997ff", letterSpacing: 0.5, marginBottom: 10 }}>
            FAQ
          </div>
        </Reveal>
        <Reveal>
          <h2 className="title">Common questions</h2>
        </Reveal>
        <div style={{ maxWidth: 680, margin: "40px auto 0" }}>
          <Reveal>
            {FAQ_DATA.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        id="waitlist"
        style={{
          padding: "120px 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(41,151,255,.06), transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />
        <Reveal>
          <h2 style={{ ...titleStyle, position: "relative" }}>
            Your competitors are reading
            <br />
            <span className="gradient-text">the same reviews.</span>
            <br />
            Start mining them first.
          </h2>
        </Reveal>
        <Reveal>
          <p
            style={{
              fontSize: 18,
              color: "#a1a1a6",
              marginBottom: 32,
              position: "relative",
            }}
          >
            Join 1,247+ PMs and founders. Lock in early-bird pricing. Get early
            access.
          </p>
        </Reveal>
        <Reveal>
          <EmailForm variant="final" />
        </Reveal>
        <Reveal>
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "#6e6e73",
              position: "relative",
            }}
          >
            Free to join · No credit card · Early access + locked pricing
          </p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,.06)",
          padding: 24,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#6e6e73",
        }}
      >
        <span>© 2026 NeedRadar — AI-powered app review need mining</span>
        <span>needradar.net</span>
      </footer>
    </>
  );
}

/* ────────── Sub-components ────────── */

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(30px, 4.5vw, 52px)",
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: -1.5,
  marginBottom: 14,
};

function DemoCard() {
  return (
    <div style={{ padding: "80px 24px", display: "flex", justifyContent: "center" }}>
      <Reveal>
        <div
          style={{
            maxWidth: 880,
            width: "100%",
            background: "#1c1c1e",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,.4), 0 0 100px rgba(41,151,255,.03)",
          }}
        >
          {/* Browser bar */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: "#6e6e73",
              }}
            >
              needradar.ai/analyze/notion
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input
                readOnly
                value="Notion — Productivity"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 10,
                  padding: "11px 14px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 13,
                  color: "#f5f5f7",
                  outline: "none",
                }}
              />
              <button
                style={{
                  fontFamily: "var(--font-sora), system-ui",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#2997ff",
                  color: "#fff",
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: 10,
                  cursor: "default",
                }}
              >
                Analyze
              </button>
            </div>

            <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Pain Points */}
              <DemoColumn
                header="User Pain Points"
                color="#ff453a"
                rows={[
                  { n: "01", title: "Offline mode doesn't work", sub: "2,341 mentions · ↑47% this month" },
                  { n: "02", title: "Mobile editing is painful", sub: "1,892 mentions · No improvement" },
                  { n: "03", title: "Database views load slowly", sub: "1,456 mentions · Long-standing issue" },
                ]}
              />
              {/* Opportunities */}
              <DemoColumn
                header="Feature Opportunities"
                color="#30d158"
                rows={[
                  { grade: "A+", title: "Native offline editing + sync", sub: "18% reviews · Zero competitors · 3.4M users" },
                  { grade: "A", title: "Mobile markdown editor", sub: "14% reviews · Obsidian partially solves" },
                  { grade: "B+", title: "AI writing assistant", sub: "8% reviews · Rising trend · Competitors moving" },
                ]}
                isGrade
              />
            </div>
          </div>

          {/* Insight */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,.06)",
              background: "rgba(41,151,255,.03)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "#2997ff",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚡ <strong style={{ color: "#f5f5f7" }}>AI Insight:</strong> &quot;Offline mode&quot; is the #1 unmet need — 47% monthly
            growth, zero competitors address it.{" "}
            <strong>Priority: P0</strong>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function DemoColumn({
  header,
  color,
  rows,
  isGrade = false,
}: {
  header: string;
  color: string;
  rows: { n?: string; grade?: string; title: string; sub: string }[];
  isGrade?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,.3)",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#6e6e73",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
        {header}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            padding: "9px 0",
            borderBottom:
              i < rows.length - 1
                ? "1px solid rgba(255,255,255,.06)"
                : "none",
          }}
        >
          {isGrade ? (
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 4,
                marginTop: 1,
                height: "fit-content",
                background:
                  r.grade === "A+"
                    ? "rgba(48,209,88,.08)"
                    : r.grade === "A"
                      ? "rgba(41,151,255,.1)"
                      : "rgba(255,159,10,.08)",
                color:
                  r.grade === "A+"
                    ? "#30d158"
                    : r.grade === "A"
                      ? "#2997ff"
                      : "#ff9f0a",
              }}
            >
              {r.grade}
            </span>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                fontWeight: 700,
                minWidth: 20,
                color: "#ff9f0a",
                marginTop: 1,
              }}
            >
              {r.n}
            </span>
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>
              {r.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: "#6e6e73",
              }}
            >
              {r.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BenefitCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <Reveal>
      <div
        style={{
          padding: 28,
          background: "#1c1c1e",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 16,
          transition: "border-color .3s",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: "#2997ff",
            marginBottom: 14,
            letterSpacing: 1,
          }}
        >
          {n}
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: -0.3 }}>
          {title}
        </h3>
        <p style={{ fontSize: 15, color: "#a1a1a6", lineHeight: 1.6 }}>{desc}</p>
        <a
          href="#waitlist"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 600,
            color: "#2997ff",
            marginTop: 12,
            textDecoration: "none",
          }}
        >
          Lock in early-bird price →
        </a>
      </div>
    </Reveal>
  );
}

function UseCaseCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <Reveal>
      <div
        style={{
          padding: 24,
          background: "#1c1c1e",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 14,
          textAlign: "center",
          transition: "all .3s",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 13, color: "#a1a1a6" }}>{desc}</p>
      </div>
    </Reveal>
  );
}

function HowCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <Reveal>
      <div style={{ padding: 24, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 40,
            fontWeight: 700,
            color: "rgba(255,255,255,.04)",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {n}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#a1a1a6", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </Reveal>
  );
}

function PriceCard({
  tier,
  price,
  per,
  note,
  features,
  highlight,
}: {
  tier: string;
  price: string;
  per: string;
  note: React.ReactNode;
  features: string[];
  highlight: boolean;
}) {
  return (
    <Reveal>
      <div
        style={{
          padding: 28,
          background: highlight
            ? "linear-gradient(180deg, rgba(41,151,255,.06), transparent)"
            : "#1c1c1e",
          border: highlight
            ? "1px solid #2997ff"
            : "1px solid rgba(255,255,255,.06)",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {highlight && (
          <div
            style={{
              position: "absolute",
              top: -13,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 16px",
              background: "#2997ff",
              color: "#fff",
              borderRadius: 20,
              letterSpacing: 0.3,
            }}
          >
            Most Popular
          </div>
        )}
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#6e6e73",
            marginBottom: 6,
          }}
        >
          {tier}
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>
          {price}
          <span style={{ fontSize: 16, fontWeight: 400, color: "#6e6e73" }}>
            {per}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#6e6e73", marginBottom: 18 }}>
          {note}
        </div>
        <ul style={{ listStyle: "none", flex: 1, marginBottom: 20, padding: 0 }}>
          {features.map((f) => (
            <li
              key={f}
              style={{
                fontSize: 14,
                color: "#a1a1a6",
                padding: "5px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#30d158", fontSize: 12, fontWeight: 700 }}>
                ✓
              </span>{" "}
              {f}
            </li>
          ))}
        </ul>
        <a
          href="#waitlist"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 15,
            fontWeight: 600,
            padding: 14,
            borderRadius: 12,
            textDecoration: "none",
            border: highlight ? "1px solid #2997ff" : "1px solid rgba(255,255,255,.06)",
            color: highlight ? "#fff" : "#f5f5f7",
            background: highlight ? "#2997ff" : "transparent",
            transition: "all .2s",
          }}
        >
          {highlight ? "Join Waitlist → Lock $29/mo" : "Join Waitlist"}
        </a>
      </div>
    </Reveal>
  );
}
