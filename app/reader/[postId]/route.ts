import { BASE_URL, startButtons } from "@/app/constants";
import { getPostUrl } from "@/app/reader";
import { getFrameHtml, getFrameHtmlHead } from "@/app/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const id = params.postId;
  const ogUrl = await getPostUrl(params.postId);

  if (!ogUrl) {
    console.error("Not found");
    return new Response("Not found", {
      status: 404,
    });
  }

  const imageUrl = `${BASE_URL}/api/images/${id}/0`;
  const postUrl = `${BASE_URL}/api/reader/${id}/0`;
  const buttons = ogUrl
    ? startButtons.map((e) =>
        e.label === "Read Online" ? { ...e, target: ogUrl as string } : e
      )
    : [];

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Farcaster</title>
      ${getFrameHtmlHead(buttons, imageUrl, postUrl)}
      <script>typeof window !== "undefined" && window.location.replace("${ogUrl}");</script>
    </head>
  </html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
