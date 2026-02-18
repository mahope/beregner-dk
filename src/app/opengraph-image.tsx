import { ImageResponse } from "next/og";

export const alt = "MinBeregner.dk - Gratis online beregnere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 40%, #eef2ff 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              borderRadius: 20,
              position: "relative",
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 800, color: "white" }}>M</span>
          </div>
          <span style={{ fontSize: 48, fontWeight: 800, color: "#1e3a5f" }}>
            MinBeregner.dk
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 28, color: "#4b5563", margin: 0, marginBottom: 40 }}>
          33+ gratis online beregnere til danskere
        </p>

        {/* Calculator icons row */}
        <div style={{ display: "flex", gap: 24, fontSize: 40 }}>
          <span>💰</span>
          <span>⚖️</span>
          <span>🏦</span>
          <span>🧾</span>
          <span>💱</span>
          <span>➗</span>
          <span>📊</span>
          <span>🏠</span>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: 32,
            fontSize: 18,
            color: "#6b7280",
          }}
        >
          <span>🆓 100% Gratis</span>
          <span>🔒 Privat & Sikkert</span>
          <span>🇩🇰 2026-satser</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
