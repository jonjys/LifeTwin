import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "OffertPro — AI Operating System för hantverkare";

/** The link-preview image for every share of the app — generated from
 *  the same brand mark and headline used on the landing page. */
export default async function OpengraphImage() {
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
          background: "#050508",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(0,232,255,0.12)",
              border: "3px solid #00E8FF",
              marginRight: 20,
            }}
          >
            <span style={{ color: "#00E8FF", fontSize: 28, fontWeight: 700 }}>AI</span>
          </div>
          <span style={{ color: "#EDEDF2", fontSize: 34, fontWeight: 600 }}>OffertPro</span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 54,
            fontWeight: 700,
            color: "#EDEDF2",
            maxWidth: 980,
            textAlign: "center",
          }}
        >
          <span>AI Operating System&nbsp;</span>
          <span style={{ color: "#00E8FF" }}>för hantverkare.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
