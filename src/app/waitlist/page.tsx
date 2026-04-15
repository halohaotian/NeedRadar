"use client";

import { useState, useEffect } from "react";

interface WaitlistInfo {
  position: number;
  total: number;
  joinedAt: string;
  found: boolean;
}

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<WaitlistInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinPosition, setJoinPosition] = useState<number | null>(null);

  // Check URL params for email from landing page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (e) {
      setEmail(e);
      fetchPosition(e);
    }
  }, []);

  const fetchPosition = async (em: string) => {
    if (!em) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/waitlist?email=${encodeURIComponent(em)}`);
      const data = await res.json();
      setInfo(data);
    } catch {
      setInfo(null);
    }
    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "waitlist_page" }),
      });
      const data = await res.json();
      if (data.success) {
        setJoined(true);
        setJoinPosition(data.position);
        fetchPosition(email);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const progressPct = info
    ? Math.min(Math.round((info.position / Math.max(info.total, 1)) * 100), 100)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#f5f5f7",
        fontFamily: "var(--font-sora), system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          fontSize: 20,
          fontWeight: 800,
          textDecoration: "none",
          color: "#f5f5f7",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "conic-gradient(from 0deg, #2997ff, #7b61ff, #2997ff)",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", inset: 5, borderRadius: "50%", background: "#000" }} />
        </div>
        NeedRadar
      </a>

      {joined && joinPosition ? (
        /* ── Just Joined ── */
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            <span style={{ background: "linear-gradient(135deg, #2997ff, #7b61ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              #{joinPosition}
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>
            You&apos;re on the list!
          </h1>
          <p style={{ fontSize: 17, color: "#a1a1a6", lineHeight: 1.6, marginBottom: 32 }}>
            You&apos;re <strong style={{ color: "#f5f5f7" }}>#{joinPosition}</strong> in line.
            We&apos;ll email you when it&apos;s your turn for early access.
          </p>

          <div
            style={{
              background: "#1c1c1e",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#a1a1a6", marginBottom: 8 }}>
              <span>Queue progress</span>
              <span style={{ color: "#30d158" }}>Confirmed</span>
            </div>
            <div
              style={{
                height: 8,
                background: "rgba(255,255,255,.06)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  background: "linear-gradient(90deg, #2997ff, #7b61ff)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          {/* Perks */}
          <div style={{ textAlign: "left", background: "#1c1c1e", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your waitlist perks</h3>
            {[
              { icon: "💰", text: "Lock $29/mo early-bird price (regular: $59/mo)" },
              { icon: "⚡", text: "Early access 2 weeks before public launch" },
              { icon: "🎯", text: "Priority onboarding + direct feedback channel" },
            ].map((p) => (
              <div key={p.text} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={{ fontSize: 14, color: "#a1a1a6", lineHeight: 1.5 }}>{p.text}</span>
              </div>
            ))}
          </div>

          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 32,
              color: "#2997ff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back to home
          </a>
        </div>
      ) : (
        /* ── Check / Join ── */
        <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.5, marginBottom: 12 }}>
            Waitlist{" "}
            <span style={{ background: "linear-gradient(135deg, #2997ff, #7b61ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Queue
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "#a1a1a6", lineHeight: 1.6, marginBottom: 32 }}>
            Check your position or join the waitlist.
          </p>

          <form onSubmit={handleJoin}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                background: "#1c1c1e",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 14,
                padding: "16px 18px",
                fontSize: 16,
                color: "#f5f5f7",
                outline: "none",
                marginBottom: 12,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: "#2997ff",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Checking..." : info?.found ? "Join Waitlist" : "Check Position / Join"}
            </button>
          </form>

          {/* Position Display */}
          {info?.found && (
            <div
              style={{
                marginTop: 32,
                background: "#1c1c1e",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>
                <span style={{ background: "linear-gradient(135deg, #2997ff, #7b61ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  #{info.position}
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#a1a1a6" }}>
                out of <strong style={{ color: "#f5f5f7" }}>{info.total}</strong> in the queue
              </p>
              <p style={{ fontSize: 13, color: "#6e6e73", marginTop: 8 }}>
                Joined {new Date(info.joinedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}

          {info && !info.found && !loading && email && (
            <div
              style={{
                marginTop: 32,
                background: "rgba(255,159,10,.08)",
                border: "1px solid rgba(255,159,10,.15)",
                borderRadius: 16,
                padding: 24,
                fontSize: 15,
                color: "#ff9f0a",
              }}
            >
              You&apos;re not on the waitlist yet. Submit above to join!
            </div>
          )}

          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 32,
              color: "#2997ff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back to home
          </a>
        </div>
      )}
    </div>
  );
}
