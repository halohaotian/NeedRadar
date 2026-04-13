import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/resend";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().max(100).optional().default("landing_page"),
});

// Rate limiting: in-memory store (per instance, fine for waitlist scale)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 }); // 1 hour window
    return false;
  }
  if (entry.count >= 10) return true; // 10 requests per hour
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate
    const body = await request.json();
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email, source } = result.data;

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      // Fallback: log and return success (for dev/preview without DB)
      console.log(`[Waitlist] ${email} (source: ${source})`);
      await sendWelcomeEmail(email).catch(() => {});
      return NextResponse.json({
        success: true,
        message: "You're on the list!",
      });
    }

    const sql = getDb();

    // Insert (ignore duplicates)
    try {
      await sql`
        INSERT INTO waitlist (email, source)
        VALUES (${email}, ${source})
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (dbError) {
      console.error("DB insert error:", dbError);
      // Still return success — don't leak DB errors to client
    }

    // Send welcome email (non-blocking)
    await sendWelcomeEmail(email).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "You're on the list! Check your inbox for a welcome email.",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
