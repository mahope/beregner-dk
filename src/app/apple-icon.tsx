import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb, #4f46e5)",
          borderRadius: 36,
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          M
        </span>
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 32,
            width: 24,
            height: 24,
            background: "#fbbf24",
            borderRadius: 6,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
