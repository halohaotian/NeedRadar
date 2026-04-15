import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST — track events
export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });

  let body: Record<string, string>;
  try {
    body = await request.json() as Record<string, string>;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const sql = getDb();
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") || null;

    if (body.type === "pageview") {
      await sql`
        INSERT INTO nr_page_views (path, referrer, user_agent, ip, session_id)
        VALUES (${body.path || "/"}, ${body.referrer || null}, ${body.userAgent || null}, ${ip}, ${body.sessionId || null})
      `;
    } else if (body.type === "click") {
      await sql`
        INSERT INTO nr_click_events (element_id, element_type, page, session_id)
        VALUES (${body.elementId || null}, ${body.elementType || null}, ${body.page || "/"}, ${body.sessionId || null})
      `;
    }
  } catch (err) {
    console.error("Analytics POST error:", err);
  }

  return NextResponse.json({ ok: true });
}

// GET — admin data
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      overview: { totalViews: 0, totalClicks: 0, totalSignups: 0, totalWaitlist: 0, todayViews: 0, todayClicks: 0, todaySignups: 0, todayWaitlist: 0 },
      daily: [],
      topPages: [],
      topClicks: [],
      waitlistEntries: [],
    });
  }

  const sql = getDb();
  try {
    const [views] = await sql`SELECT COUNT(*)::int as count FROM nr_page_views`;
    const [clicks] = await sql`SELECT COUNT(*)::int as count FROM nr_click_events`;
    const [signups] = await sql`SELECT COUNT(*)::int as count FROM nr_users`;
    const [waitlist] = await sql`SELECT COUNT(*)::int as count FROM nr_waitlist`;

    const [todayViews] = await sql`SELECT COUNT(*)::int as c FROM nr_page_views WHERE created_at >= CURRENT_DATE`;
    const [todayClicks] = await sql`SELECT COUNT(*)::int as c FROM nr_click_events WHERE created_at >= CURRENT_DATE`;
    const [todaySignups] = await sql`SELECT COUNT(*)::int as c FROM nr_users WHERE created_at >= CURRENT_DATE`;
    const [todayWaitlist] = await sql`SELECT COUNT(*)::int as c FROM nr_waitlist WHERE created_at >= CURRENT_DATE`;

    const daily = await sql`
      SELECT
        d::date AS date,
        COALESCE(v.c, 0) AS views,
        COALESCE(k.c, 0) AS clicks,
        COALESCE(s.c, 0) AS signups,
        COALESCE(w.c, 0) AS waitlist
      FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d
      LEFT JOIN (SELECT DATE(created_at)::date AS dd, COUNT(*)::int AS c FROM nr_page_views GROUP BY 1) v ON v.dd = d::date
      LEFT JOIN (SELECT DATE(created_at)::date AS dd, COUNT(*)::int AS c FROM nr_click_events GROUP BY 1) k ON k.dd = d::date
      LEFT JOIN (SELECT DATE(created_at)::date AS dd, COUNT(*)::int AS c FROM nr_users GROUP BY 1) s ON s.dd = d::date
      LEFT JOIN (SELECT DATE(created_at)::date AS dd, COUNT(*)::int AS c FROM nr_waitlist GROUP BY 1) w ON w.dd = d::date
      ORDER BY d
    `;

    const topPages = await sql`
      SELECT path, COUNT(*)::int as count FROM nr_page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY path ORDER BY count DESC LIMIT 10
    `;

    const topClicks = await sql`
      SELECT element_id, element_type, COUNT(*)::int as count FROM nr_click_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY element_id, element_type ORDER BY count DESC LIMIT 10
    `;

    const waitlistEntries = await sql`
      SELECT w.id::text, w.email, w.source, w.position, w.created_at::text,
             u.name, u.provider
      FROM nr_waitlist w
      LEFT JOIN nr_users u ON u.id = w.user_id
      ORDER BY w.position ASC LIMIT 500
    `;

    return NextResponse.json({
      overview: {
        totalViews: views.count,
        totalClicks: clicks.count,
        totalSignups: signups.count,
        totalWaitlist: waitlist.count,
        todayViews: todayViews.c,
        todayClicks: todayClicks.c,
        todaySignups: todaySignups.c,
        todayWaitlist: todayWaitlist.c,
      },
      daily: daily.map((d) => ({
        date: String(d.date).slice(0, 10),
        views: d.views as number,
        clicks: d.clicks as number,
        signups: d.signups as number,
        waitlist: d.waitlist as number,
      })),
      topPages: topPages.map((p) => ({ path: p.path as string, count: p.count as number })),
      topClicks: topClicks.map((c) => ({ elementId: (c.element_id as string) || "", elementType: (c.element_type as string) || "", count: c.count as number })),
      waitlistEntries: waitlistEntries.map((e) => ({
        id: e.id as string,
        email: e.email as string,
        source: e.source as string,
        position: e.position as number,
        name: (e.name as string) || null,
        provider: (e.provider as string) || null,
        createdAt: e.created_at as string,
      })),
    });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
