import { IMG_HEIGHT, IMG_WIDTH } from "@/app/constants";
import { ImageResponse } from "@vercel/og";

export async function generateTextImage(text: string) {
  const res = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          fontSize: 22,
          fontWeight: 300,
        }}
      >
        <div style={{ paddingLeft: 24, paddingRight: 24 }}>{text}</div>
      </div>
    ),
    {
      width: IMG_WIDTH,
      height: IMG_HEIGHT,
    }
  );

  return res;
}

export async function generatePostImage(data: any) {
  let image = data?.twitterImage || data?.ogImage || "";
  const title = data?.ogTitle || data?.title;
  const byLine = data?.byline;

  if (image.endsWith(".webp")) {
    image = "";
  }

  const res = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              filter: "blur(3px)",
            }}
          >
            {image && (
              <img
                alt=""
                src={image}
                width={IMG_WIDTH}
                height={IMG_HEIGHT}
                style={{
                  minHeight: "100%",
                  minWidth: "100%",
                  objectFit: "cover",
                  overflow: "hidden",
                }}
              />
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        ></div>
        <div
          style={{
            paddingLeft: 24,
            paddingRight: 24,
            color: "#fff",
            textShadow: "#000 1px 0 4px",
            fontSize: 24,
            fontWeight: 400,
          }}
        >
          {title}
        </div>

        {byLine && (
          <div
            style={{
              paddingLeft: 24,
              paddingRight: 24,
              textShadow: "#000 1px 0 4px",
              fontSize: 16,
              fontWeight: 400,
              color: "rgba(255,255,255,1)",
            }}
          >
            {`· ${byLine}`}
          </div>
        )}
      </div>
    ),
    {
      width: IMG_WIDTH,
      height: IMG_HEIGHT,
    }
  );

  return res;
}
