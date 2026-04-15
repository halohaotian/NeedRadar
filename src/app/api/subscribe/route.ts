import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/resend";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 3600000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let email: string;
  let source: string;
  try {
    const body = await request.json();
    email = body.email;
    source = body.source || "landing_page";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    console.log(`[Subscribe] ${email} — no DATABASE_URL`);
    sendWelcomeEmail(email).catch(() => {});
    return NextResponse.json({ success: true, position: null });
  }

  let sql;
  try {
    sql = getDb();
  } catch (err) {
    console.error("DB connection error:", err);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  try {
    // Upsert user
    await sql`
      INSERT INTO nr_users (email, name, provider)
      VALUES (${email}, ${email.split("@")[0]}, 'email')
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    `;

    const users = await sql`SELECT id FROM nr_users WHERE email = ${email}`;
    const userId = users[0]?.id || null;

    let position: number | null = null;
    const results = await sql`
      INSERT INTO nr_waitlist (email, source, user_id)
      VALUES (${email}, ${source}, ${userId})
      ON CONFLICT (email) DO UPDATE SET source = EXCLUDED.source
      RETURNING position
    `;
    position = results[0]?.position || null;

    sendWelcomeEmail(email).catch(() => {});

    return NextResponse.json({ success: true, position, message: "You're on the list!" });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  } finally {
    sql.end();
  }
}
