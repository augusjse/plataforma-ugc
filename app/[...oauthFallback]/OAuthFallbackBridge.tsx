"use client";

import { useEffect } from "react";

const MERCURY_URL = "https://mercury-shopee-control-room.vercel.app/";

export function OAuthFallbackBridge() {
  useEffect(() => {
    const destination = new URL(MERCURY_URL);
    destination.hash = window.location.hash;
    window.location.replace(destination.toString());
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <p>Concluindo login no Mercury…</p>
    </main>
  );
}
