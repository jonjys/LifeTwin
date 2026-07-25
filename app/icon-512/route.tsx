import { ImageResponse } from "next/og";

export const runtime = "edge";

/** The larger PWA manifest icon — a custom route (not the icon.tsx/
 *  apple-icon.tsx conventions, which are fixed-size) so the manifest can
 *  reference one real generated image at install-icon resolution. */
export async function GET() {
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
            width: 360,
            height: 360,
            borderRadius: 96,
            background: "rgba(0,232,255,0.12)",
            border: "8px solid #00E8FF",
          }}
        >
          <span style={{ color: "#00E8FF", fontSize: 160, fontWeight: 700 }}>AI</span>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
