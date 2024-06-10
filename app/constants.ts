export const BASE_URL =
  process.env.VERCEL_ENV === "development"
    ? "http://localhost:3000"
    : "https://fc-reader.vercel.app";

export const ASPECT_RATIO = "1.91:1";
export const IMG_WIDTH = 600;
export const IMG_HEIGHT = 400;
