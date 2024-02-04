import { BASE_URL, startButtons } from "@/app/constants";
import { getPostUrl } from "@/app/reader";
import { generateFrameMetadata } from "@/app/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const id = params.postId;
  const post = await getPostUrl(params.postId);

  if (!post) {
    console.error("Not found");
    return new Response("Not found", {
      status: 404,
    });
  }

  const imageUrl = `${BASE_URL}/api/images/${id}/0`;
  const postUrl = `${BASE_URL}/api/reader/${id}/0`;
  const buttons = post ? startButtons : [];

  const metadata = generateFrameMetadata(buttons, imageUrl, postUrl);

  return new NextResponse(metadata, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
