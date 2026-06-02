import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kato Samuel — Full Stack & Mobile Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#09090b",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Orange glow */}
        <div
          style={{
            position: "absolute",
            right: -100,
            top: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(249,115,22,0.15)",
            filter: "blur(80px)",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span style={{ color: "#f97316", fontSize: 18, fontFamily: "monospace", letterSpacing: 4 }}>
              AVAILABLE FOR WORK
            </span>
          </div>

          <div style={{ display: "flex", fontSize: 72, fontWeight: 900, color: "white", lineHeight: 1.1 }}>
            Kato
            <span style={{ color: "#f97316", marginLeft: 20 }}>Samuel</span>
          </div>

          <div style={{ fontSize: 28, color: "#a1a1aa", marginTop: 8 }}>
            Full Stack &amp; Mobile Developer
          </div>

          <div style={{ fontSize: 20, color: "#71717a", marginTop: 4 }}>
            📍 Kampala, Uganda
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            {["Next.js", "Laravel", "Flutter", "Docker"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  color: "#f97316",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            right: 80,
            color: "#52525b",
            fontSize: 20,
            fontFamily: "monospace",
          }}
        >
          samueltechug.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
