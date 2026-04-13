import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendWelcomeEmail(email: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`[Resend] No API key — skipping welcome email to ${email}`);
    return false;
  }

  const { error } = await resend.emails.send({
    from: "NeedRadar <hello@needradar.net>",
    to: email,
    subject: "You're on the NeedRadar waitlist!",
    html: `
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;font-family:-apple-system,sans-serif;color:#f5f5f7;background:#000">
        <div style="text-align:center;margin-bottom:40px">
          <h1 style="font-size:28px;font-weight:800;letter-spacing:-1px">
            <span style="background:linear-gradient(135deg,#2997ff,#7b61ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent">NeedRadar</span>
          </h1>
        </div>
        <h2 style="font-size:22px;font-weight:700;margin-bottom:16px">You're on the list!</h2>
        <p style="font-size:16px;line-height:1.6;color:#a1a1a6;margin-bottom:24px">
          Thanks for joining the waitlist. We're building the first AI tool that mines real user needs from app reviews — not just sentiment scores, but actionable feature priorities ranked by ROI.
        </p>
        <p style="font-size:16px;line-height:1.6;color:#a1a1a6;margin-bottom:24px">
          As a waitlist member, you'll get:
        </p>
        <ul style="font-size:16px;line-height:1.8;color:#a1a1a6;margin-bottom:32px;padding-left:20px">
          <li>Early access before public launch</li>
          <li>Lock in the <strong style="color:#f5f5f7">$29/mo early bird price</strong> (regular: $59/mo)</li>
          <li>Priority onboarding + direct feedback channel</li>
        </ul>
        <div style="text-align:center">
          <a href="https://needradar.net" style="display:inline-block;padding:14px 32px;background:#2997ff;color:#fff;text-decoration:none;border-radius:14px;font-weight:600;font-size:16px">Visit NeedRadar</a>
        </div>
        <p style="font-size:13px;color:#6e6e73;margin-top:40px;text-align:center">
          NeedRadar — Stop guessing what users want. AI mines it from reviews.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
  return true;
}
