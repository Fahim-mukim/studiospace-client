import { ImageResponse } from "next/og";

export const alt = "StudioSpace — Find your creative space";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#F4F1E8",
          color: "#1B211F",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "80px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
            maxWidth: 720,
            position: "relative",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontFamily: "sans-serif",
              fontSize: 36,
              fontWeight: 600,
              gap: 16,
              letterSpacing: "-1.5px",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <g fill="#1B211F">
                <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" />
                <path d="M20.6 4.4c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L20.6 4.4Z" transform="rotate(60 24 24)" />
                <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(120 24 24)" />
                <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(180 24 24)" />
                <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(240 24 24)" />
                <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(300 24 24)" />
              </g>
            </svg>
            StudioSpace
          </div>
          <div
            style={{
              color: "#59664F",
              fontFamily: "sans-serif",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Room to make something
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 78,
              lineHeight: 1.02,
              letterSpacing: "-2px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Find your</span>
            <span>creative space.</span>
          </div>
        </div>
        <div
          style={{
            border: "2px solid #C66A45",
            borderRadius: "50%",
            height: 430,
            position: "absolute",
            right: -120,
            top: 100,
            width: 430,
          }}
        />
        <div
          style={{
            background: "#E5E8DF",
            borderRadius: "50%",
            height: 240,
            position: "absolute",
            right: 5,
            top: 195,
            width: 240,
          }}
        />
      </div>
    ),
    size,
  );
}
