import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Simple auth check via header
function isAdmin(request: NextRequest): boolean {
  const auth = request.headers.get("x-admin-secret");
  return auth === process.env.ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    // Dev mode without DB — return mock data
    return NextResponse.json({
      entries: [
        { id: 1, email: "demo@example.com", source: "landing_page", created_at: new Date().toISOString() },
      ],
      stats: {
        totalSubscribers: 1,
        todaySubscribers: 1,
        last7Days: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
          count: i === 6 ? 1 : 0,
        })),
        bySource: [{ source: "landing_page", count: 1 }],
      },
    });
  }

  const sql = getDb();

  // Fetch all entries (latest first)
  const entries = await sql`
    SELECT id, email, source, created_at
    FROM nr_waitlist
    ORDER BY created_at DESC
    LIMIT 1000
  `;

  // Stats
  const [totalResult] = await sql`
    SELECT COUNT(*) as count FROM nr_waitlist
  `;
  const totalSubscribers = Number(totalResult.count);

  const [todayResult] = await sql`
    SELECT COUNT(*) as count FROM nr_waitlist
    WHERE created_at >= CURRENT_DATE
  `;
  const todaySubscribers = Number(todayResult.count);

  // Last 7 days
  const last7Days = await sql`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM nr_waitlist
    WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // By source
  const bySource = await sql`
    SELECT source, COUNT(*) as count
    FROM nr_waitlist
    GROUP BY source
    ORDER BY count DESC
  `;

  // Fill missing days in last 7
  const filled7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000)
      .toISOString()
      .slice(0, 10);
    const found = last7Days.find(
      (d: Record<string, unknown>) => String(d.date).slice(0, 10) === date
    );
    return { date, count: found ? Number(found.count) : 0 };
  });

  return NextResponse.json({
    entries,
    stats: {
      totalSubscribers,
      todaySubscribers,
      last7Days: filled7Days,
      bySource: bySource.map((s: Record<string, unknown>) => ({
        source: String(s.source),
        count: Number(s.count),
      })),
    },
  });
}
