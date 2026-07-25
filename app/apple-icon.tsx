import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS "Add to Home Screen" icon — same generated mark as icon.tsx, just
 *  at Apple's expected 180×180 with a bit more breathing room. */
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
          background: "#050508",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 130,
            height: 130,
            borderRadius: 34,
            background: "rgba(0,232,255,0.12)",
            border: "4px solid #00E8FF",
          }}
        >
          <span style={{ color: "#00E8FF", fontSize: 56, fontWeight: 700 }}>AI</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
