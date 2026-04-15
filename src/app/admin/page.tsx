"use client";

import { useState, useEffect } from "react";

interface Overview {
  totalViews: number;
  totalClicks: number;
  totalSignups: number;
  totalWaitlist: number;
  todayViews: number;
  todayClicks: number;
  todaySignups: number;
  todayWaitlist: number;
}

interface DailyStat {
  date: string;
  views: number;
  clicks: number;
  signups: number;
  waitlist: number;
}

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  position: number;
  name: string | null;
  provider: string | null;
  createdAt: string;
}

interface AnalyticsData {
  overview: Overview;
  daily: DailyStat[];
  topPages: { path: string; count: number }[];
  topClicks: { elementId: string; elementType: string; count: number }[];
  waitlistEntries: WaitlistEntry[];
}

const th: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 600,
  color: "#6e6e73",
  textTransform: "uppercase",
  letterSpacing: 1,
  textAlign: "left",
  borderBottom: "1px solid rgba(255,255,255,.06)",
};

const td: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 13,
  borderBottom: "1px solid rgba(255,255,255,.04)",
};

export default function AdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"overview" | "waitlist">("overview");

  useEffect(() => {
    const token = localStorage.getItem("nr_admin");
    if (token === "needradar2026") setAuthed(true);
    const params = new URLSearchParams(window.location.search);
    const k = params.get("key");
    if (k === "needradar2026") {
      localStorage.setItem("nr_admin", k);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#f5f5f7", fontFamily: "var(--font-sora), system-ui" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password === "needradar2026") {
              localStorage.setItem("nr_admin", password);
              setAuthed(true);
            } else alert("Wrong password");
          }}
          style={{ background: "#1c1c1e", padding: 40, borderRadius: 20, border: "1px solid rgba(255,255,255,.06)", width: 360 }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>NeedRadar Admin</h1>
          <p style={{ fontSize: 14, color: "#a1a1a6", marginBottom: 24, textAlign: "center" }}>Enter admin password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: "14px 16px", fontSize: 16, color: "#f5f5f7", outline: "none", marginBottom: 16 }}
          />
          <button type="submit" style={{ width: "100%", padding: 14, background: "#2997ff", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Login</button>
        </form>
      </div>
    );
  }

  const ov = data?.overview;
  const daily = data?.daily || [];

  // Find max for chart scaling
  const maxDaily = Math.max(...daily.map((d) => Math.max(d.views, d.clicks, d.signups, d.waitlist)), 1);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f5f5f7", fontFamily: "var(--font-sora), system-ui", padding: "24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,.06)", paddingBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>NeedRadar Dashboard</h1>
          <p style={{ fontSize: 13, color: "#6e6e73" }}>Analytics & Waitlist Management</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetch("/api/analytics")
              .then((r) => r.json())
              .then((d) => setData(d))
              .finally(() => setLoading(false));
          }}
          style={{ padding: "10px 20px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, color: "#f5f5f7", cursor: "pointer", fontSize: 14 }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6e6e73", textAlign: "center", marginTop: 60 }}>Loading...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
            <StatCard label="Page Views" total={ov?.totalViews || 0} today={ov?.todayViews || 0} color="#2997ff" />
            <StatCard label="Click Events" total={ov?.totalClicks || 0} today={ov?.todayClicks || 0} color="#7b61ff" />
            <StatCard label="Registrations" total={ov?.totalSignups || 0} today={ov?.todaySignups || 0} color="#30d158" />
            <StatCard label="Waitlist" total={ov?.totalWaitlist || 0} today={ov?.todayWaitlist || 0} color="#ff9f0a" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            {(["overview", "waitlist"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "12px 24px",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t ? "2px solid #2997ff" : "2px solid transparent",
                  color: tab === t ? "#f5f5f7" : "#6e6e73",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t === "overview" ? "Analytics" : "Waitlist"}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <>
              {/* 30-Day Chart */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Daily Trend (30 days)</h3>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 160, overflowX: "auto" }}>
                  {daily.map((d) => (
                    <div key={d.date} style={{ flex: "0 0 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 9, color: "#6e6e73" }}>{d.views}</span>
                      <div
                        style={{
                          width: "100%",
                          height: Math.max((d.views / maxDaily) * 120, 2),
                          background: "linear-gradient(180deg, #2997ff, rgba(41,151,255,.2))",
                          borderRadius: 3,
                          minHeight: 2,
                        }}
                      />
                      <span style={{ fontSize: 8, color: "#6e6e73", fontFamily: "var(--font-jetbrains-mono), monospace", whiteSpace: "nowrap" }}>
                        {d.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "#6e6e73" }}>
                  <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#2997ff", marginRight: 4 }} />Views</span>
                  <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#30d158", marginRight: 4 }} />Signups</span>
                  <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#ff9f0a", marginRight: 4 }} />Waitlist</span>
                </div>
              </div>

              {/* Two columns: Top Pages + Top Clicks */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Top Pages (7 days)</h3>
                  <div style={{ background: "#1c1c1e", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)", overflow: "hidden" }}>
                    {(data?.topPages || []).map((p, i) => (
                      <div key={p.path} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: i < (data?.topPages.length || 0) - 1 ? "1px solid rgba(255,255,255,.04)" : "none", fontSize: 13 }}>
                        <span style={{ color: "#a1a1a6" }}>{p.path}</span>
                        <strong>{p.count}</strong>
                      </div>
                    ))}
                    {(!data?.topPages || data.topPages.length === 0) && <div style={{ padding: 20, textAlign: "center", color: "#6e6e73", fontSize: 13 }}>No data yet</div>}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Top Clicks (7 days)</h3>
                  <div style={{ background: "#1c1c1e", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)", overflow: "hidden" }}>
                    {(data?.topClicks || []).map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: i < (data?.topClicks.length || 0) - 1 ? "1px solid rgba(255,255,255,.04)" : "none", fontSize: 13 }}>
                        <span style={{ color: "#a1a1a6" }}>{c.elementId || c.elementType || "unknown"}</span>
                        <strong>{c.count}</strong>
                      </div>
                    ))}
                    {(!data?.topClicks || data.topClicks.length === 0) && <div style={{ padding: 20, textAlign: "center", color: "#6e6e73", fontSize: 13 }}>No data yet</div>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Waitlist Tab */
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                Waitlist Entries ({ov?.totalWaitlist || 0})
              </h3>
              <div style={{ background: "#1c1c1e", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)", overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th style={th}>#</th>
                      <th style={th}>Email</th>
                      <th style={th}>Name</th>
                      <th style={th}>Source</th>
                      <th style={th}>Provider</th>
                      <th style={th}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.waitlistEntries || []).map((e) => (
                      <tr key={e.id}>
                        <td style={td}><span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#ff9f0a", fontWeight: 700 }}>{e.position}</span></td>
                        <td style={{ ...td, color: "#2997ff" }}>{e.email}</td>
                        <td style={td}>{e.name || "—"}</td>
                        <td style={td}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(41,151,255,.1)", fontSize: 11, fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                            {e.source}
                          </span>
                        </td>
                        <td style={td}>{e.provider || "email"}</td>
                        <td style={{ ...td, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#6e6e73" }}>
                          {new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                    {(!data?.waitlistEntries || data.waitlistEntries.length === 0) && (
                      <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#6e6e73", padding: 40 }}>No entries yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, total, today, color }: { label: string; total: number; today: number; color: string }) {
  return (
    <div style={{ padding: 20, background: "#1c1c1e", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14 }}>
      <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{total.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: "#30d158", marginTop: 4 }}>+{today} today</div>
    </div>
  );
}
