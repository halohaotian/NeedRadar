import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/resend";

// POST — join waitlist
export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = body.email;
  const source = body.source || "landing_page";
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, position: null });
  }

  const sql = getDb();
  try {
    await sql`
      INSERT INTO nr_users (email, name, provider)
      VALUES (${email}, ${email.split("@")[0]}, 'email')
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    `;
    const users = await sql`SELECT id FROM nr_users WHERE email = ${email}`;
    const userId = users[0]?.id || null;

    const results = await sql`
      INSERT INTO nr_waitlist (email, source, user_id)
      VALUES (${email}, ${source}, ${userId})
      ON CONFLICT (email) DO UPDATE SET source = EXCLUDED.source
      RETURNING position
    `;

    sendWelcomeEmail(email).catch(() => {});

    return NextResponse.json({ success: true, position: results[0]?.position || null });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET — check position
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ position: null });

  const sql = getDb();
  try {
    const results = await sql`
      SELECT position, created_at FROM nr_waitlist WHERE email = ${email}
    `;
    if (!results[0]) return NextResponse.json({ position: null, found: false });

    const totals = await sql`SELECT COUNT(*) as count FROM nr_waitlist`;

    return NextResponse.json({
      position: Number(results[0].position),
      total: Number(totals[0].count),
      joinedAt: String(results[0].created_at),
      found: true,
    });
  } catch (err) {
    console.error("Waitlist GET error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
