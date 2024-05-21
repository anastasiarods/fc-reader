export const BASE_URL =
  process.env.VERCEL_ENV === "development"
    ? "http://localhost:3000"
    : "https://fc-reader.vercel.app";
