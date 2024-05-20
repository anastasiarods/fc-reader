export const BASE_URL =
  process.env.VERCEL_ENV === "production"
    ? "https://fc-reader.vercel.app"
    : "https://3de4-185-145-245-223.ngrok-free.app";
export const CHAIN = process.env.VERCEL_ENV === "production" ? 8453 : 84532;
export const BASE_NFT_COLLECTION_ADDRESS =
  process.env.VERCEL_ENV === "production"
    ? ""
    : "0x6dfDb1126199259EecFbEC966C53d80aA49663c7";

export const startButtons = [
  {
    label: "Mint",
  },
  { label: "Read Online", action: "link" },
  { label: "Read Inline" },
];
export const readButtons = [
  { label: "<" },
  { label: "Read Online", action: "link" },
  { label: ">" },
];
