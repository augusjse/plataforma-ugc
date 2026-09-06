import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // FFmpeg's multi-threaded WASM core needs cross-origin isolation.
        // Keep this scoped to the upload page because COEP affects every
        // cross-origin subresource loaded by the document.
        source: "/criadora/enviar",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // credentialless keeps the page isolated while allowing the
          // product thumbnails that do not send a CORP header to load.
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
