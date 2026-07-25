import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** The browser-tab favicon — generated, not a hand-drawn asset, so it
 *  always matches the in-app "AI" mark exactly. */
export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <span style={{ color: "#00E8FF", fontSize: 15, fontWeight: 700 }}>AI</span>
      </div>
    ),
    { ...size }
  );
}
