import { ImageResponse } from "next/og";

export const alt = "MinBeregner.dk - Gratis online beregnere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Icon({ size: s, color, children }: { size: number; color: string; children: React.ReactNode }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {children}
    </svg>
  );
}

export default function OGImage() {
  const gray = "#4b5563";
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
          48+ gratis online beregnere til danskere
        </p>

        {/* Icon row — lucide icons */}
        <div style={{ display: "flex", gap: 24 }}>
          <Icon size={48} color={gray}>
            <rect width="20" height="12" x="2" y="6" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </Icon>
          <Icon size={48} color={gray}>
            <circle cx="12" cy="6" r="1" />
            <line x1="5" y1="12" x2="19" y2="12" />
            <circle cx="12" cy="18" r="1" />
          </Icon>
          <Icon size={48} color={gray}>
            <path d="M12 3v18" />
            <path d="m19 8 3 8a5 5 0 0 1-6 0zV7" />
            <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" />
            <path d="m5 8 3 8a5 5 0 0 1-6 0zV7" />
            <path d="M7 21h10" />
          </Icon>
          <Icon size={48} color={gray}>
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 17.5v-11" />
          </Icon>
          <Icon size={48} color={gray}>
            <path d="M10 18v-7" />
            <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
            <path d="M14 18v-7" />
            <path d="M18 18v-7" />
            <path d="M3 22h18" />
            <path d="M6 18v-7" />
          </Icon>
          <Icon size={48} color={gray}>
            <path d="M8 3 4 7l4 4" />
            <path d="M4 7h16" />
            <path d="m16 21 4-4-4-4" />
            <path d="M20 17H4" />
          </Icon>
          <Icon size={48} color={gray}>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </Icon>
          <Icon size={48} color={gray}>
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </Icon>
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
          <span>100% Gratis</span>
          <span>Privat &amp; Sikkert</span>
          <span>2026-satser</span>
        </div>
      </div>
    ),
    { ...size },
  );
}