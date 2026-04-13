"use client";

import { useState, useEffect } from "react";

interface WaitlistEntry {
  id: number;
  email: string;
  source: string;
  created_at: string;
}

interface Stats {
  totalSubscribers: number;
  todaySubscribers: number;
  last7Days: { date: string; count: number }[];
  bySource: { source: string; count: number }[];
}

export default function AdminPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");

  const checkAuth = () => {
    const token = localStorage.getItem("nr_admin_token");
    if (token === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuthed(true);
    }
    // Also check query param for convenience
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) {
      localStorage.setItem("nr_admin_token", key);
      setAuthed(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchData();
  }, [authed]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check against env var (client-side preview only)
    const adminSecret = "needradar2026"; // default, change in env
    if (password === adminSecret) {
      localStorage.setItem("nr_admin_token", password);
      setAuthed(true);
    } else {
      alert("Wrong password");
    }
  };

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#f5f5f7",
          fontFamily: "var(--font-sora), system-ui, sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "#1c1c1e",
            padding: 40,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,.06)",
            width: 360,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>
            NeedRadar Admin
          </h1>
          <p style={{ fontSize: 14, color: "#a1a1a6", marginBottom: 24, textAlign: "center" }}>
            Enter admin password
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 12,
              padding: "14px 16px",
              fontSize: 16,
              color: "#f5f5f7",
              outline: "none",
              marginBottom: 16,
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "#2997ff",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#f5f5f7",
        fontFamily: "var(--font-sora), system-ui, sans-serif",
        padding: "24px 32px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          borderBottom: "1px solid rgba(255,255,255,.06)",
          paddingBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
            NeedRadar Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#6e6e73" }}>
            Waitlist & Analytics
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: "10px 20px",
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 10,
            color: "#f5f5f7",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6e6e73", textAlign: "center", marginTop: 60 }}>
          Loading...
        </p>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            <StatCard
              label="Total Waitlist"
              value={stats?.totalSubscribers ?? entries.length}
              color="#2997ff"
            />
            <StatCard
              label="Today's Signups"
              value={stats?.todaySubscribers ?? 0}
              color="#30d158"
            />
            <StatCard
              label="Total Entries"
              value={entries.length}
              color="#7b61ff"
            />
          </div>

          {/* Source Breakdown */}
          {stats?.bySource && stats.bySource.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                Signups by Source
              </h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {stats.bySource.map((s) => (
                  <div
                    key={s.source}
                    style={{
                      padding: "12px 20px",
                      background: "#1c1c1e",
                      border: "1px solid rgba(255,255,255,.06)",
                      borderRadius: 10,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#a1a1a6" }}>{s.source}: </span>
                    <strong>{s.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Chart */}
          {stats?.last7Days && stats.last7Days.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                Last 7 Days
              </h3>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
                {stats.last7Days.map((d) => {
                  const maxCount = Math.max(...stats.last7Days.map((x) => x.count), 1);
                  const height = Math.max((d.count / maxCount) * 100, 4);
                  return (
                    <div
                      key={d.date}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#a1a1a6" }}>
                        {d.count}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height,
                          background: "linear-gradient(180deg, #2997ff, rgba(41,151,255,.3))",
                          borderRadius: 6,
                          minHeight: 4,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          color: "#6e6e73",
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                        }}
                      >
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Waitlist Table */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Waitlist Entries
            </h3>
            <div
              style={{
                background: "#1c1c1e",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.06)",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                      textAlign: "left",
                    }}
                  >
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom:
                          i < entries.length - 1
                            ? "1px solid rgba(255,255,255,.04)"
                            : "none",
                      }}
                    >
                      <td style={tdStyle}>{e.id}</td>
                      <td style={{ ...tdStyle, color: "#2997ff" }}>
                        {e.email}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(41,151,255,.1)",
                            fontSize: 12,
                            fontFamily:
                              "var(--font-jetbrains-mono), monospace",
                          }}
                        >
                          {e.source}
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: 12,
                          color: "#6e6e73",
                        }}
                      >
                        {new Date(e.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 12,
  fontWeight: 600,
  color: "#6e6e73",
  textTransform: "uppercase" as const,
  letterSpacing: 1,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        background: "#1c1c1e",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 14,
      }}
    >
      <div style={{ fontSize: 13, color: "#6e6e73", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color }}>{value.toLocaleString()}</div>
    </div>
  );
}
