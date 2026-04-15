"use client";

import { useEffect } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("nr_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("nr_sid", sid);
  }
  return sid;
}

export function trackClick(elementId: string, elementType: string) {
  const sid = getSessionId();
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "click",
      elementId,
      elementType,
      page: window.location.pathname,
      sessionId: sid,
    }),
  }).catch(() => {}); // Never fail for analytics
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sid = getSessionId();

    // Track page view
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "pageview",
        path: window.location.pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        sessionId: sid,
      }),
    }).catch(() => {});

    // Track visibility on hidden
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        const buf = (window as unknown as Record<string, unknown>).__nrClickBuf;
        if (buf && (buf as Array<unknown>).length > 0) {
          navigator.sendBeacon?.("/api/analytics", JSON.stringify(buf));
        }
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  return <>{children}</>;
}
