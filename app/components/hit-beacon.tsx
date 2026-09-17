"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// the referrer only means something for the first pageview of a load;
// client-side navigations would keep re-sending the original one
let referrerSent = false;

export function HitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    // the owner's own wandering is not traffic
    try {
      if (sessionStorage.getItem("site_pw")) return;
    } catch {}
    const body = JSON.stringify({ p: pathname, r: referrerSent ? "" : document.referrer });
    referrerSent = true;
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/hit", blob)) {
      fetch("/api/hit", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "content-type": "application/json" },
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
